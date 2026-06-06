import { CalendarCheck, Car, CheckCircle2, Gauge, Home, ShieldCheck, Wrench } from "lucide-react";
import { activationCopy, recommendedFixExamples, safetyCheckDisclaimer, type HomeProtectionSummary } from "@/lib/safety-checks";
import { Badge, Button, Card } from "@/components/ui";

export function SafetyCheckDisclaimer() {
  return (
    <Card variant="emergency">
      <Badge tone="amber">Important</Badge>
      <p className="mt-3 text-sm leading-7 text-[var(--text2)]">{safetyCheckDisclaimer}</p>
    </Card>
  );
}

export function ProtectionHeroCard({ summary }: { summary: HomeProtectionSummary }) {
  const membership = summary.membership;
  const isActive = membership?.status === "active";
  const isComplete = isActive && membership?.plan === "complete";

  const headline = !membership
    ? "Your home is not protected yet."
    : isComplete
      ? "Your home and road protection is active."
      : isActive
        ? "Your home protection is active."
        : "Your Fixit Plus status is pending.";

  const copy = !membership
    ? "Fixit Plus gives your household a plan before the next leak, lockout, fault, storm, breakdown, or urgent repair. Join today and get your first Safety & Readiness Check included."
    : isComplete
      ? "Your household has peace of mind for the two places life breaks down most often - home and road."
      : isActive
        ? "Your household has home emergency peace of mind, saved home details, and a 6-monthly Safety Check to help you stay ready."
        : "Your membership is in its activation window. You can still start urgent requests free, and Safety Check booking unlocks after activation.";

  return (
    <Card variant="membership" className="relative overflow-hidden">
      <div className="absolute right-6 top-6 hidden h-24 w-24 rounded-full bg-[var(--amber)] opacity-10 md:block" />
      <Badge>{membership ? (isActive ? "Fixit Plus active" : "Pay-as-you-go") : "Pay-as-you-go"}</Badge>
      <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight">{headline}</h2>
      <p className="mt-3 max-w-2xl leading-7 text-[var(--text2)]">{copy}</p>
      <p className="mt-4 text-sm font-bold text-[var(--amber2)]">
        Includes a visual Home Safety & Readiness Check on signup, then every 6 months while active.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button href={isActive ? "/dashboard/customer/safety-checks/book" : "/fixit-plus"}>
          {isActive ? (isComplete ? "Book My Readiness Check" : "Book My Safety Check") : "Protect My Home"}
        </Button>
        <Button href={isComplete ? "/dashboard/customer/membership" : "/fixit-plus"} variant="ghost">
          {isComplete ? "Manage Protection" : isActive ? "Upgrade to Complete" : "See What’s Included"}
        </Button>
      </div>
    </Card>
  );
}

