-- The Menu — saved targets + Food Log
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- nutrition_targets: one row per person. Whether they used the calculator
--   or typed in their own numbers (e.g. from a plan Nesse wrote them), the
--   result is saved here so The Menu and the Food Log both read the same
--   targets and nobody has to re-enter them.
-- food_log_entries: every food someone logs, already multiplied out for the
--   amount they ate (kcal / protein / fibre for that portion).
-- food_log_days: per-day flags — currently just "I trained today", which
--   lifts that day's calorie target to fuel the workout (same +275 kcal the
--   meal plans use on active days).

create table if not exists nutrition_targets (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  calories    integer not null check (calories between 1000 and 5000),
  protein     integer not null check (protein between 30 and 400),
  fibre       integer not null default 30 check (fibre between 10 and 80),
  source      text not null default 'custom' check (source in ('calculated', 'custom')),
  updated_at  timestamptz not null default now()
);

alter table nutrition_targets enable row level security;

create policy "select own nutrition targets" on nutrition_targets
  for select using (auth.uid() = user_id);
create policy "insert own nutrition targets" on nutrition_targets
  for insert with check (auth.uid() = user_id);
create policy "update own nutrition targets" on nutrition_targets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);


create table if not exists food_log_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  logged_on   date not null,
  meal        text not null check (meal in ('breakfast', 'lunch', 'dinner', 'snacks')),
  name        text not null check (char_length(name) between 1 and 200),
  amount      text,                       -- e.g. "1 serving (30g)", "150g"
  kcal        integer not null default 0 check (kcal between 0 and 5000),
  protein     numeric(6,1) not null default 0 check (protein between 0 and 500),
  fibre       numeric(6,1)          check (fibre between 0 and 200),  -- null = not known
  source      text not null default 'quick' check (source in ('plan', 'scan', 'search', 'basics', 'recent', 'quick')),
  barcode     text,
  created_at  timestamptz not null default now()
);

create index if not exists food_log_entries_user_day on food_log_entries (user_id, logged_on);

alter table food_log_entries enable row level security;

create policy "select own food log" on food_log_entries
  for select using (auth.uid() = user_id);
create policy "insert own food log" on food_log_entries
  for insert with check (auth.uid() = user_id);
create policy "update own food log" on food_log_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own food log" on food_log_entries
  for delete using (auth.uid() = user_id);


create table if not exists food_log_days (
  user_id     uuid not null references auth.users(id) on delete cascade,
  logged_on   date not null,
  trained     boolean not null default false,
  primary key (user_id, logged_on)
);

alter table food_log_days enable row level security;

create policy "select own food log days" on food_log_days
  for select using (auth.uid() = user_id);
create policy "insert own food log days" on food_log_days
  for insert with check (auth.uid() = user_id);
create policy "update own food log days" on food_log_days
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
