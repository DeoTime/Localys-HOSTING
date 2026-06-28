-- Localy Premium subscription support.
-- Adds the columns the Stripe subscription flow sets on success.
-- Safe to run multiple times.

alter table public.profiles
  add column if not exists is_premium boolean not null default false,
  add column if not exists premium_until timestamptz,
  add column if not exists stripe_customer_id text;

-- Quick lookup of premium members.
create index if not exists profiles_is_premium_idx on public.profiles (is_premium);
