import { FileText, Wrench } from "lucide-react";
import { convertRecommendationToRequestAction } from "@/app/dashboard/customer/safety-checks/actions";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { SafetyCheckDisclaimer } from "@/components/safety-check-cards";
import { requireRole } from "@/lib/auth";
import { getCustomerSafetyCheckDetail, safetyCheckChecklist } from "@/lib/safety-checks";

export default async function SafetyCheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireRole(["customer", "admin", "super_admin"])]);
  const safetyCheck = await getCustomerSafetyCheckDetail(user, id);
  const isCompleted = safetyCheck?.status === "completed";

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Safety Check report" role="Customer account" />
        <div className="grid gap-5 lg:grid-cols-[.64fr_.36fr]">
          <Card>
            <Badge tone={isCompleted ? "green" : "gray"}>
              {safetyCheck ? safetyCheck.status.replaceAll("_", " ") : "No completed report yet"}
            </Badge>
            <FileText className="mt-5 text-[var(--amber2)]" />
            <h1 className="mt-4 text-3xl font-black">
              {isCompleted ? "Your Safety Check report is ready." : safetyCheck ? "Your Safety Check booking is saved." : "Your report is not ready yet."}
            </h1>
            <p className="mt-3 leading-7 text-[var(--text2)]">
              {safetyCheck?.summary ??
                (safetyCheck
                  ? `${safetyCheck.preferred_window ? `Requested window: ${safetyCheck.preferred_window}. ` : ""}A report is published after the visual check is completed.`
                  : "After a completed Safety Check, this page shows checklist results, score changes, summary notes, photos if available, and recommended fixes.")}
            </p>
            {safetyCheck?.score_after ? (
              <p className="mt-5 rounded-2xl bg-[var(--bg)] p-4 text-sm font-bold text-[var(--text2)]">
                Home readiness score: {safetyCheck.score_after}%
              </p>
            ) : null}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href="/dashboard/customer/safety-checks/book">Book my Safety Check</Button>
              <Button href="/post-job" variant="ghost">Get quotes from Fixers</Button>
            </div>
          </Card>
          <aside className="grid gap-5">
            <Card>
              <Wrench className="text-[var(--purple)]" />
              <h2 className="mt-4 text-xl font-black">Checklist areas</h2>
              <div className="mt-4 grid gap-2">
                {(safetyCheck?.items.length ? safetyCheck.items.map((item) => `${item.label}: ${item.status.replaceAll("_", " ")}`) : safetyCheckChecklist).map((item) => (
                  <div key={item} className="rounded-xl bg-[var(--bg)] p-3 text-sm font-semibold text-[var(--text2)]">{item}</div>
                ))}
              </div>
            </Card>
            {safetyCheck?.recommendations.length ? (
              <Card>
                <h2 className="text-xl font-black">Recommended fixes</h2>
                <div className="mt-4 grid gap-3">
                  {safetyCheck.recommendations.map((recommendation) => (
                    <div key={recommendation.id} className="rounded-xl bg-[var(--bg)] p-3 text-sm text-[var(--text2)]">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-[var(--text)]">{recommendation.title}</p>
                        <Badge tone={recommendation.priority === "urgent" || recommendation.priority === "high" ? "red" : "amber"}>
                          {recommendation.priority}
                        </Badge>
                      </div>
                      {recommendation.description ? <p className="mt-2 leading-6">{recommendation.description}</p> : null}
                      {recommendation.linked_job_id ? (
                        <Button href={`/dashboard/customer/jobs/${recommendation.linked_job_id}`} variant="ghost" className="mt-3 w-full">
                          View request
                        </Button>
                      ) : (
                        <form action={convertRecommendationToRequestAction} className="mt-3">
                          <input type="hidden" name="recommendationId" value={recommendation.id} />
                          <Button className="w-full">Start quote request</Button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
            <SafetyCheckDisclaimer />
          </aside>
        </div>
      </section>
    </main>
  );
}
