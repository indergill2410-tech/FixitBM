-- PropertySafe agency workspace.
-- Additive only: agencies sit above current requests, saved properties, and PropertySafe records.

alter type public.audit_action add value if not exists 'create_agency_profile';
alter type public.audit_action add value if not exists 'update_agency_profile';
alter type public.audit_action add value if not exists 'create_agency_property';
alter type public.audit_action add value if not exists 'invite_agency_owner';
alter type public.audit_action add value if not exists 'update_agency_rules';

create table if not exists public.agency_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  abn text,
  phone text,
  service_area text,
  portfolio_size text not null default '1-10',
  status text not null default 'onboarding',
  onboarding_stage text not null default 'profile',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_profiles_owner_unique unique (owner_user_id),
  constraint agency_profiles_portfolio_size_check check (portfolio_size in ('1-10', '11-50', '51-150', '151-500', '500+')),
  constraint agency_profiles_status_check check (status in ('onboarding', 'active', 'paused', 'archived')),
  constraint agency_profiles_stage_check check (onboarding_stage in ('profile', 'properties', 'owners', 'rules', 'ready'))
);

create table if not exists public.agency_members (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  invite_email text,
  role text not null default 'property_manager',
  status text not null default 'invited',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_members_identity_check check (user_id is not null or invite_email is not null),
  constraint agency_members_role_check check (role in ('principal', 'property_manager', 'operations', 'viewer')),
  constraint agency_members_status_check check (status in ('invited', 'active', 'paused', 'removed'))
);

create table if not exists public.agency_managed_properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  saved_property_id uuid references public.saved_properties(id) on delete set null,
  propertysafe_profile_id uuid references public.propertysafe_profiles(id) on delete set null,
  label text not null default 'Managed property',
  address text not null,
  suburb text,
  postcode text,
  state text,
  owner_name text,
  owner_email text,
  management_status text not null default 'onboarding',
  risk_status text not null default 'clear',
  notes text,
  last_touch_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_managed_properties_management_status_check check (
    management_status in ('onboarding', 'active', 'needs_review', 'paused', 'archived')
  ),
  constraint agency_managed_properties_risk_status_check check (risk_status in ('clear', 'watch', 'needs_review', 'urgent'))
);

create table if not exists public.agency_owner_invites (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  managed_property_id uuid references public.agency_managed_properties(id) on delete cascade,
  owner_email text not null,
  owner_name text,
  access_level text not null default 'view_record',
  status text not null default 'invited',
  invited_by uuid references public.users(id) on delete set null,
  accepted_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_owner_invites_access_level_check check (access_level in ('view_record', 'request_work', 'manage_record')),
  constraint agency_owner_invites_status_check check (status in ('invited', 'active', 'paused', 'revoked'))
);

create table if not exists public.agency_maintenance_rules (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agency_profiles(id) on delete cascade,
  owner_update_policy text not null default 'urgent_and_recommended',
  default_contact_method text not null default 'email',
  after_hours_notes text,
  urgent_authority_notes text,
  preferred_trades_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint agency_maintenance_rules_agency_unique unique (agency_id),
  constraint agency_maintenance_rules_update_policy_check check (
    owner_update_policy in ('urgent_only', 'urgent_and_recommended', 'all_requests')
  ),
  constraint agency_maintenance_rules_contact_method_check check (default_contact_method in ('email', 'phone', 'sms'))
);

alter table public.agency_profiles enable row level security;
alter table public.agency_members enable row level security;
alter table public.agency_managed_properties enable row level security;
alter table public.agency_owner_invites enable row level security;
alter table public.agency_maintenance_rules enable row level security;

revoke all on public.agency_profiles from anon;
revoke all on public.agency_members from anon;
revoke all on public.agency_managed_properties from anon;
revoke all on public.agency_owner_invites from anon;
revoke all on public.agency_maintenance_rules from anon;

grant select, insert, update on public.agency_profiles to authenticated;
grant select, insert, update on public.agency_members to authenticated;
grant select, insert, update on public.agency_managed_properties to authenticated;
grant select, insert, update on public.agency_owner_invites to authenticated;
grant select, insert, update on public.agency_maintenance_rules to authenticated;

