-- Add purchaser email/name to the purchases table
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- purchases only ever stored the raw user_id, so there was no way to see
-- who actually bought something without cross-referencing auth.users
-- manually. This adds email + first name directly onto each row, and
-- backfills every existing purchase from the account data already on file.

alter table purchases add column if not exists user_email text;
alter table purchases add column if not exists user_name text;

update purchases p
set
  user_email = u.email,
  user_name  = u.raw_user_meta_data->>'first_name'
from auth.users u
where p.user_id = u.id
  and (p.user_email is null or p.user_name is null);
