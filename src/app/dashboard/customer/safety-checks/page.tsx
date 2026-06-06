import { CalendarCheck, FileText, ShieldCheck, Wrench } from "lucide-react";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { SafetyCheckDisclaimer } from "@/components/safety-check-cards";
import { requireRole } from "@/lib/auth";
import { getHomeProtectionSummary, recommendedFixExamples } from "@/lib/safety-checks";

export default async function SafetyChecksOverviewPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const summary = await getHomeProtectionSummary(user);
  const active = summary.membership?.status === "active";
  const latestCheck = summary.latestSafetyCheck;
  const activeCheck = summary.nextSafetyCheck;
  const completedCheck = summary.safetyChecks.find((check) => check.status === "completed");

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Your Safety Checks" role="Customer" />
        <p className="-mt-3 mb-6 max-w-2xl text-sm leading-6 text-[var(--text2)]">
          Fixit Plus helps your household prepare before emergencies become stressful.
        </p>
        <div className="grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <div className="grid gap-5">
            <Card variant="membership">
              <Badge>{active ? "Ready to book" : "Included with Fixit Plus"}</Badge>
              <h1 className="mt-4 text-3xl font-black">
                {activeCheck
                  ? "Your Safety Check booking is in progress."
                  : active
                    ? "Your next Safety Check is ready to book."
                    : "Safety Checks are included with Fixit Plus."}
              </h1>
              <p className="mt-3 leading-7 text-[var(--text2)]">
                {activeCheck
                  ? `Status: ${activeCheck.status.replaceAll("_", " ")}. ${activeCheck.preferred_window ? `Requested window: ${activeCheck.preferred_window}.` : "Fixit247 support can now assign a Fixer."}`
                  : active
                  ? "Book your Home Safety & Readiness Check and keep your home profile ready before the next emergency."
                  : "Free users can access a digital safety checklist. In-person 6-monthly Safety Checks become available after Fixit Plus membership activation."}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href={activeCheck ? `/dashboard/customer/safety-checks/${activeCheck.id}` : active ? "/dashboard/customer/safety-checks/book" : "/fixit-plus"}>
                  {activeCheck ? "View Booking" : active ? "Book My Safety Check" : "Join Fixit Plus"}
                </Button>
                <Button href="/dashboard/customer/properties" variant="ghost">Complete Home Profile</Button>
              </div>
            </Card>
            <Card>
              <FileText className="text-[var(--amber2)]" />
              <h2 className="mt-4 text-xl font-black">Last Safety Check Report</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                {completedCheck
                  ? completedCheck.summary ?? "Your completed Safety Check report is ready to review."
                  : latestCheck
                    ? "Your booking is saved. The report becomes available after the visual check is completed."
                    : "After your first completed Safety Check, this report area shows summary notes, readiness changes, findings, and recommended fixes."}
              </p>
              <Button href={completedCheck ? `/dashboard/customer/safety-checks/${completedCheck.id}` : active ? "/dashboard/customer/safety-checks/book" : "/fixit-plus"} variant="ghost" className="mt-5">
                {completedCheck ? "View Report" : active ? "Book My First Check" : "Unlock Safety Checks"}
              </Button>
            </Card>
            <Card>
              <Wrench className="text-[var(--purple)]" />
              <h2 className="mt-4 text-xl font-black">Recommended fixes</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                {summary.recommendations.length
                  ? "Recommended fixes from your Safety Check are ready for review and can become quote requests when you choose."
                  : "After a completed check, recommended fixes can become quote requests before small issues turn into bigger problems."}
              </p>
              <div className="mt-4 grid gap-2 md:grid-cols-2">
                {(summary.recommendations.length ? summary.recommendations.map((recommendation) => recommendation.title) : recommendedFixExamples.slice(0, 6)).map((fix) => (
                  <div key={fix} className="rounded-xl bg-[var(--bg)] p-3 text-sm font-bold text-[var(--text2)]">{fix}</div>
                ))}
              </div>
              <Button href="/post-job" className="mt-5">Get Quotes From Fixers</Button>
            </Card>
          </div>
          <aside className="grid gap-5">
            <Card>
              <CalendarCheck className="text-[var(--green)]" />
              <h2 className="mt-4 text-xl font-black">Next due check</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{summary.nextDueLabel}</p>
            </Card>
            <Card>
              <ShieldCheck className="text-[var(--amber2)]" />
              <h2 className="mt-4 text-xl font-black">Digital safety checklist</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Free users can use a digital checklist. Fixit Plus members get the in-person visual Safety & Readiness Check.
              </p>
            </Card>
            <SafetyCheckDisclaimer />
          </aside>
        </div>
      </section>
    </main>
  );
}
