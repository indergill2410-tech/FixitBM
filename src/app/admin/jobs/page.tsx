import { Card, DashboardHeader } from "@/components/ui";
import { AdminQueueItem } from "@/components/job-cards";
import { getAdminQueue } from "@/lib/jobs";

export default async function AdminJobsPage() {
  const queue = await getAdminQueue();

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Requests" role="Admin" />
        <Card variant="dark">
          <div className="grid gap-3">
            {queue.jobs.length ? (
              queue.jobs.map((job) => <AdminQueueItem key={job.id} job={job} />)
            ) : (
              <p className="text-white/70">No active requests in the queue.</p>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
