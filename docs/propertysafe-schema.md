# PropertySafe Schema

PropertySafe is a separate product layer beside Safety & Readiness Checks.

It must not replace or rename:
- `safety_checks`
- `safety_check_items`
- `safety_check_recommendations`
- `home_protection_scores`

## Product Rule

Safety & Readiness Checks remain the booking, assignment, checklist, and report workflow.

PropertySafe is the longer-term property view built from real completed Safety Check data, saved property records, customer-approved recommended fixes, and agency-shared property access. It must never show fake reports, fake findings, or fake scores.

## Tables

### propertysafe_profiles

One active PropertySafe profile per customer property.

- `customer_id`
- `property_id`
- `membership_id`
- `status`: `draft`, `active`, `paused`, `archived`
- `protection_level`: `monitor`, `plus`, `complete`
- `last_assessed_at`
- `next_review_at`

### propertysafe_assessments

Published PropertySafe assessments created from real Safety Check reports.

- `propertysafe_profile_id`
- `source_safety_check_id`
- `assessment_type`: `baseline`, `six_month`, `incident_follow_up`, `digital`
- `status`: `draft`, `published`, `archived`
- `score_before`
- `score_after`
- `summary`
- `published_at`
- `next_review_at`

### propertysafe_findings

Visible concerns from a completed report.

- `assessment_id`
- `category`
- `title`
- `severity`: `low`, `medium`, `high`, `urgent`
- `status`: `open`, `watching`, `resolved`, `converted_to_request`, `dismissed`
- `linked_job_id`

### propertysafe_recommendations

Customer-facing next fixes and quote opportunities.

- `assessment_id`
- `customer_id`
- `property_id`
- `source_safety_check_recommendation_id`
- `title`
- `trade_type`
- `priority`
- `status`
- `linked_job_id`

### propertysafe_events

Timeline entries for PropertySafe activity.

### propertysafe_participants

Permission records for shared PropertySafe access.

- `propertysafe_profile_id`
- `user_id` or `invite_email`
- `relationship`: `owner`, `landlord`, `agency_manager`, `property_manager`, `tenant_viewer`, `viewer`
- `agency_name`
- `can_view`
- `can_request_work`
- `can_manage_record`
- `can_view_financials`
- `status`: `invited`, `active`, `paused`, `revoked`

This enables real estate agencies and property managers to manage a PropertySafe record while giving homeowners or landlords controlled visibility into the property they own.

### agency_profiles

The signed-in agency workspace for PropertySafe onboarding and portfolio operations.

- `owner_user_id`
- `name`
- `abn`
- `phone`
- `service_area`
- `portfolio_size`
- `status`
- `onboarding_stage`

### agency_members

Agency team access without changing the global `users.role` enum.

- `agency_id`
- `user_id` or `invite_email`
- `role`: `principal`, `property_manager`, `operations`, `viewer`
- `status`: `invited`, `active`, `paused`, `removed`

### agency_managed_properties

The portfolio register used by agencies before, during, and after PropertySafe onboarding.

- `agency_id`
- `saved_property_id`
- `propertysafe_profile_id`
- `label`
- `address`
- `owner_name`
- `owner_email`
- `management_status`
- `risk_status`
- `notes`

### agency_owner_invites

Owner visibility prepared by an agency for a managed property.

- `agency_id`
- `managed_property_id`
- `owner_email`
- `owner_name`
- `access_level`: `view_record`, `request_work`, `manage_record`
- `status`: `invited`, `active`, `paused`, `revoked`

### agency_maintenance_rules

Operating rules for how the agency wants maintenance and owner updates handled.

- `agency_id`
- `owner_update_policy`
- `default_contact_method`
- `after_hours_notes`
- `urgent_authority_notes`
- `preferred_trades_notes`

## Access Model

- Customers can read their own PropertySafe profiles, assessments, findings, recommendations, and events.
- Homeowners and landlords can read PropertySafe records shared with them through `propertysafe_participants`.
- Property managers and agency users can be attached to a record as participants without changing the Safety Check tables.
- Agency dashboards manage the portfolio layer through `agency_*` tables. This is separate from completed Safety Check reports and explicit PropertySafe participant access.
- Shared access must be explicit per PropertySafe profile. No owner, tenant, or agency user should infer access from suburb, address, email domain, or role alone.
- Admin operations use the server-side Supabase secret key.
- Public users cannot create PropertySafe data.
- Fixers update Safety Check reports; PropertySafe sync is server-mediated after a real report is published.

## Admin Workflow

- `/admin/propertysafe` lists active PropertySafe records, participant counts, next review dates, and open recommendations.
- Admins can invite an owner, landlord, property manager, agency manager, tenant viewer, or viewer to one PropertySafe profile at a time.
- If the email already belongs to a Fixit247 user, access becomes active for that user.
- If the email does not yet belong to a user, an invited participant record is saved and the person can use that same email when creating an account.
- Invites are audited and emailed through the transactional email layer when Resend is configured.
