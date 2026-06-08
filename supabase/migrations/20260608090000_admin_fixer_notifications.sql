-- Admin dashboard notification types for Fixer recruitment onboarding.

alter type public.notification_type add value if not exists 'fixer_registered';
alter type public.notification_type add value if not exists 'fixer_onboarding_completed';
