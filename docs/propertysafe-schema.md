# PropertySafe Schema

PropertySafe is a separate product layer beside Safety & Readiness Checks.

It must not replace or rename:
- `safety_checks`
- `safety_check_items`
- `safety_check_recommendations`
- `home_protection_scores`

## Product Rule

Safety & Readiness Checks remain the booking, assignment, checklist, and report workflow.

PropertySafe is the longer-term property view built from real completed Safety Check data, saved property records, and customer-approved recommended fixes. It must never show fake reports, fake findings, or fake scores.

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

## Access Model

- Customers can read their own PropertySafe profiles, assessments, findings, recommendations, and events.
- Admin operations use the server-side Supabase secret key.
- Public users cannot create PropertySafe data.
- Fixers update Safety Check reports; PropertySafe sync is server-mediated after a real report is published.
