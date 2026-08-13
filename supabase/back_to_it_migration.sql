-- Back to It Challenge — weekly progress tracker
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Back to It is free to join (no Stripe purchase), so there's no purchases
-- row to read a start date from. This tiny enrolment table just records the
-- moment someone first opens the tracker, so their rolling 4 weeks has a
-- fixed reference point.
create table if not exists back_to_it_enrolments (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  started_at  timestamptz not null default now()
);

alter table back_to_it_enrolments enable row level security;

create policy "select own back_to_it enrolment"
  on back_to_it_enrolments for select
  using (auth.uid() = user_id);

create policy "insert own back_to_it enrolment"
  on back_to_it_enrolments for insert
  with check (auth.uid() = user_id);

create table if not exists back_to_it_progress (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  week_number             smallint not null check (week_number between 1 and 4),
  classes_logged          smallint not null default 0 check (classes_logged between 0 and 4),
  nutrition_days_logged   smallint not null default 0 check (nutrition_days_logged between 0 and 4),
  notes                   text,
  updated_at              timestamptz not null default now(),
  unique (user_id, week_number)
);

alter table back_to_it_progress enable row level security;

create policy "select own back_to_it progress"
  on back_to_it_progress for select
  using (auth.uid() = user_id);

create policy "insert own back_to_it progress"
  on back_to_it_progress for insert
  with check (auth.uid() = user_id);

create policy "update own back_to_it progress"
  on back_to_it_progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
