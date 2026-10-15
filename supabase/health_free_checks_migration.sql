-- Health Claim Checker: server-side backstop for free checks.
-- Stores only a salted hash of the visitor's IP address and the date, never the IP itself.
-- api/health-check.js allows up to 3 free checks per connection per day (the
-- one-a-day rule people see is enforced in the browser).

create table if not exists public.health_free_checks (
  id         bigint generated always as identity primary key,
  ip_hash    text not null,
  day        date not null,
  created_at timestamptz not null default now()
);

create index if not exists health_free_checks_ip_day_idx
  on public.health_free_checks (ip_hash, day);

-- Only the server (service role key) reads or writes this table.
alter table public.health_free_checks enable row level security;
