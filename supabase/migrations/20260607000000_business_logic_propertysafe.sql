-- Business-logic hardening for Fixit247.
-- Additive only: preserves existing request, Fixer, wallet, membership, and Safety Check tables.

alter type public.audit_action add value if not exists 'update_support_ticket_status';
alter type public.audit_action add value if not exists 'update_dispute_status';
alter type public.audit_action add value if not exists 'update_membership_status';
alter type public.audit_action add value if not exists 'change_safety_check_status';
alter type public.audit_action add value if not exists 'assign_safety_check_fixer';
alter type public.audit_action add value if not exists 'book_safety_check';
alter type public.audit_action add value if not exists 'convert_safety_check_recommendation';
alter type public.audit_action add value if not exists 'publish_safety_check_report';
alter type public.audit_action add value if not exists 'create_support_ticket';
alter type public.audit_action add value if not exists 'claim_lead';

create or replace function public.claim_lead_with_credits(
  p_job_id uuid,
  p_user_id uuid,
  p_match_score integer default 88
)
returns table (
  ok boolean,
  code text,
  message text,
  lead_claim_id uuid,
  paid_credits_spent integer,
  bonus_credits_spent integer,
  remaining_paid_credits integer,
  remaining_bonus_credits integer
)
language plpgsql
set search_path = public
as $$
declare
  v_tradie_id uuid;
  v_wallet record;
  v_job record;
  v_claim record;
  v_claim_count integer;
  v_credit_cost integer;
  v_bonus_available integer;
  v_paid_spend integer;
  v_bonus_spend integer;
begin
  select id
  into v_tradie_id
  from public.tradie_profiles
  where user_id = p_user_id;

  if v_tradie_id is null then
    return query select false, 'profile', 'Fixer profile was not found.', null::uuid, 0, 0, 0, 0;
    return;
  end if;

  select *
  into v_job
  from public.jobs
  where id = p_job_id
  for update;

  if v_job.id is null or v_job.assigned_tradie_id is not null or v_job.status not in ('received', 'matching') then
    return query select false, 'unavailable', 'This lead is no longer available.', null::uuid, 0, 0, 0, 0;
    return;
  end if;

  select *
  into v_claim
  from public.lead_claims
  where job_id = p_job_id
    and tradie_id = v_tradie_id
  for update;

  if v_claim.id is not null then
    return query select false, 'already_claimed', 'This lead is already in your account.', v_claim.id, 0, 0, 0, 0;
    return;
  end if;

  select count(*)::integer
  into v_claim_count
  from public.lead_claims
  where job_id = p_job_id
    and status in ('claimed', 'accepted');

  if v_claim_count >= v_job.lead_claim_limit then
    return query select false, 'full', 'This lead has reached its Fixer limit.', null::uuid, 0, 0, 0, 0;
    return;
  end if;

  select *
  into v_wallet
  from public.tradie_credit_wallets
  where tradie_id = v_tradie_id
  for update;

  if v_wallet.id is null then
    return query select false, 'credits', 'No credit wallet was found for this Fixer.', null::uuid, 0, 0, 0, 0;
    return;
  end if;

  v_credit_cost := greatest(coalesce(v_job.credit_cost, 0), 0);
  v_bonus_available := case
    when v_wallet.bonus_expires_at is not null and v_wallet.bonus_expires_at > now()
      then greatest(coalesce(v_wallet.bonus_balance, 0), 0)
    else 0
  end;

  if greatest(coalesce(v_wallet.balance, 0), 0) + v_bonus_available < v_credit_cost then
    return query select false, 'credits', 'More lead credits are needed to claim this lead.', null::uuid, 0, 0, coalesce(v_wallet.balance, 0), v_bonus_available;
    return;
  end if;

  v_paid_spend := least(greatest(coalesce(v_wallet.balance, 0), 0), v_credit_cost);
  v_bonus_spend := v_credit_cost - v_paid_spend;

  insert into public.lead_claims (
    job_id,
    tradie_id,
    status,
    match_score,
    credit_cost,
    credits_spent
  )
  values (
    p_job_id,
    v_tradie_id,
    'claimed',
    greatest(0, least(coalesce(p_match_score, 88), 100)),
    v_credit_cost,
    v_credit_cost
  )
  returning *
  into v_claim;

  update public.tradie_credit_wallets
  set
    balance = coalesce(balance, 0) - v_paid_spend,
    bonus_balance = case
      when v_bonus_spend > 0 then greatest(coalesce(bonus_balance, 0) - v_bonus_spend, 0)
      else coalesce(bonus_balance, 0)
    end,
    lifetime_used = coalesce(lifetime_used, 0) + v_credit_cost,
    updated_at = now()
  where id = v_wallet.id;

  insert into public.credit_transactions (
    wallet_id,
    type,
    amount,
    reason,
    job_id,
    created_by
  )
  values (
    v_wallet.id,
    'spend',
    -v_credit_cost,
    'Lead claimed (' || v_paid_spend || ' paid credits, ' || v_bonus_spend || ' bonus credits)',
    p_job_id,
    p_user_id
  );

  update public.jobs
  set
    status = 'matching',
    claimed_at = coalesce(claimed_at, now()),
    updated_at = now()
  where id = p_job_id;

  insert into public.audit_logs (
    actor_id,
    action,
    entity_type,
    entity_id,
    metadata
  )
  values (
    p_user_id,
    'claim_lead',
    'lead_claim',
    v_claim.id,
    jsonb_build_object(
      'jobId', p_job_id,
      'tradieId', v_tradie_id,
      'creditCost', v_credit_cost,
      'paidCreditsSpent', v_paid_spend,
      'bonusCreditsSpent', v_bonus_spend
    )
  );

  return query
  select
    true,
    'success',
    'Lead claimed.',
    v_claim.id,
    v_paid_spend,
    v_bonus_spend,
    coalesce(v_wallet.balance, 0) - v_paid_spend,
    case
      when v_bonus_available > 0 then greatest(v_bonus_available - v_bonus_spend, 0)
      else 0
    end;
