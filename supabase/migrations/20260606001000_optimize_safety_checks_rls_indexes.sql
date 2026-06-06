-- Advisor follow-up for Safety Check indexes and RLS policy shape.

create index if not exists safety_checks_membership_id_idx on public.safety_checks (membership_id);
create index if not exists safety_checks_property_id_idx on public.safety_checks (property_id);
create index if not exists safety_check_recommendations_property_id_idx on public.safety_check_recommendations (property_id);
create index if not exists safety_check_recommendations_linked_job_id_idx on public.safety_check_recommendations (linked_job_id);
create index if not exists home_protection_scores_property_id_idx on public.home_protection_scores (property_id);

drop policy if exists customers_read_own_safety_checks on public.safety_checks;
drop policy if exists assigned_fixers_read_safety_checks on public.safety_checks;
create policy safety_checks_read_visible
on public.safety_checks
for select
to authenticated
using (
  exists (
    select 1
    from public.users app_user
    where app_user.id = safety_checks.customer_id
      and app_user.auth_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.tradie_profiles fixer
    join public.users app_user on app_user.id = fixer.user_id
    where fixer.id = safety_checks.assigned_fixer_id
      and app_user.auth_id = (select auth.uid())
  )
);

drop policy if exists customers_read_own_safety_check_items on public.safety_check_items;
drop policy if exists assigned_fixers_read_safety_check_items on public.safety_check_items;
create policy safety_check_items_read_visible
on public.safety_check_items
for select
to authenticated
using (
  exists (
    select 1
    from public.safety_checks safety_check
    join public.users app_user on app_user.id = safety_check.customer_id
    where safety_check.id = safety_check_items.safety_check_id
      and app_user.auth_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.safety_checks safety_check
    join public.tradie_profiles fixer on fixer.id = safety_check.assigned_fixer_id
    join public.users app_user on app_user.id = fixer.user_id
    where safety_check.id = safety_check_items.safety_check_id
      and app_user.auth_id = (select auth.uid())
  )
);

drop policy if exists customers_read_own_safety_check_photos on public.safety_check_photos;
drop policy if exists assigned_fixers_read_safety_check_photos on public.safety_check_photos;
create policy safety_check_photos_read_visible
on public.safety_check_photos
for select
to authenticated
using (
  exists (
    select 1
    from public.safety_checks safety_check
    join public.users app_user on app_user.id = safety_check.customer_id
    where safety_check.id = safety_check_photos.safety_check_id
      and app_user.auth_id = (select auth.uid())
  )
  or exists (
    select 1
    from public.safety_checks safety_check
    join public.tradie_profiles fixer on fixer.id = safety_check.assigned_fixer_id
    join public.users app_user on app_user.id = fixer.user_id
    where safety_check.id = safety_check_photos.safety_check_id
      and app_user.auth_id = (select auth.uid())
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
      and app_user.auth_id = (select auth.uid())
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
      and app_user.auth_id = (select auth.uid())
  )
);
