-- Health Claim Checker (formerly CITE) — anonymous usage logging
-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
--
-- Fully anonymous: no user_id, no personal identifiers. Just enough to see
-- usage patterns (topic, category, verdict, country, paid vs free) and to
-- run the price-tier check (switches from £1.50 to £2.50 after 1,000 paid
-- dives). Migrated from CITE's own separate Supabase project into this one,
-- so there's one fewer project to maintain.
create table if not exists deep_dives (
  id              bigint generated always as identity primary key,
  topic_category  text,
  claim_category  text,
  verdict         text,
  is_paid         boolean not null default false,
  country_code    text,
  created_at      timestamptz not null default now()
);

alter table deep_dives enable row level security;

-- The checker is used anonymously (no login), so the anon key itself needs
-- to be able to log a check and read the paid-count for pricing. Nothing
-- sensitive lives in this table, so this is a deliberate exception to the
-- "anon can't touch anything" pattern used elsewhere in this project.
create policy "anon can log a check"
  on deep_dives for insert
  to anon
  with check (true);

create policy "anon can read for price-tier check"
  on deep_dives for select
  to anon
  using (true);
