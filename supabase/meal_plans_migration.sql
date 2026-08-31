-- The Menu — saved meal plan outputs
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Generated plans previously only existed in the page's memory — refresh,
-- log out, or navigate away without hitting "Print / Save PDF" and the plan
-- was gone. This table persists every generated plan to the user's account,
-- kept indefinitely (even past a lapsed subscription) so it can still
-- remind them what they're missing.
create table if not exists meal_plans (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  programme    text not null,
  plan_content text not null,
  calories     integer,
  protein      integer,
  created_at   timestamptz not null default now()
);

alter table meal_plans enable row level security;

create policy "select own meal plans"
  on meal_plans for select
  using (auth.uid() = user_id);

create policy "insert own meal plans"
  on meal_plans for insert
  with check (auth.uid() = user_id);
