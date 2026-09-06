-- Health Claim Checker — monthly free-deep-dive credits for All Access members
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Tracks how many free deep dives a logged-in All Access member has used in
-- a given calendar month (month_key, e.g. '2026-09'). The actual entitlement
-- check (does this user have an active All Access subscription) is done
-- against the existing `purchases` table with programme_id = 'health-claim-checker'
-- — this table only tracks the redemption count, nothing else.
create table if not exists health_deepdive_credits (
  id          bigint generated always as identity primary key,
  user_id     uuid not null,
  month_key   text not null,
  used_count  int not null default 0,
  updated_at  timestamptz not null default now(),
  unique (user_id, month_key)
);

alter table health_deepdive_credits enable row level security;

-- Logged-in users can read their own remaining credits directly from the
-- client, same pattern as the purchases table elsewhere in this project.
create policy "users can read their own credit usage"
  on health_deepdive_credits for select
  to authenticated
  using (auth.uid() = user_id);

-- No insert/update policy for anon or authenticated — redemption is only
-- ever written server-side (api/health-deepdive.js) using the service role
-- key, after re-verifying entitlement and quota. This stops a user from
-- editing their own count directly via the client.
