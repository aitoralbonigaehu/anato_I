-- Apply after 0002. Service-only, distributed rate limits; no cleartext IPs are stored.
alter table public.pin_attempts add column if not exists reservation uuid;

create table public.pin_ip_limits (
  ip_key text primary key,
  hits integer not null,
  window_started timestamptz not null
);
alter table public.pin_ip_limits enable row level security;
revoke all on public.pin_ip_limits from public, anon, authenticated;
grant select, insert, update, delete on public.pin_ip_limits to service_role;
revoke all on public.user_progress, public.pin_attempts, public.pin_accounts, public.visits from public, anon, authenticated;
revoke all on public.visits_daily, public.visits_by_device from public, anon, authenticated;
revoke all on sequence public.visits_id_seq from public, anon, authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;
grant select, insert, update, delete on public.user_progress, public.pin_attempts, public.pin_accounts, public.visits to service_role;
grant select on public.visits_daily, public.visits_by_device to service_role;
grant usage, select on sequence public.visits_id_seq to service_role;

-- Each invocation locks the relevant rows and reserves an attempt before Auth is called.
-- A slow or failed Auth request therefore cannot allow concurrent guesses past the cap.
create function public.pin_reserve_attempt(p_ip_key text, p_name_key text, p_signin boolean, p_token uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  v_now timestamptz := clock_timestamp();
  v_ip public.pin_ip_limits%rowtype;
  v_name public.pin_attempts%rowtype;
begin
  insert into public.pin_ip_limits(ip_key, hits, window_started) values (p_ip_key, 0, v_now)
    on conflict (ip_key) do nothing;
  select * into v_ip from public.pin_ip_limits where ip_key = p_ip_key for update;
  if v_ip.window_started <= v_now - interval '10 minutes' then
    update public.pin_ip_limits set hits = 0, window_started = v_now where ip_key = p_ip_key;
    v_ip.hits := 0;
    v_ip.window_started := v_now;
  end if;
  if v_ip.hits >= 20 then
    return jsonb_build_object('allowed', false, 'retry_after', greatest(1, ceil(extract(epoch from (v_ip.window_started + interval '10 minutes' - v_now)))::integer));
  end if;
  update public.pin_ip_limits set hits = hits + 1 where ip_key = p_ip_key;
  if not p_signin then return jsonb_build_object('allowed', true); end if;

  insert into public.pin_attempts(name_key, fails, updated_at) values (p_name_key, 0, v_now)
    on conflict (name_key) do nothing;
  select * into v_name from public.pin_attempts where name_key = p_name_key for update;
  if v_name.locked_until is not null and v_name.locked_until > v_now then
    return jsonb_build_object('allowed', false, 'retry_after', greatest(1, ceil(extract(epoch from (v_name.locked_until - v_now)))::integer));
  end if;
  if v_name.locked_until is not null or v_name.updated_at <= v_now - interval '15 minutes' then
    v_name.fails := 0;
  end if;
  update public.pin_attempts set fails = v_name.fails + 1,
    locked_until = case when v_name.fails + 1 >= 5 then v_now + interval '15 minutes' else null end,
    updated_at = v_now, reservation = p_token where name_key = p_name_key;
  return jsonb_build_object('allowed', true);
end $$;

-- A successful attempt only clears a counter if no newer request reserved an attempt.
create function public.pin_complete_success(p_name_key text, p_token uuid)
returns void language sql security invoker set search_path = '' as $$
  delete from public.pin_attempts where name_key = p_name_key and reservation = p_token;
$$;
revoke all on function public.pin_reserve_attempt(text, text, boolean, uuid) from public, anon, authenticated;
revoke all on function public.pin_complete_success(text, uuid) from public, anon, authenticated;
grant execute on function public.pin_reserve_attempt(text, text, boolean, uuid) to service_role;
grant execute on function public.pin_complete_success(text, uuid) to service_role;

-- Also schedule deletion of old pin_ip_limits when pg_cron is configured, e.g.:
-- select cron.schedule('pin-ip-cleanup', '37 3 * * *', $$delete from public.pin_ip_limits where window_started < now() - interval '2 days'$$);
