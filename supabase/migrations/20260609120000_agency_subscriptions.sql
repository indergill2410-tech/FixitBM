-- PropertySafe agency subscriptions: tracks an agency's recurring PropertySafe
-- plan, reconciled from Stripe. One active subscription per agency.

create table if not exists public.agency_subscriptions (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  plan_code text not null,
  status text not null default 'inactive'
    check (status in ('inactive', 'pending_activation', 'active', 'past_due', 'cancelled')),
  price_cents integer,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists agency_subscriptions_agency_id_key on public.agency_subscriptions (agency_id);
create index if not exists agency_subscriptions_stripe_subscription_id_idx on public.agency_subscriptions (stripe_subscription_id);
create index if not exists agency_subscriptions_status_idx on public.agency_subscriptions (status);

-- Reuse the shared updated_at trigger if present in this database.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where p.proname = 'set_updated_at_timestamp' and n.nspname = 'public') then
    drop trigger if exists set_agency_subscriptions_updated_at on public.agency_subscriptions;
    create trigger set_agency_subscriptions_updated_at
      before update on public.agency_subscriptions
      for each row execute function public.set_updated_at_timestamp();
  end if;
end $$;

alter table public.agency_subscriptions enable row level security;

-- Agencies read their own subscription; admins read all. Writes are performed by
-- the service role (Stripe webhook / checkout), which bypasses RLS.
drop policy if exists agency_subscriptions_read on public.agency_subscriptions;
create policy agency_subscriptions_read on public.agency_subscriptions
  for select
  using (
    private.can_access_agency(agency_id)
    or private.current_app_user_role() in ('admin', 'super_admin')
  );
