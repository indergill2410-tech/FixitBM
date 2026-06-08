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
NEXT_PUBLIC_APP_URL=https://fixit247.com.au
NEXT_PUBLIC_SUPABASE_URL=https://gmmxioltehahaqbgpzpv.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
CRON_SECRET=
ADMIN_BOOTSTRAP_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=Fixit247 <hello@fixit247.com.au>
FIXIT_ALERT_EMAIL=
FIXIT_SUPPORT_EMAIL=support@fixit247.com.au
EMAIL_VERIFICATION_SECRET=
ALLOW_DEMO_SEED=false
```

Checkout starts working when Stripe is configured:

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

Stripe Checkout, customer portal sessions, and webhook reconciliation are implemented for customer memberships, tradie
subscriptions, and credit packs. Verify the live webhook signing secret before accepting payments.

Optional integrations:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Transactional email

The app sends best-effort transactional email through Resend when `RESEND_API_KEY` is present.

Required for production:

- `RESEND_FROM_EMAIL`: verified sender, for example `Fixit247 <hello@fixit247.com.au>`.
- `FIXIT_ALERT_EMAIL`: comma-separated internal recipients for live request, support, Fixer, and PropertySafe alerts.
- `FIXIT_SUPPORT_EMAIL`: reply-to/support address shown in customer emails.

Email delivery should be verified with a real request, newsletter signup, support ticket, Safety Check booking, Fixer
signup, and PropertySafe invite.

Normal customer, agency, and Fixer signup creates a sign-in-capable Supabase Auth user and sends branded Fixit247
verification through Resend. This avoids the default Supabase confirmation email during standard onboarding.

Supabase Auth URL Configuration still matters for fallback auth links and any future passwordless/recovery flows. Set the
production Site URL to `https://fixit247.com.au` when the custom domain is live, never leave it at `http://localhost:3000`,
and add redirect allow-list entries for:

```text
https://fixit247.com.au/**
https://fixitbm.onrender.com/**
```

If Supabase Auth confirmation emails are enabled for fallback flows, replace the default Supabase template with branded
Fixit247 copy and point the confirmation link at
`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard`.

Suggested fallback Supabase confirmation subject:

```text
Verify your Fixit247 email
```

Suggested fallback Supabase confirmation body:

```html
<h2>Verify your Fixit247 email</h2>
<p>Confirm this email address so Fixit247 can keep your account, dashboard updates, and support messages connected.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">Verify email</a></p>
<p>If you did not create a Fixit247 account, you can ignore this email.</p>
```

First signup should open the dashboard immediately. Contact email verification is handled as a dashboard task through
Resend and `EMAIL_VERIFICATION_SECRET`; it does not block first dashboard onboarding.

Fixer recruitment uses this same email setup. New Fixer signups and completed Fixer onboarding profiles send admin alert
emails to `FIXIT_ALERT_EMAIL` first, then `ADMIN_ALERT_EMAIL`, then `RESEND_ALERT_EMAIL` if configured. The same events
also create admin dashboard notifications for active `admin` and `super_admin` users.

Protected production email test:

```bash
curl -X POST "https://fixit247.com.au/api/admin/email-test" \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com"}'
```

Recent delivery attempts appear in `/admin/settings` after the `email_delivery_logs` migration is applied.

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
3. Open `/dashboard/customer/safety-checks` and confirm the Safety Check eligibility state is honest.
4. Open `/dashboard/customer/membership` and confirm Fixit Plus Home/Complete show Safety Check benefits.
5. Sign in as a tradie and confirm 111 launch bonus credits are visible.
6. Confirm the Fixer dashboard shows the Safety Check appointments preparation card.
7. Claim a lead and confirm credits decrease.
8. Sign in as admin and confirm the job detail page shows status timeline, messages, audit activity, and assignment controls.
9. Open `/admin/safety-checks` and confirm it shows an operations shell without fake check data.
10. Open `/agency/login` and confirm a PropertySafe agency account routes to `/dashboard/agency`.
11. Open `/admin/settings` and confirm email configuration plus recent delivery logs are visible.

## Security notes

The app includes lightweight in-process rate limiting for newsletter signup and public request creation. This is useful
for basic abuse reduction, but production should still add platform-level protection such as Render firewall rules,
Cloudflare, or a durable rate-limit store if attack traffic becomes material.
