-- EnbrioAtlas: accounts (saved progress), PIN sign-in attempts, and visits.
-- Replaces 0001_progress.sql (never applied; that design was dropped). Run this on a fresh project.

-- 1. Saved progress: one JSON document per user (the app merges it with the browser's copy).
create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now(),
  constraint user_progress_size check (pg_column_size(data) < 2000000)
);

alter table public.user_progress enable row level security;

create policy "own progress: read"   on public.user_progress for select to authenticated using (auth.uid() = user_id);
create policy "own progress: insert" on public.user_progress for insert to authenticated with check (auth.uid() = user_id);
create policy "own progress: update" on public.user_progress for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own progress: delete" on public.user_progress for delete to authenticated using (auth.uid() = user_id);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists user_progress_touch on public.user_progress;
create trigger user_progress_touch before update on public.user_progress
  for each row execute function public.touch_updated_at();

-- 2. Name + PIN accounts: the name registry and the failed-attempt counters.
--    Only the server (service role) touches these tables: RLS on, no policies.
create table if not exists public.pin_accounts (
  name_key   text primary key,               -- nameKey(name): lowercase, no accents, spaces → '-'
  user_id    uuid not null unique references auth.users (id) on delete cascade,
  name       text not null,                  -- the name as the student wrote it
  created_at timestamptz not null default now()
);
alter table public.pin_accounts enable row level security;

create table if not exists public.pin_attempts (
  name_key     text primary key,
  fails        int not null default 0,
  locked_until timestamptz,
  updated_at   timestamptz not null default now()
);
alter table public.pin_attempts enable row level security;

-- 3. Visits: one row per browser session. IP shortened (IPv4 a.b.c.0, IPv6 /48). Written only by the
--    server route /api/bisita with the service role; nobody reads it from the browser.
create table if not exists public.visits (
  id              bigint generated always as identity primary key,
  created_at      timestamptz not null default now(),
  ip_trunc        text,
  country         text,
  region          text,
  city            text,
  user_agent      text,
  browser         text,
  browser_version text,
  os              text,
  os_version      text,
  device          text check (device in ('desktop', 'tablet', 'mobile')),
  is_bot          boolean not null default false,
  language        text,
  languages       text,
  timezone        text,
  local_hour      smallint check (local_hour between 0 and 23),
  screen_w        int,
  screen_h        int,
  viewport_w      int,
  viewport_h      int,
  dpr             numeric(4, 2),
  touch_points    smallint,
  color_scheme    text,
  path            text,
  referrer        text,                      -- the referring site only (hostname), never the full URL
  signed_in       boolean not null default false
);
alter table public.visits enable row level security;
create index if not exists visits_created_at on public.visits (created_at desc);

-- Handy summaries for the dashboard (SQL Editor / Table editor). security_invoker: they obey RLS,
-- so only the service role and the dashboard can read them.
create or replace view public.visits_daily with (security_invoker = true) as
  select date_trunc('day', created_at)::date as day,
         count(*) filter (where not is_bot)  as visits,
         count(*) filter (where is_bot)      as bots,
         count(*) filter (where signed_in)   as signed_in
  from public.visits group by 1 order by 1 desc;

create or replace view public.visits_by_device with (security_invoker = true) as
  select device, os, browser, count(*) as visits
  from public.visits where not is_bot group by 1, 2, 3 order by 4 desc;

-- 4. Retention: visits older than 13 months are deleted. Needs the pg_cron extension
--    (Dashboard → Database → Extensions → pg_cron). If you skip it, run the delete by hand now and then.
-- select cron.schedule('visits-retention', '17 3 * * *', $$delete from public.visits where created_at < now() - interval '13 months'$$);
-- select cron.schedule('pin-attempts-cleanup', '27 3 * * *', $$delete from public.pin_attempts where updated_at < now() - interval '2 days' and (locked_until is null or locked_until < now())$$);
