alter table public.users
add column if not exists email_verified_at timestamptz;

update public.users app_user
set email_verified_at = auth_user.email_confirmed_at
from auth.users auth_user
where app_user.auth_id = auth_user.id
  and app_user.email_verified_at is null
  and auth_user.email_confirmed_at is not null;

create index if not exists users_email_verified_at_idx
on public.users (email_verified_at);
