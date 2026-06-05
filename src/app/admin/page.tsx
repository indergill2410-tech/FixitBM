import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { AdminQueueItem } from "@/components/job-cards";
import { getAdminQueue } from "@/lib/jobs";

export default async function AdminPage() {
  const queue = await getAdminQueue();

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Emergency ops command centre" role="Admin" />
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Live queue" value={String(queue.jobs.length)} detail="Emergency jobs" />
          <StatCard label="Tradies online" value={String(queue.onlineTradies)} detail="Available now" />
          <StatCard label="Verification" value={String(queue.verificationPending)} detail="Awaiting review" />
          <StatCard label="Disputes" value={String(queue.disputesOpen)} detail="Credit review" />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[.7fr_.3fr]">
          <Card variant="dark">
            <Badge tone="red">Live emergency queue</Badge>
            <h2 className="mt-4 text-2xl font-black">Home and roadside jobs</h2>
            <div className="mt-5 grid gap-3">
              {queue.jobs.length ? (
                queue.jobs.map((job) => <AdminQueueItem key={job.id} job={job} />)
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">
                  No live emergency jobs in the queue.
                </div>
              )}
            </div>
          </Card>
          <Card variant="dark">
            <Badge>Ops tools</Badge>
            <div className="mt-5 grid gap-3 text-sm text-white/75">
              <p>Assign tradie</p>
              <p>Change status</p>
              <p>Approve verification</p>
              <p>Refund credits</p>
              <p>Create support ticket</p>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
