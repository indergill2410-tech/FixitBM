-- Add agency as a first-class account role before agency account tables depend on it.

alter type public.role_type add value if not exists 'agency';
