-- Account-level, opt-in study time. Keep the underlying tables outside the Data API.
create schema study_analytics;
revoke all on schema study_analytics from public, anon, authenticated, service_role;
grant usage on schema study_analytics to authenticated;

create table study_analytics.preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  enabled_at timestamptz not null default statement_timestamp(),
  last_counted_at timestamptz
);

create table study_analytics.daily_usage (
  user_id uuid not null references study_analytics.preferences (user_id) on delete cascade,
  day date not null,
  active_ms integer not null check (active_ms between 1 and 90000000), -- 25-hour Madrid day
  primary key (user_id, day)
);

create index daily_usage_day_idx on study_analytics.daily_usage (day);
alter table study_analytics.preferences enable row level security;
alter table study_analytics.daily_usage enable row level security;
revoke all on all tables in schema study_analytics from public, anon, authenticated, service_role;

create function study_analytics.get_preference(p_expected_user uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select coalesce((select auth.uid()) = p_expected_user, false)
    and coalesce((select auth.jwt()) ->> 'is_anonymous', 'false') = 'false'
    and exists (select 1 from study_analytics.preferences where user_id = p_expected_user);
$$;

create function study_analytics.set_preference(p_expected_user uuid, p_enabled boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null or v_user is distinct from p_expected_user
      or coalesce(auth.jwt() ->> 'is_anonymous', 'false') <> 'false' then
    return false;
  end if;

  if p_enabled is null then
    raise exception 'Missing usage preference' using errcode = '22023';
  end if;

  if p_enabled then
    insert into study_analytics.preferences (user_id) values (v_user)
    on conflict (user_id) do nothing;
  else
    -- Cascades to the totals. This uses the same preference row lock as each heartbeat.
    delete from study_analytics.preferences where user_id = v_user;
  end if;
  return p_enabled;
end;
$$;

create function study_analytics.record_usage(p_expected_user uuid, p_elapsed_ms integer)
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_observed_at timestamptz := statement_timestamp();
  v_preference study_analytics.preferences%rowtype;
  v_interval_start timestamptz;
begin
  if v_user is null or v_user is distinct from p_expected_user
      or coalesce(auth.jwt() ->> 'is_anonymous', 'false') <> 'false' then
    return false;
  end if;

  if p_elapsed_ms is null or p_elapsed_ms <= 0 then
    raise exception 'Invalid study usage duration' using errcode = '22023';
  end if;

  select * into v_preference from study_analytics.preferences where user_id = v_user for update;
  if not found then
    return false;
  end if;

  -- Trim overlapping samples from the same account using a single server-side cursor.
  v_interval_start := greatest(
    v_observed_at - least(p_elapsed_ms, 20000) * interval '1 millisecond',
    v_preference.enabled_at,
    v_preference.last_counted_at
  );
  if v_interval_start >= v_observed_at then
    return true;
  end if;

  -- The interval can cross at most one local midnight. Interpret midnight in Madrid,
  -- then calculate elapsed time between absolute timestamps so DST days work as well.
  with touched_days(day) as (
    select (v_interval_start at time zone 'Europe/Madrid')::date
    union
    select (v_observed_at at time zone 'Europe/Madrid')::date
  ), totals as (
    select day, floor(extract(epoch from (
      least(v_observed_at, (day + 1)::timestamp at time zone 'Europe/Madrid')
      - greatest(v_interval_start, day::timestamp at time zone 'Europe/Madrid')
    )) * 1000)::integer as active_ms
    from touched_days
  )
  insert into study_analytics.daily_usage (user_id, day, active_ms)
  select v_user, day, active_ms from totals where active_ms > 0
  on conflict (user_id, day) do update
    set active_ms = daily_usage.active_ms + excluded.active_ms;

  update study_analytics.preferences set last_counted_at = v_observed_at where user_id = v_user;
  return true;
end;
$$;

-- The public RPC wrappers use the caller's privileges. Only these authenticated-only
-- functions can access the implementation, which verifies the JWT subject on every call.
create function public.get_study_usage_preference(p_expected_user uuid)
returns boolean language sql stable security invoker set search_path = '' as $$
  select study_analytics.get_preference(p_expected_user);
$$;

create function public.set_study_usage_preference(p_expected_user uuid, p_enabled boolean)
returns boolean language sql security invoker set search_path = '' as $$
  select study_analytics.set_preference(p_expected_user, p_enabled);
$$;

create function public.record_study_usage(p_expected_user uuid, p_elapsed_ms integer)
returns boolean language sql security invoker set search_path = '' as $$
  select study_analytics.record_usage(p_expected_user, p_elapsed_ms);
$$;

revoke execute on all functions in schema study_analytics from public, anon, authenticated, service_role;
revoke execute on function public.get_study_usage_preference(uuid),
  public.set_study_usage_preference(uuid, boolean), public.record_study_usage(uuid, integer)
  from public, anon, authenticated, service_role;
grant execute on function study_analytics.get_preference(uuid), study_analytics.set_preference(uuid, boolean),
  study_analytics.record_usage(uuid, integer), public.get_study_usage_preference(uuid),
  public.set_study_usage_preference(uuid, boolean), public.record_study_usage(uuid, integer) to authenticated;

-- Keep the last 90 Madrid calendar days. Clear the overlap cursor when it is no longer useful.
create extension if not exists pg_cron with schema pg_catalog;
grant usage on schema cron to postgres;
grant all privileges on all tables in schema cron to postgres;
select cron.schedule('enbrioatlas-study-usage-retention', '0 22,23 * * *', $cleanup$
  update study_analytics.preferences set last_counted_at = null
    where last_counted_at < statement_timestamp() - interval '1 day';
  delete from study_analytics.daily_usage
    where day < (statement_timestamp() at time zone 'Europe/Madrid')::date - 89;
$cleanup$);
