import type { LucideIcon } from "lucide-react";
import { CalendarClock, Home, Phone, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { SafetyCheckDisclaimer } from "@/components/safety-check-cards";
import { requireRole } from "@/lib/auth";
import { activationCopy, getHomeProtectionSummary } from "@/lib/safety-checks";

export default async function BookSafetyCheckPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const summary = await getHomeProtectionSummary(user);
  const active = summary.membership?.status === "active";

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Book your Home Safety & Readiness Check" role="Customer" />
        <div className="grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <Card variant={active ? "membership" : "emergency"}>
            <Badge>{active ? "Ready to book" : "Membership required"}</Badge>
            <h1 className="mt-4 text-3xl font-black">
              {active ? "Book your Safety Check and stay prepared." : "Safety Checks are included with Fixit Plus."}
            </h1>
            <p className="mt-3 leading-7 text-[var(--text2)]">
              {active
                ? "This visual check helps your household prepare before emergencies become stressful."
                : summary.membership
                  ? "Your Safety Check can be booked after your Fixit Plus activation period."
                  : "Join Fixit Plus to unlock your first Safety & Readiness Check included with membership."}
            </p>
            {!active ? (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Button href="/fixit-plus">Join Fixit Plus</Button>
                <Button href="/dashboard/customer/membership" variant="ghost">View Membership</Button>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                <ReadonlyField icon={Home} label="Property" value={summary.properties[0]?.label ?? summary.properties[0]?.address ?? "Add a saved property first"} />
                <ReadonlyField icon={CalendarClock} label="Preferred date" value="Booking form will connect after Safety Check tables are added" />
                <ReadonlyField icon={Phone} label="Contact phone" value={user.phone ?? "Use account phone or update your profile"} />
                <ReadonlyField icon={ShieldCheck} label="Key concerns" value="Leaks, lockouts, switchboard access, smoke alarms, roof, gutters, hot water, or anything worrying you" />
                <Button disabled variant="ghost">Booking persistence coming soon</Button>
              </div>
            )}
          </Card>
          <aside className="grid gap-5">
            <Card>
              <Badge>Activation</Badge>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{activationCopy}</p>
            </Card>
            <SafetyCheckDisclaimer />
          </aside>
        </div>
      </section>
    </main>
  );
}

function ReadonlyField({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">
        <Icon size={16} className="text-[var(--amber2)]" />
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold text-[var(--text2)]">{value}</p>
    </div>
  );
}
