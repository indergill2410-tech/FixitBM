-- Fixit247 production support tables.
-- Review before applying in Supabase SQL Editor.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'site',
  status text not null default 'subscribed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint newsletter_subscribers_email_unique unique (email),
  constraint newsletter_subscribers_status_check check (status in ('subscribed', 'unsubscribed'))
);

alter table public.newsletter_subscribers enable row level security;

-- Public users do not read newsletter records directly. Inserts are server-mediated through /api/newsletter.
revoke all on public.newsletter_subscribers from anon;
revoke all on public.newsletter_subscribers from authenticated;

create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers (status);
create index if not exists newsletter_subscribers_created_at_idx on public.newsletter_subscribers (created_at desc);

create or replace function public.set_newsletter_subscribers_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_newsletter_subscribers_updated_at on public.newsletter_subscribers;
create trigger set_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row
execute function public.set_newsletter_subscribers_updated_at();
