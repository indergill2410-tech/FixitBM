import { Card, DashboardHeader } from "@/components/ui";
import { CustomerJobCard } from "@/components/job-cards";
import { requireRole } from "@/lib/auth";
import { getTradieAssignedJobs } from "@/lib/jobs";

export default async function TradieJobsPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const jobs = await getTradieAssignedJobs(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Assigned requests" role="Fixer" />
        <div className="grid gap-4">
          {jobs.length ? (
            jobs.map((job) => <CustomerJobCard key={job.id} job={job} hrefPrefix="/dashboard/tradie/jobs" />)
          ) : (
            <Card>
              <h2 className="font-black">No assigned requests yet</h2>
              <p className="mt-2 text-[var(--text2)]">Admin dispatch will assign confirmed work to you here.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
