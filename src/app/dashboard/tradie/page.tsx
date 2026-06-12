import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  FileImage,
  Headphones,
  Hammer,
  MapPin,
  Radar,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Wallet,
  Zap
} from "lucide-react";
import { EmailVerificationCard } from "@/components/email-verification-card";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { fixerMarketplaceEnabled, showFixerRecruitmentUi } from "@/lib/featureFlags";
import {
  formatJobLocation,
  getTradieAssignedJobs,
  getTradieLeads,
  getTradieProfileDetail,
  getTradieWallet,
  statusLabel,
  type JobSummary
} from "@/lib/jobs";
import { getTradieAssignedSafetyChecks } from "@/lib/safety-checks";

export default async function TradieDashboardPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);

  // The lead marketplace (self-serve leads, credit wallet, claim-by-credits) is
  // held behind a flag until launch. While it is off, Fixers only ever see work
  // that Fixit247 has dispatched to them — no lead feed, no credit pricing.
  const [jobs, profile, safetyChecks] = await Promise.all([
    getTradieAssignedJobs(user),
    getTradieProfileDetail(user),
    getTradieAssignedSafetyChecks(user)
  ]);
  const [wallet, leads] = fixerMarketplaceEnabled
    ? await Promise.all([getTradieWallet(user), getTradieLeads(user)])
    : [null, []];

  const activeJobs = jobs.filter((job) => !["completed", "reviewed", "closed", "cancelled"].includes(job.status));
  const completedJobs = jobs.filter((job) => ["completed", "reviewed", "closed"].includes(job.status)).length;
  const nextSafetyCheck = safetyChecks[0];
  const availableCredits = wallet?.total_available ?? 0;
  const profileHealth = profile?.profile_health ?? 0;
  const availability = profile?.availability_status ? labelize(profile.availability_status) : "Profile needed";
  const emergencyMode = profile?.emergency_available ? "Emergency-ready" : "Standard requests";
  const displayName = profile?.business_name ?? user.first_name ?? "Fixer";
  const onboardingItems = getOnboardingItems(profile);
  const isVerified = profile?.verification_status === "approved";
  const canTakeCompliance = isVerified && Boolean(profile?.licence_number);
  const rating = profile?.rating ?? null;
  const totalReviews = profile?.total_reviews ?? 0;

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title={`${displayName} work hub`} role="Fixer account" />
        {user.email && !user.email_verified_at ? <EmailVerificationCard email={user.email} /> : null}

        <section className="grid gap-5 lg:grid-cols-[1fr_.38fr]">
          <Card variant="dark" className="overflow-hidden p-6">
            <div className="grid gap-8 lg:grid-cols-[1fr_.48fr] lg:items-end">
              <div>
                <Badge>{fixerMarketplaceEnabled ? "Live work view" : "Your work hub"}</Badge>
                <h2 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-tight md:text-5xl">
                  {fixerMarketplaceEnabled
                    ? "Choose the right lead. Keep control of the work."
                    : "Your assigned work, all in one place."}
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                  {fixerMarketplaceEnabled
                    ? "Your Fixer account brings credits, available leads, assigned requests, Safety Check appointments, and key controls into one place so you can choose the right work with confidence."
                    : "Fixit247 reviews each request and dispatches it to the right Fixer. Keep your profile and availability current so the team can match you to suitable emergency, repair, agency, and planned work."}
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <DarkMetric label="Mode" value={emergencyMode} />
                  {fixerMarketplaceEnabled ? <DarkMetric label="Credits" value={`${availableCredits}`} /> : null}
                  <DarkMetric label={fixerMarketplaceEnabled ? "Open leads" : "Assigned"} value={`${fixerMarketplaceEnabled ? leads.length : jobs.length}`} />
                  <DarkMetric label="Active work" value={`${activeJobs.length}`} />
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-white/50">Availability control</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${profile?.emergency_available ? "bg-[var(--green)]" : "bg-[var(--amber)]"}`} />
                  <p className="text-2xl font-black">{availability}</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Update your profile when you are busy, offline, or ready for emergency requests.
                </p>
                <div className="mt-5 grid gap-2">
                  <Button href="/dashboard/tradie/profile">
                    Update availability
                    <SlidersHorizontal size={16} />
                  </Button>
                  <Button href="/dashboard/tradie/jobs" variant="light">
                    {fixerMarketplaceEnabled ? "Open lead feed" : "View assigned work"}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {isVerified ? (
            <Card variant="membership">
              <Badge tone="green">Match-ready</Badge>
              <h2 className="mt-4 text-2xl font-black">You&apos;re verified and ready for work.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
                Your profile is reviewed and active. Keep your availability current so the right emergency, repair, and
                agency work reaches you first.
              </p>
              {canTakeCompliance ? (
                <p className="mt-3 rounded-xl bg-[var(--green-light)] p-3 text-sm font-bold text-[var(--green)]">
                  Licence on file — you can be assigned rental compliance inspections.
                </p>
              ) : (
                <p className="mt-3 rounded-xl bg-[var(--amber-light)] p-3 text-sm font-bold text-[var(--amber2)]">
                  Add your licence to unlock paid gas, electrical &amp; smoke compliance inspection work.
                </p>
              )}
              <Button href="/dashboard/tradie/profile" className="mt-5 w-full">
                {canTakeCompliance ? "Manage profile" : "Add licence details"}
              </Button>
            </Card>
          ) : (
            <Card variant="membership">
              <Badge tone="amber">Profile review</Badge>
              <h2 className="mt-4 text-2xl font-black">Complete your Fixer readiness profile.</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
                Add your business details, service areas, verification documents, and work interests so the team can
                review your fit and dispatch suitable work to you.
              </p>
              <Button href="/dashboard/tradie/profile" className="mt-5 w-full">
                Complete profile
              </Button>
            </Card>
          )}
        </section>

        {showFixerRecruitmentUi ? (
          <Card className="mt-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <Badge tone="blue">Onboarding checklist</Badge>
                <h2 className="mt-3 text-2xl font-black">Prepare your Fixer account for review.</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
                  Keep these details current so Fixit247 can assess your profile and dispatch emergency repairs, planned
                  jobs, agency maintenance work, and partnership opportunities to you.
                </p>
              </div>
              <Button href="/dashboard/tradie/profile" variant="ghost">
                Update profile
                <ArrowRight size={16} />
              </Button>
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              {onboardingItems.map((item) => (
                <ChecklistItem key={item.label} {...item} />
              ))}
            </div>
          </Card>
        ) : null}

        <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SignalCard icon={Activity} label="Availability" value={availability} detail={emergencyMode} tone={profile?.emergency_available ? "green" : "amber"} />
          {fixerMarketplaceEnabled ? (
            <SignalCard icon={Wallet} label="Wallet" value={String(availableCredits)} detail="Lead credits available" tone="amber" />
          ) : null}
          {fixerMarketplaceEnabled ? (
            <SignalCard icon={Radar} label="Open leads" value={String(leads.length)} detail="Ready to review" tone="green" />
          ) : null}
          <SignalCard icon={BriefcaseBusiness} label="Active work" value={String(activeJobs.length)} detail={`${completedJobs} completed`} tone="blue" />
          <SignalCard icon={Star} label="Rating" value={rating ? rating.toFixed(1) : "New"} detail={totalReviews ? `${totalReviews} reviews` : "Build your reputation"} tone={rating && rating >= 4 ? "green" : "amber"} />
          <SignalCard icon={ShieldCheck} label="Profile health" value={`${profileHealth}%`} detail={labelize(profile?.verification_status ?? "verification pending")} tone={profileHealth >= 70 ? "green" : "amber"} />
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[.68fr_.32fr]">
          <div className="grid gap-5">
            <Card>
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <Badge tone="blue">Assigned work</Badge>
                  <h2 className="mt-3 text-2xl font-black">Work dispatched to you.</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
                    When Fixit247 assigns a request to you it appears here with the customer issue, location, photos, and
                    status. Accept it, update progress, and message the team from each request.
                  </p>
                </div>
                <Button href="/dashboard/tradie/jobs" variant="ghost">
                  See all work
                  <ArrowRight size={16} />
                </Button>
              </div>
              <div className="mt-5 grid gap-3">
                {activeJobs.length ? (
                  activeJobs.slice(0, 3).map((job) => <AssignedWorkRow key={job.id} job={job} />)
                ) : (
                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
                    <p className="font-black">No assigned work right now.</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                      Once your profile is reviewed, Fixit247 will dispatch suitable emergency, repair, agency, or planned
                      work to you. Keep your trade category, service areas, and availability current so the right work
                      reaches you first.
                    </p>
                    <Button href="/dashboard/tradie/profile" variant="ghost" className="mt-4">
                      Improve matching profile
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            <section className="grid gap-5 md:grid-cols-2">
              <Card>
                <CalendarCheck className="text-[var(--amber2)]" />
                <Badge className="mt-4">{nextSafetyCheck ? "Assigned" : "Member readiness"}</Badge>
                <h2 className="mt-4 text-xl font-black">Safety Check appointments</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  {nextSafetyCheck
                    ? `${nextSafetyCheck.customer_name} - ${nextSafetyCheck.property_label}. ${nextSafetyCheck.preferred_window ? `Requested window: ${nextSafetyCheck.preferred_window}.` : nextSafetyCheck.property_location}`
                    : "Help members and property owners document visible readiness concerns and identify practical follow-up work."}
                </p>
                <Button href="/dashboard/tradie/safety-checks" variant="ghost" className="mt-5 w-full">
                  View appointments
                </Button>
              </Card>
              <Card>
                <Clock3 className="text-[var(--blue)]" />
                <Badge tone="blue" className="mt-4">Work pipeline</Badge>
                <h2 className="mt-4 text-xl font-black">Assigned requests</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  Active work, customer messages, photos, and status changes stay connected to each request.
                </p>
                <Button href="/dashboard/tradie/jobs" variant="ghost" className="mt-5 w-full">
                  Open assigned work
                </Button>
              </Card>
            </section>
          </div>

          <aside className="grid gap-5">
            <Card variant="dark">
              <Zap className="text-[var(--amber)]" />
              <Badge className="mt-4">Quick actions</Badge>
              <div className="mt-5 grid gap-2">
                <ControlLink href="/dashboard/tradie/profile" icon={SlidersHorizontal} title="Availability and profile" />
                <ControlLink href="/dashboard/tradie/jobs" icon={BriefcaseBusiness} title="Assigned work" />
                <ControlLink href="/dashboard/tradie/messages" icon={Headphones} title="Messages and updates" />
                <ControlLink href="/dashboard/tradie/support" icon={Headphones} title="Fixer support" />
              </div>
            </Card>
            <Card variant="dark">
              <BadgeCheck className="text-[var(--green)]" />
              <h2 className="mt-4 text-xl font-black">What happens next</h2>
              <ol className="mt-3 grid gap-2 text-sm leading-6 text-white/70">
                <li>1. Complete and submit your Fixer profile.</li>
                <li>2. Fixit247 reviews your details and verification.</li>
                <li>3. Suitable work is dispatched straight to your dashboard.</li>
              </ol>
            </Card>
            <Card>
              <BadgeCheck className="text-[var(--green)]" />
              <h2 className="mt-4 text-xl font-black">Trust signals</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Strong profiles get matched first: trade category, service area, licence, verification, and emergency
                availability.
              </p>
              <Button href="/dashboard/tradie/profile" variant="ghost" className="mt-5 w-full">
                Complete profile
              </Button>
            </Card>
          </aside>
        </section>
      </section>
    </main>
  );
}

function DarkMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/8 p-4">
      <p className="text-xs font-black uppercase tracking-wide text-white/45">{label}</p>
      <p className="mt-2 text-xl font-black text-white">{value}</p>
    </div>
  );
}

function SignalCard({
  icon: Icon,
  label,
  value,
  detail,
  tone
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail: string;
  tone: "green" | "amber" | "blue";
}) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <Icon className={tone === "green" ? "text-[var(--green)]" : tone === "blue" ? "text-[var(--blue)]" : "text-[var(--amber2)]"} size={19} />
        <span className={`h-2.5 w-2.5 rounded-full ${tone === "green" ? "bg-[var(--green)]" : tone === "blue" ? "bg-[var(--blue)]" : "bg-[var(--amber)]"}`} />
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-wide text-[var(--text3)]">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight">{value}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--text2)]">{detail}</p>
    </Card>
  );
}

function AssignedWorkRow({ job }: { job: JobSummary }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:border-amber-200 hover:bg-white">
      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <Badge tone="blue">{statusLabel(job.status)}</Badge>
          <h3 className="mt-2 text-xl font-black">{job.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--text2)]">
            <MapPin size={14} />
            {formatJobLocation(job)}
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text3)]">{job.description}</p>
        </div>
        <div className="grid gap-2 md:min-w-36">
          <Button href={`/dashboard/tradie/jobs/${job.id}`} className="w-full">
            Open request
          </Button>
        </div>
      </div>
    </div>
  );
}

