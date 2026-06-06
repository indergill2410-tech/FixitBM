-- Fixit247 Safety & Readiness Checks.
-- Additive only: keeps existing jobs/tradie backend contracts stable.

create table if not exists public.safety_checks (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  membership_id uuid references public.memberships(id) on delete set null,
  property_id uuid references public.saved_properties(id) on delete set null,
  assigned_fixer_id uuid references public.tradie_profiles(id) on delete set null,
  status text not null default 'booked',
  check_type text not null default 'home',
  preferred_window text,
  customer_notes text,
  scheduled_at timestamptz,
  completed_at timestamptz,
  next_due_at timestamptz,
  score_before integer,
  score_after integer,
  summary text,
  report_published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint safety_checks_status_check check (status in ('due', 'booked', 'assigned', 'completed', 'cancelled', 'overdue')),
  constraint safety_checks_type_check check (check_type in ('home', 'home_and_road', 'digital')),
  constraint safety_checks_score_before_check check (score_before is null or (score_before >= 0 and score_before <= 100)),
  constraint safety_checks_score_after_check check (score_after is null or (score_after >= 0 and score_after <= 100))
);

create table if not exists public.safety_check_items (
  id uuid primary key default gen_random_uuid(),
  safety_check_id uuid not null references public.safety_checks(id) on delete cascade,
  category text not null,
  label text not null,
  status text not null default 'not_checked',
  notes text,
  created_at timestamptz not null default now(),
  constraint safety_check_items_status_check check (status in ('ok', 'attention', 'recommended', 'not_checked'))
);

create table if not exists public.safety_check_photos (
  id uuid primary key default gen_random_uuid(),
  safety_check_id uuid not null references public.safety_checks(id) on delete cascade,
  file_url text not null,
  file_name text,
  content_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.safety_check_recommendations (
  id uuid primary key default gen_random_uuid(),
  safety_check_id uuid references public.safety_checks(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete cascade,
  property_id uuid references public.saved_properties(id) on delete set null,
  title text not null,
  category text,
  priority text not null default 'medium',
  description text,
  estimated_trade_type text,
  status text not null default 'recommended',
  linked_job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint safety_check_recommendations_priority_check check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint safety_check_recommendations_status_check check (status in ('recommended', 'quote_requested', 'converted_to_request', 'dismissed'))
);

create table if not exists public.home_protection_scores (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  property_id uuid references public.saved_properties(id) on delete set null,
  score integer not null,
  reason_summary text,
  calculated_at timestamptz not null default now(),
  constraint home_protection_scores_score_check check (score >= 0 and score <= 100)
);

alter table public.safety_checks enable row level security;
alter table public.safety_check_items enable row level security;
alter table public.safety_check_photos enable row level security;
alter table public.safety_check_recommendations enable row level security;
alter table public.home_protection_scores enable row level security;

revoke all on public.safety_checks from anon;
revoke all on public.safety_check_items from anon;
revoke all on public.safety_check_photos from anon;
revoke all on public.safety_check_recommendations from anon;
revoke all on public.home_protection_scores from anon;

grant select on public.safety_checks to authenticated;
grant select on public.safety_check_items to authenticated;
grant select on public.safety_check_photos to authenticated;
grant select on public.safety_check_recommendations to authenticated;
grant select on public.home_protection_scores to authenticated;

create index if not exists safety_checks_customer_id_idx on public.safety_checks (customer_id);
create index if not exists safety_checks_assigned_fixer_id_idx on public.safety_checks (assigned_fixer_id);
create index if not exists safety_checks_status_idx on public.safety_checks (status);
create index if not exists safety_checks_next_due_at_idx on public.safety_checks (next_due_at);
create index if not exists safety_check_items_check_id_idx on public.safety_check_items (safety_check_id);
create index if not exists safety_check_photos_check_id_idx on public.safety_check_photos (safety_check_id);
create index if not exists safety_check_recommendations_customer_id_idx on public.safety_check_recommendations (customer_id);
create index if not exists safety_check_recommendations_check_id_idx on public.safety_check_recommendations (safety_check_id);
create index if not exists safety_check_recommendations_status_idx on public.safety_check_recommendations (status);
create index if not exists home_protection_scores_customer_id_idx on public.home_protection_scores (customer_id, calculated_at desc);

create or replace function public.set_updated_at_timestamp()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_safety_checks_updated_at on public.safety_checks;
create trigger set_safety_checks_updated_at
before update on public.safety_checks
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_safety_check_recommendations_updated_at on public.safety_check_recommendations;
create trigger set_safety_check_recommendations_updated_at
before update on public.safety_check_recommendations
for each row
execute function public.set_updated_at_timestamp();

drop policy if exists customers_read_own_safety_checks on public.safety_checks;
create policy customers_read_own_safety_checks
on public.safety_checks
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = safety_checks.customer_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists assigned_fixers_read_safety_checks on public.safety_checks;
create policy assigned_fixers_read_safety_checks
on public.safety_checks
for select
to authenticated
using (
  exists (
    select 1
    from public.tradie_profiles fixer
    join public.users app_user on app_user.id = fixer.user_id
    where fixer.id = safety_checks.assigned_fixer_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_safety_check_items on public.safety_check_items;
create policy customers_read_own_safety_check_items
on public.safety_check_items
for select
to authenticated
using (
  exists (
    select 1
    from public.safety_checks safety_check
    join public.users app_user on app_user.id = safety_check.customer_id
    where safety_check.id = safety_check_items.safety_check_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists assigned_fixers_read_safety_check_items on public.safety_check_items;
create policy assigned_fixers_read_safety_check_items
on public.safety_check_items
for select
to authenticated
using (
  exists (
    select 1
    from public.safety_checks safety_check
    join public.tradie_profiles fixer on fixer.id = safety_check.assigned_fixer_id
    join public.users app_user on app_user.id = fixer.user_id
    where safety_check.id = safety_check_items.safety_check_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_safety_check_photos on public.safety_check_photos;
create policy customers_read_own_safety_check_photos
on public.safety_check_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.safety_checks safety_check
    join public.users app_user on app_user.id = safety_check.customer_id
    where safety_check.id = safety_check_photos.safety_check_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists assigned_fixers_read_safety_check_photos on public.safety_check_photos;
create policy assigned_fixers_read_safety_check_photos
on public.safety_check_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.safety_checks safety_check
    join public.tradie_profiles fixer on fixer.id = safety_check.assigned_fixer_id
    join public.users app_user on app_user.id = fixer.user_id
    where safety_check.id = safety_check_photos.safety_check_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_safety_check_recommendations on public.safety_check_recommendations;
create policy customers_read_own_safety_check_recommendations
on public.safety_check_recommendations
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = safety_check_recommendations.customer_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_home_protection_scores on public.home_protection_scores;
create policy customers_read_own_home_protection_scores
on public.home_protection_scores
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = home_protection_scores.customer_id
      and app_user.auth_id = auth.uid()
  )
);
