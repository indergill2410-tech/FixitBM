import { Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getCustomerJobs } from "@/lib/jobs";
import { CustomerJobCard } from "@/components/job-cards";

export default async function CustomerJobsPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const jobs = await getCustomerJobs(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="My jobs" role="Customer" />
        <div className="grid gap-4">
          {jobs.length ? (
            jobs.map((job) => <CustomerJobCard key={job.id} job={job} />)
          ) : (
            <Card>
              <h2 className="font-black">No jobs yet</h2>
              <p className="mt-2 text-[var(--text2)]">Post a job free or claim a guest request after signing in.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