export function HomeProtectionScoreCard({ summary }: { summary: HomeProtectionSummary }) {
  const color = summary.score >= 75 ? "var(--green)" : "var(--amber)";

  return (
    <Card>
      <Badge tone={summary.scoreBand === "high" ? "green" : "amber"}>Home Protection Score</Badge>
      <div className="mt-5 grid gap-5 md:grid-cols-[160px_1fr] md:items-center">
        <div
          className="grid h-36 w-36 place-items-center rounded-full"
          style={{ background: `conic-gradient(${color} ${summary.score * 3.6}deg, var(--bg2) 0deg)` }}
        >
          <div className="grid h-28 w-28 place-items-center rounded-full bg-white shadow-[var(--shadow)]">
            <div className="text-center">
              <p className="text-3xl font-black">{summary.score}%</p>
              <p className="text-[10px] font-bold uppercase text-[var(--text3)]">Readiness</p>
            </div>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">Protection readiness, not a certified safety rating.</p>
          <h2 className="mt-3 text-2xl font-black">{summary.scoreHeadline}</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{summary.scoreCopy}</p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <Button href={summary.membership?.status === "active" ? "/dashboard/customer/safety-checks/book" : "/fixit-plus"}>
              {summary.membership?.status === "active" ? "Book Safety Check" : "Join Fixit Plus"}
            </Button>
            <Button href="/dashboard/customer/properties" variant="ghost">Complete Home Profile</Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SafetyCheckStatusCard({ summary }: { summary: HomeProtectionSummary }) {
  const isActive = summary.membership?.status === "active";
  const activeCheck = summary.nextSafetyCheck;
  const title = isActive
    ? activeCheck
      ? "Your Safety Check booking is in progress."
      : "Your next Safety Check is ready to book."
    : summary.membership
      ? "Your Safety Check can be booked after activation."
      : "Unlock your first Safety Check.";
  const copy = isActive
    ? activeCheck
      ? activeCheck.preferred_window
        ? `Requested window: ${activeCheck.preferred_window}.`
        : "Fixit247 support can now assign a Fixer."
      : "A visual readiness check helps spot visible risks, save key home details, and prepare before the next emergency."
    : summary.membership
      ? activationCopy
      : "Fixit Plus members get a Home Safety & Readiness Check on signup, then every 6 months while active.";

  return (
    <Card variant="membership">
      <CalendarCheck className="text-[var(--amber2)]" />
      <Badge className="mt-4">{summary.nextDueLabel}</Badge>
      <h2 className="mt-4 text-xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{copy}</p>
      <Button href={activeCheck ? `/dashboard/customer/safety-checks/${activeCheck.id}` : isActive ? "/dashboard/customer/safety-checks/book" : "/fixit-plus"} className="mt-5 w-full">
        {summary.safetyCheckCta}
      </Button>
    </Card>
  );
}

export function RecommendedFixesCard({ summary }: { summary: HomeProtectionSummary }) {
  return (
    <Card>
      <Wrench className="text-[var(--purple)]" />
      <h2 className="mt-4 text-xl font-black">Recommended fixes</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
        After a completed Safety Check, recommended fixes can show visible issues, notes, and next steps. Approve one when you want quotes from Fixers.
      </p>
      <div className="mt-4 grid gap-2">
        {(summary.recommendedFixes.length ? summary.recommendedFixes : recommendedFixExamples.slice(0, 4)).map((fix) => (
          <div key={fix} className="flex items-center gap-2 rounded-xl bg-[var(--bg)] p-3 text-sm font-semibold text-[var(--text2)]">
            <CheckCircle2 size={16} className="text-[var(--green)]" />
            {fix}
          </div>
        ))}
      </div>
      <Button href="/post-job" variant="ghost" className="mt-5 w-full">Get Quotes From Fixers</Button>
    </Card>
  );
}

export function HomeProfileReadinessCard({ summary }: { summary: HomeProtectionSummary }) {
  const checklist = [
    ["Property address saved", summary.properties.length > 0],
    ["Default home selected", summary.properties.some((property) => property.is_default)],
    ["Main water shutoff location saved", false],
    ["Switchboard location saved", false],
    ["Emergency access notes saved", false],
    ["Photos of key utility locations uploaded", false]
  ];

  return (
    <Card>
      <Home className="text-[var(--amber2)]" />
      <h2 className="mt-4 text-xl font-black">Make emergencies faster later.</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
        Small details can save time when something goes wrong. Add your home details now so future requests are faster and clearer.
      </p>
      <div className="mt-4 grid gap-2">
        {checklist.map(([label, done]) => (
          <div key={String(label)} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg)] p-3 text-sm font-semibold">
            <span>{label}</span>
            <Badge tone={done ? "green" : "gray"}>{done ? "Ready" : "To add"}</Badge>
          </div>
        ))}
      </div>
      <Button href="/dashboard/customer/properties" className="mt-5 w-full">Complete Home Profile</Button>
    </Card>
  );
}

export function VehicleProtectionCard({ summary }: { summary: HomeProtectionSummary }) {
  const isComplete = summary.membership?.status === "active" && summary.membership.plan === "complete";

  return (
    <Card>
      <Car className="text-[var(--blue)]" />
      <h2 className="mt-4 text-xl font-black">{isComplete ? "Your road profile is ready." : "Protect your road moments too."}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
        {isComplete
          ? "Add vehicle details so roadside requests move faster when life breaks down away from home."
          : "Fixit Plus Complete adds roadside peace of mind for flat tyres, dead batteries, lockouts, fuel emergencies, towing coordination, and breakdown stress."}
      </p>
      <Button href={isComplete ? "/dashboard/customer/vehicles" : "/fixit-plus"} variant="ghost" className="mt-5 w-full">
        {isComplete ? "Add Vehicle Details" : "Upgrade to Complete"}
      </Button>
    </Card>
  );
}

export function SafetyCheckMiniOpsCard() {
  return (
    <Card variant="dark">
      <ShieldCheck className="text-[var(--amber)]" />
      <Badge className="mt-4">Safety Checks</Badge>
      <h2 className="mt-4 text-xl font-black">Prepare members before emergencies.</h2>
      <p className="mt-2 text-sm leading-6 text-white/70">
        Safety Check operations will track due checks, bookings, completed reports, recommended fixes, and follow-up quote opportunities.
      </p>
    </Card>
  );
}

export function SafetyCheckMetricCard() {
  return <Card><Gauge className="text-[var(--green)]" /><h2 className="mt-4 font-black">Safety Check readiness</h2><p className="mt-2 text-sm leading-6 text-[var(--text2)]">Operational counts show due checks, bookings, reports, and recommendations as the Safety Check workflow grows.</p></Card>;
}
