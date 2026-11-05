-- Study progress: time per stage and quiz answers, one row set per authenticated user.
create extension if not exists pgcrypto;

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic int not null,
  stage_id text not null,
  started_at timestamptz not null default now(),
  seconds int not null check (seconds >= 0)
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic int not null,
  question_id text not null,
  correct boolean not null,
  answered_at timestamptz not null default now()
);

create index if not exists study_sessions_user_topic on public.study_sessions (user_id, topic);
create index if not exists answers_user_topic on public.answers (user_id, topic);

alter table public.study_sessions enable row level security;
alter table public.answers enable row level security;

create policy "study_sessions: own rows select" on public.study_sessions
  for select using (auth.uid() = user_id);
create policy "study_sessions: own rows insert" on public.study_sessions
  for insert with check (auth.uid() = user_id);
create policy "study_sessions: own rows update" on public.study_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "study_sessions: own rows delete" on public.study_sessions
  for delete using (auth.uid() = user_id);

create policy "answers: own rows select" on public.answers
  for select using (auth.uid() = user_id);
create policy "answers: own rows insert" on public.answers
  for insert with check (auth.uid() = user_id);
create policy "answers: own rows update" on public.answers
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "answers: own rows delete" on public.answers
  for delete using (auth.uid() = user_id);

-- Per user and topic. security_invoker makes the view obey the RLS of the tables underneath (Postgres 15+),
-- so a user only ever sees their own aggregate rows.
create or replace view public.topic_progress
with (security_invoker = true) as
with t as (
  select user_id, topic, sum(seconds)::bigint as total_seconds
  from public.study_sessions
  group by user_id, topic
),
a as (
  select user_id, topic,
         count(*)::int as answers_count,
         count(*) filter (where correct)::int as correct_count
  from public.answers
  group by user_id, topic
)
select
  coalesce(t.user_id, a.user_id) as user_id,
  coalesce(t.topic, a.topic) as topic,
  coalesce(t.total_seconds, 0) as total_seconds,
  coalesce(a.answers_count, 0) as answers_count,
  coalesce(a.correct_count, 0) as correct_count,
  case when coalesce(a.answers_count, 0) = 0 then null
       else round(100.0 * a.correct_count / a.answers_count, 1)
  end as percent_correct
from t
full outer join a on a.user_id = t.user_id and a.topic = t.topic;

grant select on public.topic_progress to authenticated;
