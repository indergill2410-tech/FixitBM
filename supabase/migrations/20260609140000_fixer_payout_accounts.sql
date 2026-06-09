create table if not exists public.fixer_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  tradie_id uuid not null references public.tradie_profiles(id) on delete cascade,
  stripe_account_id text not null,
  status text not null default 'pending', -- pending | active | restricted | disabled
  payouts_enabled boolean not null default false,
  charges_enabled boolean not null default false,
  onboarding_complete boolean not null default false,
  country text not null default 'AU',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (tradie_id)
);

create table if not exists public.fixer_payouts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  tradie_id uuid not null references public.tradie_profiles(id) on delete cascade,
  stripe_account_id text not null,
  stripe_transfer_id text,
  amount_cents integer not null,
  currency text not null default 'aud',
  status text not null default 'pending', -- pending | processing | paid | failed
  note text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.fixer_payout_accounts enable row level security;
alter table public.fixer_payouts enable row level security;

create policy "Fixers can read own payout account" on public.fixer_payout_accounts
  for select using (
    tradie_id in (select id from public.tradie_profiles where user_id = auth.uid())
  );

create policy "Fixers can read own payouts" on public.fixer_payouts
  for select using (
    tradie_id in (select id from public.tradie_profiles where user_id = auth.uid())
  );
