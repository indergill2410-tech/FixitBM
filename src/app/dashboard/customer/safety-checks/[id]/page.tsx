import { FileText, Wrench } from "lucide-react";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { SafetyCheckDisclaimer } from "@/components/safety-check-cards";
import { requireRole } from "@/lib/auth";
import { safetyCheckChecklist } from "@/lib/safety-checks";

export default async function SafetyCheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }] = await Promise.all([params, requireRole(["customer", "admin", "super_admin"])]);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Safety Check Report" role={`Report ${id}`} />
        <div className="grid gap-5 lg:grid-cols-[.64fr_.36fr]">
          <Card>
            <Badge tone="gray">No completed report yet</Badge>
            <FileText className="mt-5 text-[var(--amber2)]" />
            <h1 className="mt-4 text-3xl font-black">Your report is not ready yet.</h1>
            <p className="mt-3 leading-7 text-[var(--text2)]">
              After a completed Safety Check, this page shows checklist results, score changes, summary notes, photos if
              available, and recommended fixes.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard/customer/safety-checks/book">Book My Safety Check</Button>
              <Button href="/post-job" variant="ghost">Get Quotes From Fixers</Button>
            </div>
          </Card>
          <aside className="grid gap-5">
            <Card>
              <Wrench className="text-[var(--purple)]" />
              <h2 className="mt-4 text-xl font-black">Checklist areas</h2>
              <div className="mt-4 grid gap-2">
                {safetyCheckChecklist.map((item) => (
                  <div key={item} className="rounded-xl bg-[var(--bg)] p-3 text-sm font-semibold text-[var(--text2)]">{item}</div>
                ))}
              </div>
            </Card>
            <SafetyCheckDisclaimer />
          </aside>
        </div>
      </section>
    </main>
  );
}
