import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { AssignSafetyCheckFixerForm, SafetyCheckStatusForm } from "@/components/admin-action-forms";
import { SafetyCheckReportForm } from "@/components/safety-check-report-form";
import { SafetyCheckMiniOpsCard } from "@/components/safety-check-cards";
import { getAvailableTradiesForAdmin } from "@/lib/jobs";
import { getAdminSafetyCheckQueue } from "@/lib/safety-checks";

export default async function AdminSafetyChecksPage() {
  const [checks, fixers] = await Promise.all([getAdminSafetyCheckQueue(), getAvailableTradiesForAdmin()]);
  const booked = checks.filter((check) => check.status === "booked").length;
  const assigned = checks.filter((check) => check.status === "assigned").length;
  const completed = checks.filter((check) => check.status === "completed").length;
  const overdue = checks.filter((check) => check.status === "overdue").length;

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Safety Check operations" role="Admin" />
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <StatCard label="Booked" value={String(booked)} detail="Customer requests" />
          <StatCard label="Assigned" value={String(assigned)} detail="Fixer appointments" />
          <StatCard label="Completed" value={String(completed)} detail="Published reports" />
          <StatCard label="Overdue" value={String(overdue)} detail="Needs follow-up" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <Card>
            <Badge>Operations shell</Badge>
            <h1 className="mt-4 text-2xl font-black">Safety Check queue</h1>
            <p className="mt-3 leading-7 text-[var(--text2)]">
              Safety Checks help members prepare before emergencies and create follow-up repair opportunities. Assign a
              Fixer, move each check through its status, and publish the report from the live queue below.
            </p>
          </Card>
          <SafetyCheckMiniOpsCard />
        </div>
        <div className="mt-6 grid gap-4">
          <div>
            <Badge>Live queue</Badge>
            <h2 className="mt-3 text-2xl font-black">Member Safety Check requests</h2>
          </div>
          {checks.length ? (
            checks.map((check) => (
              <Card key={check.id}>
                <div className="grid gap-5 lg:grid-cols-[1fr_.45fr]">
                  <div>
                    <Badge tone={check.status === "completed" ? "green" : check.status === "overdue" ? "red" : "amber"}>
                      {check.status.replaceAll("_", " ")}
                    </Badge>
                    <h3 className="mt-4 text-xl font-black">{check.customer_name}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{check.property_label}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                      {check.preferred_window ? `Requested window: ${check.preferred_window}` : "No preferred window supplied"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                      {check.assigned_fixer_name ? `Assigned to ${check.assigned_fixer_name}` : "No Fixer assigned yet"}
                    </p>
                    {check.customer_notes ? <p className="mt-3 rounded-xl bg-[var(--bg2)] p-3 text-sm text-[var(--text2)]">{check.customer_notes}</p> : null}
                  </div>
                  <div className="grid gap-3">
                    <AssignSafetyCheckFixerForm safetyCheckId={check.id} tradies={fixers} />
                    <SafetyCheckStatusForm safetyCheckId={check.id} currentStatus={check.status} />
                    {check.status !== "completed" && check.status !== "cancelled" ? (
                      <div className="grid gap-3">
                        <div>
                          <Badge tone="blue">Report builder</Badge>
                          <p className="mt-2 text-sm text-[var(--text2)]">Publish checklist results, readiness score, and follow-up recommendations.</p>
                        </div>
                        <SafetyCheckReportForm safetyCheckId={check.id} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <h3 className="font-black">No Safety Check bookings yet</h3>
              <p className="mt-2 text-sm text-[var(--text2)]">Member booking requests are reviewed from this queue.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
