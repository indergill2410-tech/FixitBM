-- Lightweight first-party funnel analytics.
-- Insert-only via service role from /api/analytics; no client read access.

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  path text,
  session_id text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.analytics_events enable row level security;
revoke all on public.analytics_events from anon;
revoke all on public.analytics_events from authenticated;

create index if not exists analytics_events_event_idx on public.analytics_events (event, created_at desc);
create index if not exists analytics_events_session_idx on public.analytics_events (session_id, created_at desc) where session_id is not null;
