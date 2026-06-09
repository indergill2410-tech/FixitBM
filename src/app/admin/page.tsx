import { Badge, Card, DashboardHeader } from "@/components/ui";
import { AdminQueueItem } from "@/components/job-cards";
import { requireRole } from "@/lib/auth";
import { getAdminCommandMetrics, getAdminNotifications, getAdminRequestQueue, type AdminNotificationRow } from "@/lib/jobs";
import { SafetyCheckMiniOpsCard } from "@/components/safety-check-cards";
import { AdminPriorityCard, AdminStatCard, adminIcons } from "@/components/admin-shell";

export default async function AdminPage() {
  const user = await requireRole(["admin", "super_admin"]);
  const [metrics, jobs, notifications] = await Promise.all([
    getAdminCommandMetrics(),
    getAdminRequestQueue(),
    getAdminNotifications(user)
  ]);

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Request operations centre" role="Admin" />
        <p className="-mt-3 mb-6 max-w-3xl text-sm leading-6 text-[var(--text2)]">
          Live operating view for emergency requests, standard trade work, project quotes, Fixer supply, memberships,
          Safety Checks, support, and credit control.
        </p>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard icon={adminIcons.AlertTriangle} label="Emergency queue" value={String(metrics.emergencyRequests)} detail="Home and roadside requests needing speed." tone="red" />
          <AdminStatCard icon={adminIcons.ClipboardList} label="Unassigned" value={String(metrics.unassignedRequests)} detail="Requests waiting for a Fixer." tone="amber" />
          <AdminStatCard icon={adminIcons.Wrench} label="Active requests" value={String(metrics.activeRequests)} detail="Live operational workload." tone="purple" />
          <AdminStatCard icon={adminIcons.Users} label="Fixers online" value={String(metrics.activeFixers)} detail="Available providers in the network." tone="green" />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <AdminStatCard icon={adminIcons.CheckCircle2} label="Verification" value={String(metrics.verificationPending)} detail="Fixer documents awaiting review." tone="amber" />
          <AdminStatCard icon={adminIcons.CreditCard} label="Disputes" value={String(metrics.disputesOpen)} detail="Lead-quality and credit reviews." tone="red" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminPriorityCard href="/admin/jobs" icon={adminIcons.ClipboardList} title="Dispatch queue" copy="Open request detail pages, assign Fixers, and move status forward." tone="red" />
          <AdminPriorityCard href="/admin/safety-checks" icon={adminIcons.ShieldCheck} title="Safety Checks" copy="Prepare member checks, reports, recommended fixes, and quote follow-ups." />
          <AdminPriorityCard href="/admin/tradies/verification" icon={adminIcons.CheckCircle2} title="Fixer verification" copy="Review licences, insurance, identity, and trust documents." tone="green" />
          <AdminPriorityCard href="/admin/support" icon={adminIcons.Headphones} title="Support desk" copy="Track customer escalations, disputes, and operational notes." tone="blue" />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[.72fr_.28fr]">
          <Card>
            <Badge tone="red">Live request queue</Badge>
            <h2 className="mt-4 text-2xl font-black">Emergency, trade, and project requests</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Active requests are grouped here so the team can assign, update, and resolve them faster.
            </p>
            <div className="mt-5 grid gap-3">
              {jobs.length ? (
                jobs.slice(0, 8).map((job) => <AdminQueueItem key={job.id} job={job} />)
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-[var(--text2)]">
                  No live requests in the queue.
                </div>
              )}
            </div>
          </Card>
          <Card>
            <Badge tone="green">Team notifications</Badge>
            <h2 className="mt-4 text-2xl font-black">Fixer onboarding alerts</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              New Fixer signups and completed onboarding profiles appear here for review.
            </p>
            <div className="mt-5 grid gap-3">
              {notifications.length ? (
                notifications.map((notification) => <AdminNotificationItem key={notification.id} notification={notification} />)
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-sm font-semibold text-[var(--text2)]">
                  No team notifications yet.
                </div>
              )}
            </div>
          </Card>
          <Card>
            <Badge>Team tools</Badge>
            <div className="mt-5 grid gap-3 text-sm text-[var(--text2)]">
              {[
                ["Assign Fixer", "/admin/jobs"],
                ["Change status", "/admin/jobs"],
                ["Prepare Safety Check queue", "/admin/safety-checks"],
                ["View recommended fixes", "/admin/safety-checks"],
                ["Approve verification", "/admin/tradies/verification"],
                ["Refund credits", "/admin/credits"],
                ["Create support ticket", "/admin/support"]
              ].map(([label, href]) => (
                <a key={label} href={href} className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] px-4 py-3 font-semibold transition hover:border-amber-300/40 hover:bg-[var(--bg2)]">
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

function AdminNotificationItem({ notification }: { notification: AdminNotificationRow }) {
  return (
    <a
      href={notification.link ?? "/admin"}
      className="block rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 transition hover:border-amber-300/40 hover:bg-[var(--bg2)]"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black">{notification.title}</p>
        <span className={notification.read_at ? "h-2.5 w-2.5 rounded-full bg-[var(--bg2)]" : "h-2.5 w-2.5 rounded-full bg-[var(--amber)]"} />
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{notification.body}</p>
      <p className="mt-3 text-xs font-semibold text-[var(--text3)]">{new Date(notification.created_at).toLocaleString()}</p>
    </a>
  );
}
