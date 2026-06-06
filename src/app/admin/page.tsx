import { Badge, Card, DashboardHeader } from "@/components/ui";
import { AdminQueueItem } from "@/components/job-cards";
import { getAdminQueue, requestLaneLabel } from "@/lib/jobs";
import { SafetyCheckMiniOpsCard } from "@/components/safety-check-cards";
import { AdminPriorityCard, AdminStatCard, adminIcons } from "@/components/admin-shell";

export default async function AdminPage() {
  const queue = await getAdminQueue();
  const emergencyCount = queue.jobs.filter((job) => requestLaneLabel(job).includes("emergency")).length;
  const tradeCount = queue.jobs.filter((job) => requestLaneLabel(job) === "Trade request").length;
  const projectCount = queue.jobs.filter((job) => requestLaneLabel(job) === "Project quote").length;

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Request ops command centre" role="Admin" />
        <p className="-mt-3 mb-6 max-w-3xl text-sm leading-6 text-white/60">
          Real operating console for emergency requests, standard trade work, project quotes, Fixer supply, memberships,
          Safety Checks, support, and credit control.
        </p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={adminIcons.AlertTriangle} label="Emergency queue" value={String(emergencyCount)} detail="Home and roadside requests needing speed." tone="red" />
          <AdminStatCard icon={adminIcons.ClipboardList} label="Trade requests" value={String(tradeCount)} detail="Standard jobs ready for Fixer access." tone="blue" />
          <AdminStatCard icon={adminIcons.Wrench} label="Project quotes" value={String(projectCount)} detail="Quote-first larger property work." tone="purple" />
          <AdminStatCard icon={adminIcons.Users} label="Fixers online" value={String(queue.onlineTradies)} detail="Available providers in the network." tone="green" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AdminStatCard icon={adminIcons.CheckCircle2} label="Verification" value={String(queue.verificationPending)} detail="Fixer documents awaiting review." tone="amber" />
          <AdminStatCard icon={adminIcons.CreditCard} label="Disputes" value={String(queue.disputesOpen)} detail="Lead-quality and credit reviews." tone="red" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminPriorityCard href="/admin/jobs" icon={adminIcons.ClipboardList} title="Dispatch queue" copy="Open request detail pages, assign Fixers, and move status forward." tone="red" />
          <AdminPriorityCard href="/admin/safety-checks" icon={adminIcons.ShieldCheck} title="Safety Check ops" copy="Prepare member checks, reports, recommended fixes, and quote follow-ups." />
          <AdminPriorityCard href="/admin/tradies/verification" icon={adminIcons.CheckCircle2} title="Fixer verification" copy="Review licences, insurance, identity, and trust documents." tone="green" />
          <AdminPriorityCard href="/admin/support" icon={adminIcons.Headphones} title="Support desk" copy="Track customer escalations, disputes, and operational notes." tone="blue" />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[.72fr_.28fr]">
          <Card variant="dark">
            <Badge tone="red">Live request queue</Badge>
            <h2 className="mt-4 text-2xl font-black">Emergency, trade, and project requests</h2>
            <p className="mt-2 text-sm leading-6 text-white/60">
              This list is pulled from the live `jobs` request table and filtered to active operational statuses.
            </p>
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
              {[
                ["Assign Fixer", "/admin/jobs"],
                ["Change status", "/admin/jobs"],
                ["Prepare Safety Check queue", "/admin/safety-checks"],
                ["View recommended fixes", "/admin/safety-checks"],
                ["Approve verification", "/admin/tradies/verification"],
                ["Refund credits", "/admin/credits"],
                ["Create support ticket", "/admin/support"]
              ].map(([label, href]) => (
                <a key={label} href={href} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-semibold transition hover:border-amber-300/40 hover:bg-white/10">
                  {label}
                </a>
              ))}
            </div>
          </Card>
          <SafetyCheckMiniOpsCard />
        </div>
      </section>
    </main>
  );
}