exception
  when unique_violation then
    return query select false, 'already_claimed', 'This lead is already in your account.', null::uuid, 0, 0, 0, 0;
end;
$$;

revoke all on function public.claim_lead_with_credits(uuid, uuid, integer) from public;
revoke all on function public.claim_lead_with_credits(uuid, uuid, integer) from anon;
revoke all on function public.claim_lead_with_credits(uuid, uuid, integer) from authenticated;
grant execute on function public.claim_lead_with_credits(uuid, uuid, integer) to service_role;

create table if not exists public.propertysafe_profiles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete cascade,
  property_id uuid references public.saved_properties(id) on delete set null,
  membership_id uuid references public.memberships(id) on delete set null,
  status text not null default 'active',
  protection_level text not null default 'monitor',
  display_name text,
  last_assessed_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint propertysafe_profiles_status_check check (status in ('draft', 'active', 'paused', 'archived')),
  constraint propertysafe_profiles_level_check check (protection_level in ('monitor', 'plus', 'complete')),
  constraint propertysafe_profiles_customer_property_unique unique (customer_id, property_id)
);

create table if not exists public.propertysafe_assessments (
  id uuid primary key default gen_random_uuid(),
  propertysafe_profile_id uuid not null references public.propertysafe_profiles(id) on delete cascade,
  source_safety_check_id uuid references public.safety_checks(id) on delete set null,
  assessment_type text not null default 'six_month',
  status text not null default 'draft',
  score_before integer,
  score_after integer,
  summary text,
  published_at timestamptz,
  next_review_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint propertysafe_assessments_type_check check (assessment_type in ('baseline', 'six_month', 'incident_follow_up', 'digital')),
  constraint propertysafe_assessments_status_check check (status in ('draft', 'published', 'archived')),
  constraint propertysafe_assessments_score_before_check check (score_before is null or (score_before >= 0 and score_before <= 100)),
  constraint propertysafe_assessments_score_after_check check (score_after is null or (score_after >= 0 and score_after <= 100))
);

create table if not exists public.propertysafe_findings (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.propertysafe_assessments(id) on delete cascade,
  category text not null,
  title text not null,
  severity text not null default 'medium',
  notes text,
  status text not null default 'open',
  linked_job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint propertysafe_findings_severity_check check (severity in ('low', 'medium', 'high', 'urgent')),
  constraint propertysafe_findings_status_check check (status in ('open', 'watching', 'resolved', 'converted_to_request', 'dismissed'))
);

