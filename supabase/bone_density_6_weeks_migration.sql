-- Bone Density Challenge — extend the tracker from 4 weeks to 6.
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- Without it, saving classes in weeks 5 and 6 is rejected by the old
-- "week_number between 1 and 4" check.
alter table back_to_it_progress
  drop constraint if exists back_to_it_progress_week_number_check;

alter table back_to_it_progress
  add constraint back_to_it_progress_week_number_check
  check (week_number between 1 and 6);
