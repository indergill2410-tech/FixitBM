-- Newsletter capture for public blog/homepage signup.
-- Restricted by default: public forms write through the server route, not direct browser access.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'site',
  status text not null default 'subscribed',
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_unique unique (email),
  constraint newsletter_subscribers_email_lowercase_check check (email = lower(email)),
  constraint newsletter_subscribers_status_check check (status in ('subscribed', 'unsubscribed', 'bounced'))
);

alter table public.newsletter_subscribers enable row level security;

revoke all on public.newsletter_subscribers from anon;
revoke all on public.newsletter_subscribers from authenticated;

create index if not exists newsletter_subscribers_status_idx
on public.newsletter_subscribers (status, created_at desc);

create index if not exists newsletter_subscribers_source_idx
on public.newsletter_subscribers (source, created_at desc);

create index if not exists newsletter_subscribers_email_lower_idx
on public.newsletter_subscribers (lower(email));

drop trigger if exists set_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger set_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row
execute function public.set_updated_at_timestamp();
