-- Bone Density Challenge — scan scores (starting, 6-week, 3-month).
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Scores live on the enrolment row as
--   { "start": {"date": "...", "t_score": "..."}, "six_week": {...}, "three_month": {...} }
-- and members can only read and edit their own.
alter table back_to_it_enrolments
  add column if not exists scans jsonb not null default '{}'::jsonb;

drop policy if exists "update own back_to_it enrolment" on back_to_it_enrolments;
create policy "update own back_to_it enrolment"
  on back_to_it_enrolments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
