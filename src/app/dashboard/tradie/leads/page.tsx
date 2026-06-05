import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { LeadCard } from "@/components/job-cards";
import { requireRole } from "@/lib/auth";
import { getTradieLeads, getTradieWallet } from "@/lib/jobs";

const claimMessages: Record<string, { tone: "green" | "red" | "amber"; message: string }> = {
  success: { tone: "green", message: "Lead claimed. Credits were deducted and the lead is now in your claimed list." },
  credits: { tone: "red", message: "Not enough credits to claim that lead. Bonus credits renew monthly during your launch offer." },
  full: { tone: "red", message: "That lead has reached its tradie claim limit." },
  unavailable: { tone: "amber", message: "That lead is no longer available." },
  profile: { tone: "red", message: "Complete your tradie profile before claiming leads." },
  config: { tone: "red", message: "Lead claiming is not configured yet." },
  error: { tone: "red", message: "Lead claim failed. Please try again." },
  denied: { tone: "red", message: "Tradie access required to claim leads." }
};

export default async function TradieLeadsPage({ searchParams }: { searchParams: Promise<{ claim?: string }> }) {
  const [{ claim }, user] = await Promise.all([searchParams, requireRole(["tradie", "admin", "super_admin"])]);
  const [leads, wallet] = await Promise.all([getTradieLeads(user), getTradieWallet(user)]);
  const claimMessage = claim ? claimMessages[claim] : null;

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Lead feed" role="Tradie" />
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Available credits" value={String(wallet?.total_available ?? 0)} detail="Paid plus valid bonus" />
          <StatCard label="Bonus credits" value={String(wallet?.bonus_balance ?? 0)} detail={`${wallet?.bonus_months_granted ?? 0} of ${wallet?.bonus_months_total ?? 6} months granted`} />
          <StatCard label="Open leads" value={String(leads.length)} detail="Claim only the jobs you want" />
        </div>
        {claimMessage ? (
          <Card className="mb-5">
            <Badge tone={claimMessage.tone}>{claim === "success" ? "Claim success" : "Claim update"}</Badge>
            <p className="mt-3 text-sm font-semibold text-[var(--text2)]">{claimMessage.message}</p>
          </Card>
        ) : null}
        <div className="grid gap-4">
          {leads.length ? (
            leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          ) : (
            <Card>
              <h2 className="font-black">No live leads yet</h2>
              <p className="mt-2 text-[var(--text2)]">
                Emergency and scheduled jobs will appear here when they are ready for tradie access.
              </p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