function ControlLink({ href, icon: Icon, title }: { href: string; icon: typeof Activity; title: string }) {
  return (
    <a href={href} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 p-3 text-sm font-black text-white/85 transition hover:bg-white/12">
      <Icon size={16} className="text-[var(--amber)]" />
      {title}
    </a>
  );
}

function ChecklistItem({
  icon: Icon,
  label,
  done
}: {
  icon: typeof Activity;
  label: string;
  done: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
      <div className="flex items-center justify-between gap-3">
        <Icon className={done ? "text-[var(--green)]" : "text-[var(--amber2)]"} size={18} />
        <CheckCircle2 className={done ? "text-[var(--green)]" : "text-[var(--text3)]"} size={18} />
      </div>
      <p className="mt-4 text-sm font-black leading-5">{label}</p>
      <p className="mt-1 text-xs font-semibold text-[var(--text3)]">{done ? "Added" : "Needs attention"}</p>
    </div>
  );
}

function getOnboardingItems(profile: Awaited<ReturnType<typeof getTradieProfileDetail>>) {
  const hasInsuranceDocument = Boolean(profile?.documents.some((document) => document.type === "insurance"));
  const hasTradeCategory = Boolean(profile?.trade_category && profile.trade_category !== "Profile pending");
  return [
    { icon: BriefcaseBusiness, label: "Complete business profile", done: Boolean(profile?.business_name) },
    { icon: Hammer, label: "Add trade category", done: hasTradeCategory },
    { icon: MapPin, label: "Add service areas", done: Boolean(profile?.service_area) },
    { icon: ShieldCheck, label: "Add ABN", done: Boolean(profile?.abn) },
    { icon: BadgeCheck, label: "Add licence details if applicable", done: Boolean(profile?.licence_number) },
    { icon: ClipboardCheck, label: "Add insurance status", done: profile?.public_liability_insurance === "yes" || hasInsuranceDocument },
    { icon: Zap, label: "Add emergency availability", done: Boolean(profile?.emergency_available) },
    { icon: FileImage, label: "Add previous work photos if supported", done: Boolean(profile?.documents.length) },
    { icon: Building2, label: "Confirm agency/property interest", done: Boolean(profile?.agency_property_maintenance_interest) },
    { icon: CalendarCheck, label: "Confirm emergency and planned job interest", done: Boolean(profile?.emergency_available || profile?.planned_maintenance_contracts_interest) }
  ];
}

function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
