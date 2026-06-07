# Fixit247 Business Logic Priority

This project must treat business logic as the highest-priority layer of the product.

## Permanent Operating Rule

Before visual polish, copy changes, or new feature expansion, protect the rules that affect customer trust, Fixer earnings, payments, credits, account access, Safety Checks, and admin operations.

## Non-Negotiables

- A signed-in user must never be shown an account state that looks logged out unless they explicitly sign out.
- Customer, Fixer, admin, and super admin permissions must be enforced on every dashboard, mutation, upload, billing action, and support action.
- Billing plans must only be purchasable by the account type they belong to.
- Stripe payment state must be reconciled back into memberships, Fixer subscriptions, and credit wallets.
- Lead claiming must be atomic so credits cannot be double-spent and claim limits cannot be bypassed.
- Fixer bonus credits are 111 credits per month for 6 months, including Free Starter Fixers.
- PropertySafe / Safety & Readiness Checks must be honest: no fake reports, no placeholder safety data, no inferred shared access, and no in-person booking until the membership is active after the activation window.
- PropertySafe shared access must be explicit per property record. Homeowners, landlords, agency teams, and tenant viewers only see the records connected to their participant permissions.
- Admin actions must create an audit trail when they change requests, verification, disputes, refunds, memberships, support, or Safety Checks.
- Public-facing language should say requests, Fixers, Fixit Plus, Safety Checks, and PropertySafe where appropriate. Avoid exposing implementation terms.
- Every interface must feel premium, calm, fast, and trustworthy. UI/UX should follow a Tesla/Apple-grade standard: simple hierarchy, crisp spacing, confident CTAs, minimal clutter, polished states, and no generic dashboards.

## Review Order

1. Account/session trust.
2. Role and permission boundaries.
3. Payments, credits, refunds, and claim limits.
4. PropertySafe eligibility, shared access, Safety Checks, and recommendations.
5. Customer/Fixer dashboard consistency.
6. Admin operational visibility and auditability.
7. Premium UI/UX, copywriting, and SEO polish.
