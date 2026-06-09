create table if not exists public.voice_call_logs (
  id uuid primary key default gen_random_uuid(),
  call_sid text,
  from_number text,
  caller_name text,
  callback_number text,
  suburb_or_address text,
  issue text,
  urgency text,
  summary text,
  transcript text,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.voice_call_logs enable row level security;

create policy "Admins can read voice call logs" on public.voice_call_logs
  for select using (
    exists (
      select 1 from public.users u
      where u.id = auth.uid() and u.role in ('admin', 'super_admin')
    )
  );
