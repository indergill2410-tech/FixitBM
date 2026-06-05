# Admin Bootstrap

The app has no public admin demo login.

To create the first super admin, set:

```env
ADMIN_BOOTSTRAP_SECRET=
SUPABASE_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
```

Then call:

```bash
curl -X POST "https://YOUR_APP_URL/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "StrongPasswordHere123!",
    "firstName": "Admin",
    "lastName": "User",
    "secret": "YOUR_ADMIN_BOOTSTRAP_SECRET"
  }'
```

Rotate `ADMIN_BOOTSTRAP_SECRET` after successful setup.
