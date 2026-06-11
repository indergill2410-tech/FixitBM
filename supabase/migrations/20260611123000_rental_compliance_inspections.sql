-- Rental compliance inspections.
-- Additive only: upgrades the Safety Check into a structured, category-based
-- minimum-standard compliance inspection with verdicts, certificates,
-- per-item photo evidence, and outbound CRM sync (PropertyMe / Property Tree).

-- 1. safety_checks: compliance fields ---------------------------------------
alter table public.safety_checks add column if not exists requested_categories text[] not null default '{}';
alter table public.safety_checks add column if not exists compliance_result text;
alter table public.safety_checks add column if not exists certificate_number text;
alter table public.safety_checks add column if not exists certificate_issued_at timestamptz;
alter table public.safety_checks add column if not exists inspector_name text;
alter table public.safety_checks add column if not exists inspector_licence_no text;
alter table public.safety_checks add column if not exists category_results jsonb not null default '{}'::jsonb;

alter table public.safety_checks drop constraint if exists safety_checks_compliance_result_check;
alter table public.safety_checks add constraint safety_checks_compliance_result_check
  check (compliance_result is null or compliance_result in ('pass', 'fail', 'action_required', 'not_applicable'));

-- Widen check_type to cover the bookable rental compliance categories.
alter table public.safety_checks drop constraint if exists safety_checks_type_check;
alter table public.safety_checks add constraint safety_checks_type_check
  check (check_type in (
    'home', 'home_and_road', 'digital',
    'rental_compliance', 'smoke_alarm', 'gas', 'electrical', 'minimum_standards', 'pool_spa'
  ));

create unique index if not exists safety_checks_certificate_number_idx
  on public.safety_checks (certificate_number) where certificate_number is not null;

-- 2. safety_check_items: per-item compliance verdict + category key ----------
alter table public.safety_check_items drop constraint if exists safety_check_items_status_check;
alter table public.safety_check_items add constraint safety_check_items_status_check
  check (status in ('ok', 'attention', 'recommended', 'not_checked', 'pass', 'fail', 'action_required', 'na'));
alter table public.safety_check_items add column if not exists category_key text;
alter table public.safety_check_items add column if not exists is_critical boolean not null default false;

-- 3. safety_check_photos: per-item linkage + caption -------------------------
alter table public.safety_check_photos add column if not exists safety_check_item_id uuid references public.safety_check_items(id) on delete set null;
alter table public.safety_check_photos add column if not exists category_key text;
alter table public.safety_check_photos add column if not exists caption text;
create index if not exists safety_check_photos_item_id_idx on public.safety_check_photos (safety_check_item_id) where safety_check_item_id is not null;

-- Assigned Fixers must be able to upload (insert) photo evidence during a check.
drop policy if exists assigned_fixers_insert_safety_check_photos on public.safety_check_photos;
create policy assigned_fixers_insert_safety_check_photos
on public.safety_check_photos
for insert
to authenticated
with check (
  exists (
    select 1
    from public.safety_checks safety_check
    join public.tradie_profiles fixer on fixer.id = safety_check.assigned_fixer_id
    join public.users app_user on app_user.id = fixer.user_id
    where safety_check.id = safety_check_photos.safety_check_id
      and app_user.auth_id = auth.uid()
  )
);

-- 4. propertysafe_assessments: compliance types, result, certificate ---------
alter table public.propertysafe_assessments drop constraint if exists propertysafe_assessments_type_check;
alter table public.propertysafe_assessments add constraint propertysafe_assessments_type_check
  check (assessment_type in (
    'baseline', 'six_month', 'incident_follow_up', 'digital',
    'rental_compliance', 'smoke_alarm', 'gas', 'electrical', 'minimum_standards', 'pool_spa'
  ));
alter table public.propertysafe_assessments add column if not exists compliance_result text;
alter table public.propertysafe_assessments add column if not exists certificate_number text;
alter table public.propertysafe_assessments drop constraint if exists propertysafe_assessments_compliance_result_check;
alter table public.propertysafe_assessments add constraint propertysafe_assessments_compliance_result_check
  check (compliance_result is null or compliance_result in ('pass', 'fail', 'action_required', 'not_applicable'));

-- 5. audit actions -----------------------------------------------------------
alter type public.audit_action add value if not exists 'issue_compliance_certificate';
alter type public.audit_action add value if not exists 'crm_sync_compliance_report';
alter type public.audit_action add value if not exists 'update_crm_integration';

-- 6. CRM integrations + sync logs (PropertyMe / Property Tree) ---------------
create table if not exists public.crm_integrations (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  agency_id uuid references public.agency_profiles(id) on delete set null,
  provider text not null,
  api_key text,
  base_url text,
  account_id text,
  status text not null default 'active',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint crm_integrations_provider_check check (provider in ('property_me', 'property_tree')),
  constraint crm_integrations_status_check check (status in ('active', 'paused', 'error')),
  constraint crm_integrations_owner_provider_unique unique (owner_user_id, provider)
);

create table if not exists public.crm_sync_logs (
  id uuid primary key default gen_random_uuid(),
  integration_id uuid references public.crm_integrations(id) on delete set null,
  safety_check_id uuid references public.safety_checks(id) on delete set null,
  owner_user_id uuid references public.users(id) on delete set null,
  provider text not null,
  status text not null,
  request_payload jsonb,
  response_summary text,
  created_at timestamptz not null default now(),
  constraint crm_sync_logs_status_check check (status in ('success', 'skipped', 'error'))
);

alter table public.crm_integrations enable row level security;
alter table public.crm_sync_logs enable row level security;

revoke all on public.crm_integrations from anon;
revoke all on public.crm_sync_logs from anon;

grant select on public.crm_integrations to authenticated;
grant select on public.crm_sync_logs to authenticated;

create index if not exists crm_integrations_owner_user_id_idx on public.crm_integrations (owner_user_id);
create index if not exists crm_integrations_agency_id_idx on public.crm_integrations (agency_id) where agency_id is not null;
create index if not exists crm_sync_logs_safety_check_id_idx on public.crm_sync_logs (safety_check_id) where safety_check_id is not null;
create index if not exists crm_sync_logs_owner_user_id_idx on public.crm_sync_logs (owner_user_id, created_at desc);

drop trigger if exists set_crm_integrations_updated_at on public.crm_integrations;
create trigger set_crm_integrations_updated_at
before update on public.crm_integrations
for each row
execute function public.set_updated_at_timestamp();

-- The api_key is sensitive: never expose the key column to API selects.
-- Reads of integration metadata are owner-scoped; writes go through the
-- service role in server actions.
drop policy if exists owners_read_own_crm_integrations on public.crm_integrations;
create policy owners_read_own_crm_integrations
on public.crm_integrations
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = crm_integrations.owner_user_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists owners_read_own_crm_sync_logs on public.crm_sync_logs;
create policy owners_read_own_crm_sync_logs
on public.crm_sync_logs
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = crm_sync_logs.owner_user_id
      and app_user.auth_id = auth.uid()
  )
);

-- 7. Private storage bucket for inspection photo evidence --------------------
insert into storage.buckets (id, name, public)
values ('safety-check-photos', 'safety-check-photos', false)
on conflict (id) do nothing;
