# Supabase Schema Notes

This app intentionally keeps the current backend naming stable while the customer-facing product shifts to Fixit247
requests and Fixers.

Customer-facing words:
- Request
- Fixer
- Fixit Plus

Internal/backend words preserved for now:
- `jobs`
- `tradie`
- `tradie_profiles`
- `tradie_subscriptions`
- `tradie_credit_wallets`
- `/dashboard/tradie`

## Current Tables Expected

### users
Application users linked to Supabase Auth.

Expected columns include:
- `id`
- `auth_id`
- `email`
- `phone`
- `first_name`
- `last_name`
- `role`: `customer`, `tradie`, `admin`, `super_admin`
- `status`: `pending`, `active`, `suspended`
- `created_at`

### jobs
Current request table. Customer UI should say "requests"; backend remains `jobs`.

Expected columns include:
- `id`
- `public_reference`
- `customer_id`
- `type`: currently `home`, `road`, `scheduled`
- `category`
- `urgency`: `emergency`, `today`, `flexible`
- `title`
- `description`
- `danger_notes`
- `utilities_involved`
- `address`
- `suburb`
- `postcode`
- `state`
- `road_name`
- `road_direction`
- `landmark`
- `guest_name`
- `guest_phone`
- `guest_email`
- `preferred_contact_method`
- `consent_to_contact`
- `status`
- `credit_cost`
- `lead_claim_limit`
- `assigned_tradie_id`
- `created_at`

Current request lane mapping:
- `emergency_home` maps to `type = home`, `urgency = emergency`
- `emergency_road` maps to `type = road`, `urgency = emergency`
- `standard_trade_job` maps to `type = scheduled`, `urgency = today|flexible`
- `larger_project` maps to `type = scheduled`, `urgency = flexible`

Until a migration is added, `serviceLane`, timing, and budget are recorded in `description`.

Future-safe fields:
- `service_lane`
- `project_scope`
- `budget_range`
- `preferred_timeline`
- `is_emergency`
- `quote_required`
- `membership_upsell_shown`

### job_status_events
Timeline entries for requests.

Expected columns:
- `id`
- `job_id`
- `status`
- `title`
- `note`
- `created_by`
- `created_at`

### job_messages
Request conversation thread.

Expected columns:
- `id`
- `job_id`
- `sender_id`
- `sender_label`
- `body`
- `created_at`

### job_photos
Private request photo records.

Expected columns:
- `id`
- `job_id`
- `file_url`
- `file_name`
- `content_type`
- `created_at`

Storage bucket:
- `job-photos`

### saved_properties
Customer home/property records for Fixit Plus and emergency context.

### saved_vehicles
Customer vehicle records for Fixit Plus Complete and roadside context.

### memberships
Fixit Plus customer memberships.

Expected states:
- `inactive`
- `pending_activation`
- `active`
- `past_due`
- `cancelled`
- `expired`

Future production fields:
- `stripe_customer_id`
- `stripe_subscription_id`
- `activation_started_at`
- `activation_effective_at`
- `current_period_end`

### tradie_profiles
Internal Fixer business profiles.

Customer UI should call these providers "Fixers".

### tradie_subscriptions
Internal Fixer subscription records.

Plans:
- `starter`
- `local_pro`
- `emergency_pro`
- `growth_partner`

### tradie_credit_wallets
Fixer lead-credit wallet.

Launch rule:
- 111 bonus credits every month
- 6 months total
- available even on Free Starter

### credit_transactions
Ledger for paid credits, bonus credits, lead claims, and refunds.

### lead_claims
Tracks Fixer access to request leads.

### verification_documents
Fixer verification uploads and admin decisions.

Storage bucket:
- `verification-documents`

### reviews
Customer/Fixer ratings after completion.

### support_tickets
Support queue.

### disputes
Credit, lead-quality, and request disputes.

### audit_logs
Admin and operational audit events.

### newsletter_subscribers
Newsletter capture for blog, homepage, and launch updates.

Expected columns:
- `id`
- `email`
- `source`
- `status`: `subscribed`, `unsubscribed`
- `created_at`
- `updated_at`

Important constraints:
- unique `email`

Apply SQL:
- see `docs/supabase-ddl.sql`

## RLS Expectations

All public schema tables exposed through Supabase Data API should have RLS enabled.

General access model:
- Customers can read their own request records.
- Fixers can read claimed or assigned requests.
- Admin/super_admin server actions use the Supabase secret key.
- Public guest request creation is server-mediated only.
- Private storage files are accessed through signed URLs.

## Indexes And Constraints

Important indexes:
- `jobs.customer_id`
- `jobs.assigned_tradie_id`
- `jobs.status`
- `lead_claims.job_id`
- `lead_claims.tradie_id`
- `job_messages.job_id`
- `job_status_events.job_id`
- `job_photos.job_id`
- `verification_documents.tradie_id`
- `newsletter_subscribers.email`

Important unique constraints:
- one `tradie_credit_wallets` row per tradie
- one active/upsertable `tradie_subscriptions` row per tradie
- unique `lead_claims(job_id, tradie_id)`

## Production Notes

Do not rename backend tables during the Fixer copy rollout. Add aliases in UI first, then plan a formal migration only
after production data contracts are stable.

Stripe Checkout is live-ready, but membership activation and credit-pack fulfilment must only happen after verified
payment events are reconciled.
