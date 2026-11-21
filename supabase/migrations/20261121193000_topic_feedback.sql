create table public.topic_feedback (
  submission_id uuid primary key,
  created_at timestamptz not null default now(),
  topic smallint not null check (topic between 1 and 19),
  clarity smallint not null check (clarity between 1 and 5),
  navigation smallint not null check (navigation between 1 and 5),
  comment text check (char_length(comment) <= 600),
  user_id uuid references auth.users(id) on delete cascade,
  account_name text,
  device text,
  os text,
  browser text,
  check (
    (user_id is not null and account_name is not null and device is null and os is null and browser is null)
    or (user_id is null and account_name is null and device is not null and os is not null and browser is not null)
  )
);
alter table public.topic_feedback enable row level security;
revoke all on public.topic_feedback from public, anon, authenticated;
grant select, insert on public.topic_feedback to service_role;
create index topic_feedback_user_id_idx on public.topic_feedback (user_id) where user_id is not null;
