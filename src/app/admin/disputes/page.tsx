import { Badge, Card, DashboardHeader } from "@/components/ui";
import { DisputeStatusForm, RefundLeadCreditsForm } from "@/components/admin-action-forms";
import { getAdminDisputes } from "@/lib/jobs";

export default async function AdminDisputesPage() {
  const disputes = await getAdminDisputes();

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Disputes" role="Admin" />
        <div className="grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <Card variant="dark">
            <Badge tone="red">Dispute queue</Badge>
            <div className="mt-5 grid gap-3">
              {disputes.length ? (
                disputes.map((dispute) => (
                  <div key={dispute.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-black">{dispute.reason ?? dispute.type ?? "Dispute"}</p>
                          <Badge tone={dispute.status?.startsWith("resolved") || dispute.status === "closed" ? "green" : "gray"}>
                            {dispute.status ?? "open"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-white/65">{dispute.description ?? dispute.notes ?? "Awaiting admin review."}</p>
                        {dispute.job_id ? <p className="mt-2 text-xs font-bold text-white/45">Request {dispute.job_id}</p> : null}
                      </div>
                      <DisputeStatusForm disputeId={dispute.id} currentStatus={dispute.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">No open disputes.</div>
              )}
            </div>
          </Card>
          <Card variant="dark">
            <h2 className="text-xl font-black">Lead credit refund</h2>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Refund credits when a request is not genuine, unreachable, or already resolved.
            </p>
            <div className="mt-5">
              <RefundLeadCreditsForm />
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
