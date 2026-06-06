import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { AdminQueueItem } from "@/components/job-cards";
import { getAdminQueue, requestLaneLabel } from "@/lib/jobs";
import { SafetyCheckMiniOpsCard } from "@/components/safety-check-cards";

export default async function AdminPage() {
  const queue = await getAdminQueue();
  const emergencyCount = queue.jobs.filter((job) => requestLaneLabel(job).includes("emergency")).length;
  const tradeCount = queue.jobs.filter((job) => requestLaneLabel(job) === "Trade request").length;
  const projectCount = queue.jobs.filter((job) => requestLaneLabel(job) === "Project quote").length;

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Request ops command centre" role="Admin" />
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Emergency queue" value={String(emergencyCount)} detail="Home and roadside" />
          <StatCard label="Trade requests" value={String(tradeCount)} detail="Standard jobs" />
          <StatCard label="Project quotes" value={String(projectCount)} detail="Quote-first work" />
          <StatCard label="Fixers online" value={String(queue.onlineTradies)} detail="Available now" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <StatCard label="Verification" value={String(queue.verificationPending)} detail="Awaiting review" />
          <StatCard label="Disputes" value={String(queue.disputesOpen)} detail="Credit review" />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[.7fr_.3fr]">
          <Card variant="dark">
            <Badge tone="red">Live request queue</Badge>
            <h2 className="mt-4 text-2xl font-black">Emergency, trade, and project requests</h2>
            <div className="mt-5 grid gap-3">
              {queue.jobs.length ? (
                queue.jobs.map((job) => <AdminQueueItem key={job.id} job={job} />)
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">
                  No live requests in the queue.
                </div>
              )}
            </div>
          </Card>
          <Card variant="dark">
            <Badge>Ops tools</Badge>
            <div className="mt-5 grid gap-3 text-sm text-white/75">
              <p>Assign Fixer</p>
              <p>Change status</p>
              <p>Prepare Safety Check queue</p>
              <p>View recommended fixes</p>
              <p>Approve verification</p>
              <p>Refund credits</p>
              <p>Create support ticket</p>
            </div>
          </Card>
          <SafetyCheckMiniOpsCard />
        </div>
      </section>
    </main>
  );
}