create index if not exists agency_profiles_owner_user_id_idx on public.agency_profiles (owner_user_id);
create index if not exists agency_profiles_status_idx on public.agency_profiles (status);
create index if not exists agency_members_agency_id_idx on public.agency_members (agency_id);
create index if not exists agency_members_user_id_idx on public.agency_members (user_id) where user_id is not null;
create index if not exists agency_members_invite_email_idx on public.agency_members (lower(invite_email)) where invite_email is not null;
create index if not exists agency_members_status_idx on public.agency_members (status);
create index if not exists agency_managed_properties_agency_id_idx on public.agency_managed_properties (agency_id);
create index if not exists agency_managed_properties_saved_property_id_idx on public.agency_managed_properties (saved_property_id) where saved_property_id is not null;
create index if not exists agency_managed_properties_propertysafe_profile_id_idx on public.agency_managed_properties (propertysafe_profile_id) where propertysafe_profile_id is not null;
create index if not exists agency_managed_properties_risk_status_idx on public.agency_managed_properties (risk_status);
create index if not exists agency_owner_invites_agency_id_idx on public.agency_owner_invites (agency_id);
create index if not exists agency_owner_invites_property_id_idx on public.agency_owner_invites (managed_property_id) where managed_property_id is not null;
create index if not exists agency_owner_invites_owner_email_idx on public.agency_owner_invites (lower(owner_email));
create index if not exists agency_maintenance_rules_agency_id_idx on public.agency_maintenance_rules (agency_id);

create unique index if not exists agency_members_agency_user_unique_idx
on public.agency_members (agency_id, user_id)
where user_id is not null;

create unique index if not exists agency_members_agency_invite_email_unique_idx
on public.agency_members (agency_id, lower(invite_email))
where invite_email is not null and user_id is null;

create unique index if not exists agency_owner_invites_property_email_unique_idx
on public.agency_owner_invites (agency_id, managed_property_id, lower(owner_email))
where managed_property_id is not null;

create unique index if not exists agency_owner_invites_agency_email_unique_idx
on public.agency_owner_invites (agency_id, lower(owner_email))
where managed_property_id is null;

drop trigger if exists set_agency_profiles_updated_at on public.agency_profiles;
create trigger set_agency_profiles_updated_at
before update on public.agency_profiles
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_agency_members_updated_at on public.agency_members;
create trigger set_agency_members_updated_at
before update on public.agency_members
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_agency_managed_properties_updated_at on public.agency_managed_properties;
create trigger set_agency_managed_properties_updated_at
before update on public.agency_managed_properties
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_agency_owner_invites_updated_at on public.agency_owner_invites;
create trigger set_agency_owner_invites_updated_at
before update on public.agency_owner_invites
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_agency_maintenance_rules_updated_at on public.agency_maintenance_rules;
create trigger set_agency_maintenance_rules_updated_at
before update on public.agency_maintenance_rules
for each row
execute function public.set_updated_at_timestamp();

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_app_user_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select app_user.id
  from public.users app_user
  where app_user.auth_id = (select auth.uid())
  limit 1
$$;

create or replace function private.current_app_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select app_user.role::text
  from public.users app_user
  where app_user.auth_id = (select auth.uid())
  limit 1
$$;

create or replace function private.can_access_agency(p_agency_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.agency_profiles agency
    where agency.id = p_agency_id
      and (
        agency.owner_user_id = private.current_app_user_id()
        or private.current_app_user_role() in ('admin', 'super_admin')
        or exists (
          select 1
          from public.agency_members member
          where member.agency_id = agency.id
            and member.user_id = private.current_app_user_id()
            and member.status = 'active'
        )
      )
  )
$$;

create or replace function private.can_manage_agency(p_agency_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.agency_profiles agency
    where agency.id = p_agency_id
      and (
        agency.owner_user_id = private.current_app_user_id()
        or private.current_app_user_role() in ('admin', 'super_admin')
        or exists (
          select 1
          from public.agency_members member
          where member.agency_id = agency.id
            and member.user_id = private.current_app_user_id()
            and member.status = 'active'
            and member.role in ('principal', 'property_manager', 'operations')
        )
      )
  )
$$;

