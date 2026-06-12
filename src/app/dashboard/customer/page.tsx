import type { LucideIcon } from "lucide-react";
import { Car, Headphones, Home, MessageSquare, Star, UserRound, Wrench } from "lucide-react";
import { Badge, Button, Card, DashboardHeader, StatCard } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { formatJobLocation, getCustomerDashboardInsights, getCustomerJobs, requestLaneLabel, statusLabel } from "@/lib/jobs";
import { EmailVerificationCard } from "@/components/email-verification-card";
import { CustomerJobCard } from "@/components/job-cards";
import { getHomeProtectionSummary } from "@/lib/safety-checks";
import { getCustomerPropertySafeSummary } from "@/lib/propertysafe";
import { getCustomerProtectionState, getRequestProgress } from "@/lib/membership-state";
import {
  CompletePeaceOfMindCard,
  LossAversionCard,
  MembershipReceiptCard,
  ProtectionHero,
  ProtectionScoreBuilder,
  RequestProgress
} from "@/components/customer-dashboard";
import { PropertySafeStatusCard } from "@/components/safety-check-cards";

function greeting() {
  // Server-rendered: use the audience timezone, not the server's (UTC).
  const hour = Number(
    new Intl.DateTimeFormat("en-AU", { hour: "numeric", hour12: false, timeZone: "Australia/Sydney" }).format(new Date())
  );
  if (!Number.isFinite(hour)) return "Welcome back";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function CustomerDashboardPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const [jobs, insights, protection, propertySafe] = await Promise.all([
    getCustomerJobs(user),
    getCustomerDashboardInsights(user),
    getHomeProtectionSummary(user),
    getCustomerPropertySafeSummary(user)
  ]);

  const state = getCustomerProtectionState(protection);
  const activeJob = jobs.find((job) => !["completed", "reviewed", "closed", "cancelled"].includes(job.status));
  const activeJobs = jobs.filter((job) => !["completed", "reviewed", "closed", "cancelled"].includes(job.status)).length;
  const pendingQuotes = jobs.filter((job) => job.status === "quote_provided").length;
  const emergencyRequests = jobs.filter((job) => requestLaneLabel(job).includes("emergency")).length;
  const projectRequests = jobs.filter((job) => requestLaneLabel(job) === "Project quote").length;
  const displayName = user.first_name ?? "there";

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title={`${greeting()}, ${displayName}`} role="Customer account" />
        <p className="-mt-3 mb-6 max-w-2xl text-sm leading-6 text-[var(--text2)]">
          Your home and road protection account — help when things go wrong, and a plan so they go wrong less often.
        </p>
        {user.email && !user.email_verified_at ? <EmailVerificationCard email={user.email} /> : null}

        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <Button href="/post-job">Get help now</Button>
          {protection.membership?.status === "active" ? (
            <Button href="/dashboard/customer/safety-checks/book" variant="ghost">Book my Safety Check</Button>
          ) : (
            <Button href="/fixit-peace" variant="ghost">See Fixit Peace</Button>
          )}
          <Button href="/dashboard/customer/requests" variant="ghost">My requests</Button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[.66fr_.34fr]">
          <div className="grid gap-5">
            <ProtectionHero state={state} score={protection.score} />

            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label="Active requests" value={String(activeJobs)} detail={`${jobs.length} total requests`} />
              <StatCard label="Emergency history" value={String(emergencyRequests)} detail="Home and roadside" />
              <StatCard label="Project quotes" value={String(projectRequests + pendingQuotes)} detail="Quote-first requests" />
            </div>

            {activeJob ? (
              <Card variant="emergency">
                <Badge tone="red">Active request</Badge>
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
                <RequestProgress steps={getRequestProgress(activeJob.status)} />
              </Card>
            ) : (
              <Card>
                <Badge tone="gray">No active requests</Badge>
                <h2 className="mt-4 text-2xl font-black">Your request history starts here.</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  Start an emergency request, trade request, or project quote free.
                </p>
              </Card>
            )}

            <div className="grid gap-4">
              <div>
                <Badge tone="gray">Recent requests</Badge>
                <h2 className="mt-3 text-2xl font-black">Emergency requests, trade jobs, projects, and completed work.</h2>
              </div>
              {jobs.length ? (
                jobs.slice(0, 3).map((job) => <CustomerJobCard key={job.id} job={job} />)
              ) : (
                <Card>
                  <p className="text-sm leading-6 text-[var(--text2)]">
                    Once you start a request, it appears here with live status, messages, and photos.
                  </p>
                </Card>
              )}
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
                    <p className="text-sm leading-6 text-[var(--text2)]">Request conversations are saved here as support or Fixers reply.</p>
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
                    <p className="text-sm leading-6 text-[var(--text2)]">Completed requests can be reviewed from here.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>

          <aside className="grid gap-5">
            <LossAversionCard state={state} />
            <CompletePeaceOfMindCard state={state} />
            <ProtectionScoreBuilder state={state} />
            <MembershipReceiptCard state={state} />
            <PropertySafeStatusCard summary={propertySafe} />
            <Card>
              <div className="grid gap-3">
                <DashboardLink icon={Home} label="Saved properties" href="/dashboard/customer/properties" />
                <DashboardLink icon={Car} label="Saved vehicles" href="/dashboard/customer/vehicles" />
                <DashboardLink icon={Wrench} label="Safety Checks & fixes" href="/dashboard/customer/safety-checks" />
                <DashboardLink icon={UserRound} label="Membership & payments" href="/dashboard/customer/membership" />
                <DashboardLink icon={Headphones} label="Support" href="/dashboard/customer/support" />
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DashboardLink({ icon: Icon, label, href }: { icon: LucideIcon; label: string; href: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm font-bold transition hover:border-[var(--amber2)] hover:bg-white">
      <Icon size={17} className="text-[var(--amber2)]" />
      {label}
    </a>
  );
}
