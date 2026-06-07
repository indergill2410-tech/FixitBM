-- First-class agency accounts and email delivery observability.
-- Additive: preserves customers, Fixers, Safety Checks, and existing PropertySafe agency workspace tables.

do $$
declare
  role_constraint record;
begin
  for role_constraint in
    select con.conname
    from pg_constraint con
    join pg_class rel on rel.oid = con.conrelid
    join pg_namespace nsp on nsp.oid = rel.relnamespace
    where nsp.nspname = 'public'
      and rel.relname = 'users'
      and con.contype = 'c'
      and pg_get_constraintdef(con.oid) ilike '%role%'
  loop
    execute format('alter table public.users drop constraint if exists %I', role_constraint.conname);
  end loop;
end $$;

alter table public.users
add constraint users_role_check
check (role in ('customer', 'agency', 'tradie', 'admin', 'super_admin'))
not valid;

alter table public.users validate constraint users_role_check;

alter type public.audit_action add value if not exists 'create_agency_account';
alter type public.audit_action add value if not exists 'send_email';

create table if not exists public.agency_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  agency_id uuid references public.agency_profiles(id) on delete set null,
  contact_role text not null default 'principal',
  status text not null default 'onboarding',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_accounts_user_unique unique (user_id),
  constraint agency_accounts_contact_role_check check (
    contact_role in ('principal', 'property_manager', 'operations', 'owner', 'landlord', 'other')
  ),
  constraint agency_accounts_status_check check (status in ('onboarding', 'active', 'paused', 'archived'))
);

create table if not exists public.email_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  recipient text not null,
  subject text not null,
  category text,
  status text not null default 'sent',
  provider text not null default 'resend',
  provider_message_id text,
  provider_status integer,
  error text,
  idempotency_key text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint email_delivery_logs_status_check check (status in ('sent', 'failed', 'skipped'))
);

alter table public.agency_accounts enable row level security;
alter table public.email_delivery_logs enable row level security;

revoke all on public.agency_accounts from anon;
revoke all on public.email_delivery_logs from anon;
revoke all on public.email_delivery_logs from authenticated;

grant select, insert, update on public.agency_accounts to authenticated;

create index if not exists agency_accounts_user_id_idx on public.agency_accounts (user_id);
create index if not exists agency_accounts_agency_id_idx on public.agency_accounts (agency_id) where agency_id is not null;
create index if not exists agency_accounts_status_idx on public.agency_accounts (status);
create index if not exists email_delivery_logs_created_at_idx on public.email_delivery_logs (created_at desc);
create index if not exists email_delivery_logs_status_idx on public.email_delivery_logs (status, created_at desc);
create index if not exists email_delivery_logs_category_idx on public.email_delivery_logs (category, created_at desc);
create index if not exists email_delivery_logs_recipient_idx on public.email_delivery_logs (lower(recipient));

drop trigger if exists set_agency_accounts_updated_at on public.agency_accounts;
create trigger set_agency_accounts_updated_at
before update on public.agency_accounts
for each row
execute function public.set_updated_at_timestamp();

drop policy if exists agency_accounts_select_own_or_admin on public.agency_accounts;
create policy agency_accounts_select_own_or_admin
on public.agency_accounts
for select
to authenticated
using (
  user_id = private.current_app_user_id()
  or private.current_app_user_role() in ('admin', 'super_admin')
  or (agency_id is not null and private.can_access_agency(agency_id))
);

drop policy if exists agency_accounts_insert_own_agency on public.agency_accounts;
create policy agency_accounts_insert_own_agency
on public.agency_accounts
for insert
to authenticated
with check (
  user_id = private.current_app_user_id()
  and private.current_app_user_role() in ('agency', 'admin', 'super_admin')
);

drop policy if exists agency_accounts_update_own_or_admin on public.agency_accounts;
create policy agency_accounts_update_own_or_admin
on public.agency_accounts
for update
to authenticated
using (
  user_id = private.current_app_user_id()
  or private.current_app_user_role() in ('admin', 'super_admin')
  or (agency_id is not null and private.can_admin_agency(agency_id))
)
with check (
  user_id = private.current_app_user_id()
  or private.current_app_user_role() in ('admin', 'super_admin')
  or (agency_id is not null and private.can_admin_agency(agency_id))
);

drop policy if exists email_delivery_logs_admin_read on public.email_delivery_logs;
create policy email_delivery_logs_admin_read
on public.email_delivery_logs
for select
to authenticated
using (private.current_app_user_role() in ('admin', 'super_admin'));

drop policy if exists agency_profiles_insert_owner on public.agency_profiles;
create policy agency_profiles_insert_owner
on public.agency_profiles
for insert
to authenticated
with check (
  owner_user_id = private.current_app_user_id()
  and private.current_app_user_role() in ('agency', 'admin', 'super_admin')
);
