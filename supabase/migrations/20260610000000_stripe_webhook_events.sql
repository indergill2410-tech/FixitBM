-- Stripe webhook idempotency: record processed event IDs so retried
-- deliveries can never double-apply credits, memberships, or payouts.
create table if not exists public.stripe_webhook_events (
  id text primary key, -- Stripe event id (evt_...)
  type text not null,
  processed_at timestamptz not null default now()
);

alter table public.stripe_webhook_events enable row level security;

-- Service role only; no client policies on purpose.
comment on table public.stripe_webhook_events is
  'Processed Stripe webhook event ids for idempotent reconciliation. Insert-before-process; unique violation means duplicate delivery.';

-- Optional retention helper: events older than 90 days can be purged by a cron.
create index if not exists stripe_webhook_events_processed_at_idx
  on public.stripe_webhook_events (processed_at);
