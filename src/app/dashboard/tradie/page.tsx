import { Badge, Button, Card, DashboardHeader, StatCard } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatJobLocation, getTradieAssignedJobs, getTradieLeads, getTradieProfileForUser, getTradieWallet, statusLabel } from "@/lib/jobs";
import { LeadCard } from "@/components/job-cards";
import { CalendarCheck } from "lucide-react";

export default async function TradieDashboardPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const [wallet, leads, jobs, profile] = await Promise.all([
    getTradieWallet(user),
    getTradieLeads(user),
    getTradieAssignedJobs(user),
    getTradieProfileForUser(user)
  ]);
  const activeJobs = jobs.filter((job) => !["completed", "reviewed", "closed", "cancelled"].includes(job.status));
  const topLead = leads[0];
  const availableCredits = wallet?.total_available ?? 0;

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Fixer command centre" role="Fixer" />
        <div className="grid gap-5 lg:grid-cols-[.7fr_.3fr]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Availability" value={profile?.emergency_available ? "On" : "Off"} detail="Emergency requests" />
              <StatCard label="Wallet" value={String(availableCredits)} detail="Lead credits" />
              <StatCard label="Open leads" value={String(leads.length)} detail="Ready to claim" />
              <StatCard label="Active work" value={String(activeJobs.length)} detail={`${jobs.length} assigned total`} />
            </div>
            {topLead ? (
              <LeadCard lead={topLead} />
            ) : activeJobs[0] ? (
              <Card variant="dark">
                <Badge>Active request</Badge>
                <h2 className="mt-4 text-2xl font-black">{activeJobs[0].title}</h2>
                <p className="mt-2 text-white/70">
                  {formatJobLocation(activeJobs[0])} · {statusLabel(activeJobs[0].status)}
                </p>
                <Button href={`/dashboard/tradie/jobs/${activeJobs[0].id}`} variant="ghost" className="mt-5">
                  Open request
                </Button>
              </Card>
            ) : (
              <Card variant="dark">
                <Badge>Ready for leads</Badge>
                <h2 className="mt-4 text-2xl font-black">No urgent leads in your queue yet</h2>
                <p className="mt-2 text-white/70">Keep profile and availability current so matching can surface the right work.</p>
              </Card>
            )}
          </div>
          <Card>
            <Badge tone="green">No commission</Badge>
            <h2 className="mt-4 text-xl font-black">Keep 100% of the work value.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Pay for leads, priority access, verification upgrades, and business tools.</p>
          </Card>
          <Card>
            <CalendarCheck className="text-[var(--amber2)]" />
            <Badge className="mt-4">Coming soon</Badge>
            <h2 className="mt-4 text-xl font-black">Safety Check appointments</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Help members prepare their homes and identify follow-up work before small issues become emergencies.
            </p>
            <Button href="/dashboard/tradie/jobs" variant="ghost" className="mt-5 w-full">View Safety Checks</Button>
          </Card>
          <Card variant="membership">
            <Badge>Signup bonus</Badge>
            <h2 className="mt-4 text-xl font-black">111 credits every month for 6 months.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Claim request leads on Free Starter before choosing a paid subscription.
            </p>
            <Button href="/dashboard/tradie/wallet" className="mt-5 w-full">
              View wallet
            </Button>
          </Card>
        </div>
      </section>
    </main>
  );
}