create or replace function private.can_admin_agency(p_agency_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.agency_profiles agency
    where agency.id = p_agency_id
      and (
        agency.owner_user_id = private.current_app_user_id()
        or private.current_app_user_role() in ('admin', 'super_admin')
        or exists (
          select 1
          from public.agency_members member
          where member.agency_id = agency.id
            and member.user_id = private.current_app_user_id()
            and member.status = 'active'
            and member.role in ('principal', 'operations')
        )
      )
  )
$$;

revoke all on function private.current_app_user_id() from public, anon;
revoke all on function private.current_app_user_role() from public, anon;
revoke all on function private.can_access_agency(uuid) from public, anon;
revoke all on function private.can_manage_agency(uuid) from public, anon;
revoke all on function private.can_admin_agency(uuid) from public, anon;

grant execute on function private.current_app_user_id() to authenticated;
grant execute on function private.current_app_user_role() to authenticated;
grant execute on function private.can_access_agency(uuid) to authenticated;
grant execute on function private.can_manage_agency(uuid) to authenticated;
grant execute on function private.can_admin_agency(uuid) to authenticated;

drop policy if exists agency_profiles_select_access on public.agency_profiles;
create policy agency_profiles_select_access
on public.agency_profiles
for select
to authenticated
using (private.can_access_agency(id));

drop policy if exists agency_profiles_insert_owner on public.agency_profiles;
create policy agency_profiles_insert_owner
on public.agency_profiles
for insert
to authenticated
with check (owner_user_id = private.current_app_user_id() and private.current_app_user_role() in ('customer', 'admin', 'super_admin'));

drop policy if exists agency_profiles_update_owner_or_principal on public.agency_profiles;
create policy agency_profiles_update_owner_or_principal
on public.agency_profiles
for update
to authenticated
using (private.can_admin_agency(id))
with check (private.can_admin_agency(id));

drop policy if exists agency_members_select_access on public.agency_members;
create policy agency_members_select_access
on public.agency_members
for select
to authenticated
using (private.can_access_agency(agency_id));

drop policy if exists agency_members_write_control on public.agency_members;
create policy agency_members_write_control
on public.agency_members
for all
to authenticated
using (private.can_admin_agency(agency_id))
with check (private.can_admin_agency(agency_id));

drop policy if exists agency_managed_properties_select_access on public.agency_managed_properties;
create policy agency_managed_properties_select_access
on public.agency_managed_properties
for select
to authenticated
using (
  private.can_access_agency(agency_id)
  or exists (
    select 1
    from public.agency_owner_invites owner_invite
    join public.users app_user on app_user.id = owner_invite.accepted_user_id
    where owner_invite.managed_property_id = agency_managed_properties.id
      and owner_invite.status = 'active'
      and app_user.auth_id = (select auth.uid())
  )
);

drop policy if exists agency_managed_properties_write_control on public.agency_managed_properties;
create policy agency_managed_properties_write_control
on public.agency_managed_properties
for all
to authenticated
using (private.can_manage_agency(agency_id))
with check (private.can_manage_agency(agency_id));

drop policy if exists agency_owner_invites_select_access on public.agency_owner_invites;
create policy agency_owner_invites_select_access
on public.agency_owner_invites
for select
to authenticated
using (
  private.can_access_agency(agency_id)
  or exists (
    select 1
    from public.users app_user
    where app_user.id = agency_owner_invites.accepted_user_id
      and app_user.auth_id = (select auth.uid())
  )
);

drop policy if exists agency_owner_invites_write_control on public.agency_owner_invites;
create policy agency_owner_invites_write_control
on public.agency_owner_invites
for all
to authenticated
using (private.can_manage_agency(agency_id))
with check (private.can_manage_agency(agency_id));

drop policy if exists agency_maintenance_rules_select_access on public.agency_maintenance_rules;
create policy agency_maintenance_rules_select_access
on public.agency_maintenance_rules
for select
to authenticated
using (private.can_access_agency(agency_id));

drop policy if exists agency_maintenance_rules_write_control on public.agency_maintenance_rules;
create policy agency_maintenance_rules_write_control
on public.agency_maintenance_rules
for all
to authenticated
using (private.can_admin_agency(agency_id))
with check (private.can_admin_agency(agency_id));
