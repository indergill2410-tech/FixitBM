import type { LucideIcon } from "lucide-react";
import { Car, Home, MessageSquare, Star, UserRound } from "lucide-react";
import { Badge, Card, DashboardHeader, EmergencyCTA, StatCard } from "@/components/ui";
import { customerTimeline } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { formatJobLocation, getCustomerDashboardInsights, getCustomerJobs, requestLaneLabel, statusLabel } from "@/lib/jobs";
import { CustomerJobCard } from "@/components/job-cards";

export default async function CustomerDashboardPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const [jobs, insights] = await Promise.all([getCustomerJobs(user), getCustomerDashboardInsights(user)]);
  const activeJob = jobs.find((job) => !["completed", "reviewed", "closed", "cancelled"].includes(job.status));
  const activeJobs = jobs.filter((job) => !["completed", "reviewed", "closed", "cancelled"].includes(job.status)).length;
  const pendingQuotes = jobs.filter((job) => job.status === "quote_provided").length;
  const emergencyRequests = jobs.filter((job) => requestLaneLabel(job).includes("emergency")).length;
  const projectRequests = jobs.filter((job) => requestLaneLabel(job) === "Project quote").length;
  const displayName = user.first_name ?? "there";

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title={`Good evening, ${displayName}`} role="Customer dashboard" />
        <div className="grid gap-5 lg:grid-cols-[.68fr_.32fr]">
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Active requests" value={String(activeJobs)} detail={`${jobs.length} total requests`} />
              <StatCard label="Emergency history" value={String(emergencyRequests)} detail="Home and roadside" />
              <StatCard label="Project quotes" value={String(projectRequests + pendingQuotes)} detail="Quote-first requests" />
            </div>
            {activeJob ? (
              <Card variant="emergency">
                <Badge tone="red">Active emergency</Badge>
                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
                  <div>
                    <h2 className="text-2xl font-black">{activeJob.title}</h2>
                    <p className="mt-2 text-sm text-[var(--text2)]">
                      Request {activeJob.public_reference} · {activeJob.category} near {formatJobLocation(activeJob)}
                    </p>
                  </div>
                  <Badge tone="amber" className="md:ml-auto">
                    {statusLabel(activeJob.status)}
                  </Badge>
                </div>
                <div className="mt-6 grid gap-3 md:grid-cols-4">
                  {customerTimeline.slice(0, 4).map((item, index) => (
                    <div key={item} className="rounded-xl border border-[var(--border)] bg-white p-3">
                      <div className={`h-2 w-2 rounded-full ${index < 2 ? "bg-[var(--green)]" : "bg-[var(--border2)]"}`} />
                      <p className="mt-3 text-xs font-bold">{item}</p>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Card>
                <Badge tone="gray">No active requests</Badge>
                <h2 className="mt-4 text-2xl font-black">Your protection timeline will appear here.</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  Start an emergency request, trade request, or project quote free.
                </p>
              </Card>
            )}
            <div className="grid gap-4">
              {jobs.slice(0, 3).map((job) => (
                <CustomerJobCard key={job.id} job={job} />
              ))}
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Card>
                <MessageSquare className="text-[var(--amber2)]" />
                <h2 className="mt-4 font-black">Recent messages</h2>
                <div className="mt-3 grid gap-2">
                  {insights.recent_messages.length ? (
                    insights.recent_messages.map((message) => (
                      <a key={message.id} href={`/dashboard/customer/jobs/${message.job_id}`} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
                        <p className="font-bold">{message.sender_label ?? "Fixit247"} · {message.job_title}</p>
                        <p className="mt-1 line-clamp-2 text-[var(--text2)]">{message.body}</p>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[var(--text2)]">Request conversations appear here as soon as messages are added.</p>
                  )}
                </div>
              </Card>
              <Card>
                <Star className="text-[var(--green)]" />
                <h2 className="mt-4 font-black">Reviews</h2>
                <div className="mt-3 grid gap-2">
                  {insights.review_jobs.length ? (
                    insights.review_jobs.map((job) => (
                      <a key={job.id} href={`/dashboard/customer/jobs/${job.id}`} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm">
                        <p className="font-bold">{job.title}</p>
                        <p className="mt-1 text-[var(--text2)]">{job.public_reference}</p>
                      </a>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[var(--text2)]">Review prompts appear after completed jobs.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
          <aside className="grid gap-5">
            <EmergencyCTA />
            <Card variant="membership">
              <Badge>Fixit Plus</Badge>
              <h2 className="mt-4 text-xl font-black">Protect your home before the next emergency.</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Fixit Plus gives your household a plan when something breaks, leaks, locks, sparks, stalls, or leaves you stranded.
              </p>
            </Card>
            <Card>
              <div className="grid gap-3">
                <DashboardLink icon={Home} label="Saved properties" />
                <DashboardLink icon={Car} label="Saved vehicles" />
                <DashboardLink icon={UserRound} label="Payments" />
                <a className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm font-bold" href="/dashboard/customer/claim">
                  Claim guest request
                </a>
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DashboardLink({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm font-bold">
      <Icon size={17} className="text-[var(--amber2)]" />
      {label}
    </div>
  );
}
