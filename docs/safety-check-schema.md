# Fixit Plus Safety Check Schema Plan

This document describes the planned database support for Fixit Plus Safety & Readiness Checks.

Do not rename existing backend tables such as `jobs`, `tradie_profiles`, `tradie_subscriptions`, or `tradie_credit_wallets`.
Safety Check support should be added beside the current request system.

## Product Rules

- Safety Checks are included with Fixit Plus membership.
- Free users can access a digital safety checklist only.
- Paid members receive the first visual check on signup, then a 6-monthly check while active.
- Booking should become available after the 72-hour Fixit Plus activation period.
- Repairs, labour, parts, towing, trade work, renovations, and specialist services are quoted separately unless specifically included.
- Reports, findings, scores, recommendations, and Fixer assignment must not be faked.

## Required Disclaimer

The Fixit247 Safety Check is a visual home safety and readiness check designed to help identify visible risks, maintenance needs, and emergency preparation gaps. It is not a building inspection, electrical certificate, gas compliance certificate, pest inspection, insurance assessment, or mechanical inspection. Specialist inspections, compliance certificates, repairs, parts, labour, towing, trade work, renovations, and specialist services are quoted separately unless specifically included.

## Proposed Tables

### safety_checks

- `id`
- `customer_id`
- `membership_id`
- `property_id`
- `assigned_fixer_id`
- `status`: `due`, `booked`, `assigned`, `completed`, `cancelled`, `overdue`
- `check_type`: `home`, `home_and_road`, `digital`
- `scheduled_at`
- `completed_at`
- `next_due_at`
- `score_before`
- `score_after`
- `summary`
- `created_at`
- `updated_at`

### safety_check_items

- `id`
- `safety_check_id`
- `category`
- `label`
- `status`: `ok`, `attention`, `recommended`, `not_checked`
- `notes`
- `created_at`

### safety_check_photos

- `id`
- `safety_check_id`
- `file_url`
- `file_name`
- `content_type`
- `created_at`

### safety_check_recommendations

- `id`
- `safety_check_id`
- `customer_id`
- `property_id`
- `title`
- `category`
- `priority`: `low`, `medium`, `high`, `urgent`
- `description`
- `estimated_trade_type`
- `status`: `recommended`, `quote_requested`, `converted_to_request`, `dismissed`
- `linked_job_id`
- `created_at`

### home_protection_scores

- `id`
- `customer_id`
- `property_id`
- `score`
- `reason_summary`
- `calculated_at`

## Access Model

- Customers can read their own Safety Checks, reports, recommendations, and scores.
- Admins can read and manage all Safety Check operations.
- Assigned Fixers can read assigned Safety Check appointments and submit checklist/report content.
- Public users cannot create in-person Safety Checks.
- Server routes should verify membership eligibility and activation before booking.

## Operational Flow

1. Customer joins Fixit Plus.
2. Membership enters activation period.
3. After activation, Safety Check booking becomes available.
4. Customer books a check against a saved property.
5. Admin assigns a Fixer.
6. Fixer completes visual checklist and photos.
7. Report is published with score before/after.
8. Recommended fixes can convert to normal `jobs` quote requests.