create table if not exists public.propertysafe_recommendations (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references public.propertysafe_assessments(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete cascade,
  property_id uuid references public.saved_properties(id) on delete set null,
  source_safety_check_recommendation_id uuid references public.safety_check_recommendations(id) on delete set null,
  title text not null,
  trade_type text,
  priority text not null default 'medium',
  description text,
  status text not null default 'recommended',
  linked_job_id uuid references public.jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint propertysafe_recommendations_priority_check check (priority in ('low', 'medium', 'high', 'urgent')),
  constraint propertysafe_recommendations_status_check check (status in ('recommended', 'quote_requested', 'converted_to_request', 'dismissed'))
);

create table if not exists public.propertysafe_events (
  id uuid primary key default gen_random_uuid(),
  propertysafe_profile_id uuid references public.propertysafe_profiles(id) on delete cascade,
  assessment_id uuid references public.propertysafe_assessments(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete cascade,
  event_type text not null,
  title text not null,
  details text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.propertysafe_profiles enable row level security;
alter table public.propertysafe_assessments enable row level security;
alter table public.propertysafe_findings enable row level security;
alter table public.propertysafe_recommendations enable row level security;
alter table public.propertysafe_events enable row level security;

revoke all on public.propertysafe_profiles from anon;
revoke all on public.propertysafe_assessments from anon;
revoke all on public.propertysafe_findings from anon;
revoke all on public.propertysafe_recommendations from anon;
revoke all on public.propertysafe_events from anon;

grant select on public.propertysafe_profiles to authenticated;
grant select on public.propertysafe_assessments to authenticated;
grant select on public.propertysafe_findings to authenticated;
grant select on public.propertysafe_recommendations to authenticated;
grant select on public.propertysafe_events to authenticated;

create index if not exists propertysafe_profiles_customer_id_idx on public.propertysafe_profiles (customer_id);
create index if not exists propertysafe_profiles_property_id_idx on public.propertysafe_profiles (property_id);
create index if not exists propertysafe_profiles_status_idx on public.propertysafe_profiles (status);
create index if not exists propertysafe_assessments_profile_id_idx on public.propertysafe_assessments (propertysafe_profile_id);
create index if not exists propertysafe_assessments_source_safety_check_id_idx on public.propertysafe_assessments (source_safety_check_id);
create unique index if not exists propertysafe_assessments_source_safety_check_unique_idx
on public.propertysafe_assessments (source_safety_check_id)
where source_safety_check_id is not null;
create index if not exists propertysafe_assessments_next_review_at_idx on public.propertysafe_assessments (next_review_at);
create index if not exists propertysafe_findings_assessment_id_idx on public.propertysafe_findings (assessment_id);
create index if not exists propertysafe_findings_status_idx on public.propertysafe_findings (status);
create index if not exists propertysafe_recommendations_customer_id_idx on public.propertysafe_recommendations (customer_id);
create index if not exists propertysafe_recommendations_property_id_idx on public.propertysafe_recommendations (property_id);
create index if not exists propertysafe_recommendations_source_idx on public.propertysafe_recommendations (source_safety_check_recommendation_id);
create index if not exists propertysafe_recommendations_status_idx on public.propertysafe_recommendations (status);
create index if not exists propertysafe_events_profile_id_idx on public.propertysafe_events (propertysafe_profile_id, created_at desc);
create index if not exists propertysafe_events_customer_id_idx on public.propertysafe_events (customer_id, created_at desc);

drop trigger if exists set_propertysafe_profiles_updated_at on public.propertysafe_profiles;
create trigger set_propertysafe_profiles_updated_at
before update on public.propertysafe_profiles
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_propertysafe_assessments_updated_at on public.propertysafe_assessments;
create trigger set_propertysafe_assessments_updated_at
before update on public.propertysafe_assessments
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_propertysafe_findings_updated_at on public.propertysafe_findings;
create trigger set_propertysafe_findings_updated_at
before update on public.propertysafe_findings
for each row
execute function public.set_updated_at_timestamp();

drop trigger if exists set_propertysafe_recommendations_updated_at on public.propertysafe_recommendations;
create trigger set_propertysafe_recommendations_updated_at
before update on public.propertysafe_recommendations
for each row
execute function public.set_updated_at_timestamp();

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
);
