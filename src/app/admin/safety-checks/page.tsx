import { Badge, Card, DashboardHeader } from "@/components/ui";
import { SafetyCheckMiniOpsCard } from "@/components/safety-check-cards";

export default function AdminSafetyChecksPage() {
  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Safety Check operations" role="Admin" />
        <div className="grid gap-5 lg:grid-cols-[.62fr_.38fr]">
          <Card variant="dark">
            <Badge>Operations shell</Badge>
            <h1 className="mt-4 text-2xl font-black">Safety Check queue</h1>
            <p className="mt-3 leading-7 text-white/70">
              Safety Checks help members prepare before emergencies and create follow-up repair opportunities. Track due
              checks, bookings, overdue reviews, completed reports, and recommendations from this queue.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {["Due checks", "Booked checks", "Overdue checks", "Completed reports", "Assign Fixer", "Recommended Fixes"].map((item) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm font-bold text-white/75">
                  {item}
                </div>
              ))}
            </div>
          </Card>
          <SafetyCheckMiniOpsCard />
        </div>
      </section>
    </main>
  );
}
