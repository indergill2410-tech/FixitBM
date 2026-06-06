import { CalendarCheck, MapPin, ShieldCheck } from "lucide-react";
import { SafetyCheckReportForm } from "@/components/safety-check-report-form";
import { Badge, Button, Card, DashboardHeader, StatCard } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getTradieAssignedSafetyChecks } from "@/lib/safety-checks";

export default async function TradieSafetyChecksPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const checks = await getTradieAssignedSafetyChecks(user);
  const assigned = checks.filter((check) => check.status === "assigned").length;
  const booked = checks.filter((check) => check.status === "booked").length;
  const overdue = checks.filter((check) => check.status === "overdue").length;

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Safety Check appointments" role="Fixer" />
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Assigned" value={String(assigned)} detail="Ready to complete" />
          <StatCard label="Booked" value={String(booked)} detail="Awaiting appointment detail" />
          <StatCard label="Overdue" value={String(overdue)} detail="Needs follow-up" />
        </div>
        <Card variant="dark">
          <Badge tone="green">Member readiness</Badge>
          <h1 className="mt-4 text-2xl font-black">Complete the check, then publish the report.</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
            Use the checklist to record visible readiness issues, raise the home score, and recommend practical follow-up work
            that the customer can turn into a request.
          </p>
        </Card>

        <div className="mt-6 grid gap-5">
          {checks.length ? (
            checks.map((check) => (
              <Card key={check.id} variant="dark">
                <div className="grid gap-5 lg:grid-cols-[.42fr_.58fr]">
                  <div>
                    <Badge tone={check.status === "assigned" ? "green" : check.status === "overdue" ? "red" : "amber"}>
                      {check.status.replaceAll("_", " ")}
                    </Badge>
                    <CalendarCheck className="mt-5 text-[var(--amber2)]" />
                    <h2 className="mt-4 text-2xl font-black">{check.customer_name}</h2>
                    <div className="mt-4 grid gap-3 text-sm leading-6 text-white/70">
                      <p className="flex gap-2">
                        <ShieldCheck className="mt-1 shrink-0 text-[var(--amber2)]" size={16} />
                        {check.check_type === "home_and_road" ? "Home and road readiness check" : "Home readiness check"}
                      </p>
                      <p className="flex gap-2">
                        <MapPin className="mt-1 shrink-0 text-[var(--amber2)]" size={16} />
                        {check.property_label} · {check.property_location}
                      </p>
                      <p>{check.preferred_window ? `Requested window: ${check.preferred_window}` : "No preferred window supplied yet."}</p>
                      {check.customer_notes ? <p className="rounded-xl bg-white/5 p-3">{check.customer_notes}</p> : null}
                    </div>
                    <Button href="/dashboard/tradie" variant="ghost" className="mt-5">
                      Back to command centre
                    </Button>
                  </div>
                  <SafetyCheckReportForm safetyCheckId={check.id} />
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <Badge>Clear queue</Badge>
              <h2 className="mt-4 text-2xl font-black">No Safety Check appointments assigned yet.</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Assigned member Safety Checks are shown here with the report form and readiness checklist.
              </p>
              <Button href="/dashboard/tradie/leads" className="mt-5">
                View available requests
              </Button>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
