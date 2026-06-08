-- Additive Fixer onboarding fields for the recruitment-focused dashboard flow.

alter table public.tradie_profiles
add column if not exists public_liability_insurance text not null default 'not_supplied',
add column if not exists years_experience integer,
add column if not exists services_description text,
add column if not exists agency_property_maintenance_interest boolean not null default false,
add column if not exists planned_maintenance_contracts_interest boolean not null default false;

alter table public.tradie_profiles
drop constraint if exists tradie_profiles_public_liability_insurance_check;

alter table public.tradie_profiles
add constraint tradie_profiles_public_liability_insurance_check
check (public_liability_insurance in ('yes', 'no', 'not_supplied'));

alter table public.tradie_profiles
drop constraint if exists tradie_profiles_years_experience_check;

alter table public.tradie_profiles
add constraint tradie_profiles_years_experience_check
check (years_experience is null or years_experience between 0 and 80);
