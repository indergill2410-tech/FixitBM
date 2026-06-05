import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getTradieWallet } from "@/lib/jobs";

export default async function TradieWalletPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const wallet = await getTradieWallet(user);
  const totalAvailable = wallet?.total_available ?? 0;

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Credit wallet" role="Fixer" />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Available credits" value={String(totalAvailable)} detail="Paid plus valid bonus credits" />
          <StatCard label="Bonus credits" value={String(wallet?.bonus_balance ?? 0)} detail="Signup offer" />
          <StatCard label="Lifetime used" value={String(wallet?.lifetime_used ?? 0)} detail="Lead claims" />
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-[.4fr_.6fr]">
          <Card variant="membership">
            <Badge>Fixer launch offer</Badge>
            <h2 className="mt-4 text-2xl font-black">111 bonus credits every month for 6 months.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
              Use monthly renewed bonus credits to claim request leads while staying on Free Starter. Upgrade only when you
              want priority access, higher ranking, and more growth tools.
            </p>
            <p className="mt-4 text-sm font-bold text-[var(--text)]">
              Granted: {wallet?.bonus_months_granted ?? 0} of {wallet?.bonus_months_total ?? 6} months
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--amber2)]">
              Next renewal: {wallet?.bonus_next_renewal_at ? new Date(wallet.bonus_next_renewal_at).toLocaleDateString() : "Complete"}
            </p>
            <p className="mt-4 text-sm font-bold text-[var(--amber2)]">
              Programme ends: {wallet?.bonus_expires_at ? new Date(wallet.bonus_expires_at).toLocaleDateString() : "Not granted yet"}
            </p>
          </Card>
          <Card>
            <h2 className="font-black">Recent credit activity</h2>
            <div className="mt-4 grid gap-3">
              {wallet?.transactions.length ? (
                wallet.transactions.map((transaction) => (
                  <div key={transaction.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-bold">{transaction.reason ?? transaction.type}</p>
                      <Badge tone={transaction.amount >= 0 ? "green" : "red"}>{transaction.amount}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-[var(--text3)]">{new Date(transaction.created_at).toLocaleString()}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--text2)]">Credit transactions will appear after signup bonus grants and lead claims.</p>
              )}
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
