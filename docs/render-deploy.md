# Render Deploy Checklist

Use this after the final local checks pass and the deployment is approved.

## Web service

Create a Render Web Service from the GitHub repo.

```text
Runtime: Node
Build command: npm ci && npm run build
Start command: npm run start -- -p $PORT
```

## Required environment variables

Paste these in Render Environment. Never paste server secrets into browser code.

```env
NEXT_PUBLIC_SUPABASE_URL=https://gmmxioltehahaqbgpzpv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
CRON_SECRET=
ADMIN_BOOTSTRAP_SECRET=
ALLOW_DEMO_SEED=false
```

Billing is intentionally disabled until Stripe is configured:

```env
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_FIXIT_PLUS_HOME=
STRIPE_PRICE_FIXIT_PLUS_COMPLETE=
STRIPE_PRICE_TRADIE_LOCAL_PRO=
STRIPE_PRICE_TRADIE_EMERGENCY_PRO=
STRIPE_PRICE_TRADIE_GROWTH_PARTNER=
STRIPE_PRICE_CREDITS_STARTER=
STRIPE_PRICE_CREDITS_GROWTH=
STRIPE_PRICE_CREDITS_EMERGENCY=
STRIPE_PRICE_CREDITS_BUSINESS=
STRIPE_PRICE_CREDITS_AGENCY=
```

Optional integrations:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
```

## Cron job

Create a Render Cron Job for the 111-credit monthly tradie launch bonus.

```text
Schedule: once daily
Command:
curl -fsS -X GET "https://YOUR_RENDER_APP_URL/api/admin/bonus-renewals" -H "Authorization: Bearer $CRON_SECRET"
```

The endpoint only grants a renewal when the wallet is due, so daily is safe and avoids missing a renewal window.

## First admin

After deploy, create the first super admin with the bootstrap endpoint, then rotate `ADMIN_BOOTSTRAP_SECRET`.

```bash
curl -X POST "https://YOUR_RENDER_APP_URL/api/admin/bootstrap" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "you@example.com",
    "password": "StrongPasswordHere123!",
    "firstName": "Admin",
    "lastName": "User",
    "secret": "YOUR_ADMIN_BOOTSTRAP_SECRET"
  }'
```

## Smoke test

1. Open `/login` and sign in with a customer account.
2. Post a test job and confirm it appears in `/dashboard/customer/jobs`.
3. Sign in as a tradie and confirm 111 launch bonus credits are visible.
4. Claim a lead and confirm credits decrease.
5. Sign in as admin and confirm the job detail page shows status timeline, messages, audit activity, and assignment controls.
