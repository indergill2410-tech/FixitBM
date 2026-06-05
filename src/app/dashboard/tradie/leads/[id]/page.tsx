import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatJobLocation, getTradieLeads, getTradieWallet, statusLabel } from "@/lib/jobs";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireRole(["tradie", "admin", "super_admin"])]);
  const [leads, wallet] = await Promise.all([getTradieLeads(user), getTradieWallet(user)]);
  const lead = leads.find((item) => item.id === id);
  const enoughCredits = lead ? (wallet?.total_available ?? 0) >= lead.credit_cost : false;

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Lead detail" role={`Fixer lead ${id}`} />
        {lead ? (
          <Card variant={lead.urgency === "emergency" ? "emergency" : "default"}>
            <h1 className="text-2xl font-black">{lead.title}</h1>
            <p className="mt-2 text-sm text-[var(--text2)]">
              {lead.category} · {formatJobLocation(lead)} · {statusLabel(lead.status)}
            </p>
            <p className="mt-5 leading-7 text-[var(--text2)]">{lead.description}</p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-bold uppercase text-[var(--text3)]">Match score</p>
                <p className="mt-2 text-3xl font-black">{lead.match_score}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-bold uppercase text-[var(--text3)]">Credit cost</p>
                <p className="mt-2 text-3xl font-black">{lead.credit_cost}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="text-xs font-bold uppercase text-[var(--text3)]">Refund policy</p>
                <p className="mt-2 text-sm text-[var(--text2)]">Admin review if the customer is fake, unreachable, or already booked.</p>
              </div>
            </div>
            <div className="mt-6 rounded-2xl border border-[var(--border)] bg-white p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div>
                  <Badge tone={enoughCredits ? "green" : "red"}>{wallet?.total_available ?? 0} credits available</Badge>
                  <p className="mt-2 text-sm text-[var(--text2)]">
                    Claiming this lead costs {lead.credit_cost} credits. Bonus credits are used after paid credits.
                  </p>
                </div>
                <form action="/api/leads/claim" method="post" className="md:ml-auto">
                  <input type="hidden" name="jobId" value={lead.id} />
                  <Button disabled={lead.already_claimed || !enoughCredits}>
                    {lead.already_claimed ? "Already claimed" : enoughCredits ? "Claim request" : "Need credits"}
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <h1 className="font-black">Lead not available</h1>
            <p className="mt-2 text-[var(--text2)]">This lead may already be claimed, assigned, or outside your access.</p>
          </Card>
        )}
      </section>
    </main>
  );
}
