-- PropertySafe shared access.
-- Additive only: keeps Safety & Readiness Checks and current PropertySafe records intact.

create table if not exists public.propertysafe_participants (
  id uuid primary key default gen_random_uuid(),
  propertysafe_profile_id uuid not null references public.propertysafe_profiles(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  invite_email text,
  relationship text not null default 'owner',
  agency_name text,
  can_view boolean not null default true,
  can_request_work boolean not null default false,
  can_manage_record boolean not null default false,
  can_view_financials boolean not null default false,
  status text not null default 'invited',
  notes text,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint propertysafe_participants_identity_check check (user_id is not null or invite_email is not null),
  constraint propertysafe_participants_relationship_check check (
    relationship in ('owner', 'landlord', 'agency_manager', 'property_manager', 'tenant_viewer', 'viewer')
  ),
  constraint propertysafe_participants_status_check check (status in ('invited', 'active', 'paused', 'revoked'))
);

alter table public.propertysafe_participants enable row level security;

revoke all on public.propertysafe_participants from anon;
grant select on public.propertysafe_participants to authenticated;

create index if not exists propertysafe_participants_profile_id_idx
on public.propertysafe_participants (propertysafe_profile_id);

create index if not exists propertysafe_participants_user_id_idx
on public.propertysafe_participants (user_id)
where user_id is not null;

create index if not exists propertysafe_participants_invite_email_idx
on public.propertysafe_participants (lower(invite_email))
where invite_email is not null;

create index if not exists propertysafe_participants_status_idx
on public.propertysafe_participants (status);

create unique index if not exists propertysafe_participants_profile_user_relationship_unique_idx
on public.propertysafe_participants (propertysafe_profile_id, user_id, relationship)
where user_id is not null;

create unique index if not exists propertysafe_participants_profile_invite_email_relationship_unique_idx
on public.propertysafe_participants (propertysafe_profile_id, lower(invite_email), relationship)
where invite_email is not null and user_id is null;

drop trigger if exists set_propertysafe_participants_updated_at on public.propertysafe_participants;
create trigger set_propertysafe_participants_updated_at
before update on public.propertysafe_participants
for each row
execute function public.set_updated_at_timestamp();

drop policy if exists participants_read_own_propertysafe_access on public.propertysafe_participants;
create policy participants_read_own_propertysafe_access
on public.propertysafe_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = propertysafe_participants.user_id
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_propertysafe_profiles on public.propertysafe_profiles;
create policy customers_read_own_propertysafe_profiles
on public.propertysafe_profiles
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = propertysafe_profiles.customer_id
      and app_user.auth_id = auth.uid()
  )
  or exists (
    select 1
    from public.propertysafe_participants participant
    join public.users app_user on app_user.id = participant.user_id
    where participant.propertysafe_profile_id = propertysafe_profiles.id
      and participant.status = 'active'
      and participant.can_view = true
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_propertysafe_assessments on public.propertysafe_assessments;
create policy customers_read_own_propertysafe_assessments
on public.propertysafe_assessments
for select
to authenticated
using (
  exists (
    select 1
    from public.propertysafe_profiles profile
    join public.users app_user on app_user.id = profile.customer_id
    where profile.id = propertysafe_assessments.propertysafe_profile_id
      and app_user.auth_id = auth.uid()
  )
  or exists (
    select 1
    from public.propertysafe_participants participant
    join public.users app_user on app_user.id = participant.user_id
    where participant.propertysafe_profile_id = propertysafe_assessments.propertysafe_profile_id
      and participant.status = 'active'
      and participant.can_view = true
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_propertysafe_findings on public.propertysafe_findings;
create policy customers_read_own_propertysafe_findings
on public.propertysafe_findings
for select
to authenticated
using (
  exists (
    select 1
    from public.propertysafe_assessments assessment
    join public.propertysafe_profiles profile on profile.id = assessment.propertysafe_profile_id
    join public.users app_user on app_user.id = profile.customer_id
    where assessment.id = propertysafe_findings.assessment_id
      and app_user.auth_id = auth.uid()
  )
  or exists (
    select 1
    from public.propertysafe_assessments assessment
    join public.propertysafe_participants participant on participant.propertysafe_profile_id = assessment.propertysafe_profile_id
    join public.users app_user on app_user.id = participant.user_id
    where assessment.id = propertysafe_findings.assessment_id
      and participant.status = 'active'
      and participant.can_view = true
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_propertysafe_recommendations on public.propertysafe_recommendations;
create policy customers_read_own_propertysafe_recommendations
on public.propertysafe_recommendations
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = propertysafe_recommendations.customer_id
      and app_user.auth_id = auth.uid()
  )
  or exists (
    select 1
    from public.propertysafe_assessments assessment
    join public.propertysafe_participants participant on participant.propertysafe_profile_id = assessment.propertysafe_profile_id
    join public.users app_user on app_user.id = participant.user_id
    where assessment.id = propertysafe_recommendations.assessment_id
      and participant.status = 'active'
      and participant.can_view = true
      and app_user.auth_id = auth.uid()
  )
  or exists (
    select 1
    from public.propertysafe_profiles profile
    join public.propertysafe_participants participant on participant.propertysafe_profile_id = profile.id
    join public.users app_user on app_user.id = participant.user_id
    where profile.property_id = propertysafe_recommendations.property_id
      and participant.status = 'active'
      and participant.can_view = true
      and app_user.auth_id = auth.uid()
  )
);

drop policy if exists customers_read_own_propertysafe_events on public.propertysafe_events;
create policy customers_read_own_propertysafe_events
on public.propertysafe_events
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = propertysafe_events.customer_id
      and app_user.auth_id = auth.uid()
  )
  or exists (
    select 1
    from public.propertysafe_participants participant
    join public.users app_user on app_user.id = participant.user_id
    where participant.propertysafe_profile_id = propertysafe_events.propertysafe_profile_id
      and participant.status = 'active'
      and participant.can_view = true
      and app_user.auth_id = auth.uid()
  )
);
