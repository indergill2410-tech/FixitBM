import { Card, DashboardHeader, StatCard } from "@/components/ui";
import { getAdminRevenueSummary } from "@/lib/jobs";

export default async function AdminRevenuePage() {
  const revenue = await getAdminRevenueSummary();

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Revenue" role="Admin" />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Fixit Plus" value={String(revenue.active_memberships)} detail="Active memberships" />
          <StatCard label="Fixer plans" value={String(revenue.active_tradie_subscriptions)} detail="Active plans" />
          <StatCard label="Lead claims" value={String(revenue.lead_claims)} detail={`${revenue.credit_spend} credits spent`} />
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Card variant="dark">
            <h2 className="text-xl font-black">Credit liability</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Credits currently held by Fixers across paid and 6-month starter bonus balances.
            </p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase text-white/45">Paid credits</p>
                <p className="mt-2 text-3xl font-black">{revenue.paid_credits}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold uppercase text-white/45">Bonus credits</p>
                <p className="mt-2 text-3xl font-black">{revenue.bonus_credits}</p>
              </div>
            </div>
          </Card>
          <Card variant="dark">
            <h2 className="text-xl font-black">Stripe readiness</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Live payment totals will activate after Stripe price IDs and webhook processing are connected.
            </p>
          </Card>
        </div>
      </section>
    </main>
  );
}
