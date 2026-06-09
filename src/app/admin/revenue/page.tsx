import { Card, DashboardHeader, StatCard } from "@/components/ui";
import { formatMoney } from "@/lib/billing";
import { getAdminRevenueSummary } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function AdminRevenuePage() {
  const revenue = await getAdminRevenueSummary();

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Revenue" role="Admin" />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Total MRR" value={formatMoney(revenue.total_mrr_cents)} detail="Active recurring revenue / month" />
          <StatCard label="ARR run-rate" value={formatMoney(revenue.arr_cents)} detail="MRR × 12" />
          <StatCard label="Fixit Plus" value={String(revenue.active_memberships)} detail={`${formatMoney(revenue.membership_mrr_cents)} membership MRR`} />
          <StatCard label="Fixer plans" value={String(revenue.active_tradie_subscriptions)} detail={`${formatMoney(revenue.subscription_mrr_cents)} subscription MRR`} />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
          <Card>
            <h2 className="text-xl font-black">MRR by plan</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Active subscriptions priced from the billing catalogue. Credit-pack purchases are one-off and excluded from MRR.
            </p>
            <div className="mt-5 grid gap-2">
              {revenue.plan_lines.length ? (
                revenue.plan_lines.map((line) => (
                  <div key={line.code} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                    <div className="min-w-0">
                      <p className="truncate font-black">{line.name}</p>
                      <p className="mt-0.5 text-xs text-[var(--text3)]">
                        {line.count} × {formatMoney(line.unit_price_cents)}/mo ·{" "}
                        {line.type === "customer_membership" ? "Customer membership" : "Fixer subscription"}
                      </p>
                    </div>
                    <span className="shrink-0 text-lg font-black text-emerald-300">{formatMoney(line.mrr_cents)}</span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-sm text-[var(--text2)]">
                  No active subscriptions yet. MRR will populate as memberships and Fixer plans activate.
                </p>
              )}
            </div>
          </Card>

          <div className="grid gap-5">
            <Card>
              <h2 className="text-xl font-black">Lead credits</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                One-off credit revenue and outstanding liability held by Fixers.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--text3)]">Lead claims</p>
                  <p className="mt-2 text-3xl font-black">{revenue.lead_claims}</p>
                  <p className="mt-1 text-xs text-[var(--text3)]">{revenue.credit_spend} credits spent</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                  <p className="text-xs font-bold uppercase text-[var(--text3)]">Paid credits held</p>
                  <p className="mt-2 text-3xl font-black">{revenue.paid_credits}</p>
                  <p className="mt-1 text-xs text-[var(--text3)]">{revenue.bonus_credits} bonus credits</p>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-black">Stripe processing</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                MRR above is derived from active subscription records. Settled payment totals, refunds, and failed-charge
                recovery will appear here once Stripe price IDs and webhook reconciliation are connected.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
