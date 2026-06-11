import { Download, FileText, ShieldCheck, Wrench } from "lucide-react";
import { convertRecommendationToRequestAction } from "@/app/dashboard/customer/safety-checks/actions";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { SafetyCheckDisclaimer } from "@/components/safety-check-cards";
import { requireRole } from "@/lib/auth";
import { getCustomerSafetyCheckDetail, safetyCheckChecklist, type SafetyCheckItem } from "@/lib/safety-checks";
import { complianceResultLabel, inspectionCategoryMap, type ComplianceResult } from "@/lib/inspection-templates";

const resultTone: Record<ComplianceResult, "green" | "red" | "amber" | "gray"> = {
  pass: "green",
  fail: "red",
  action_required: "amber",
  not_applicable: "gray"
};

const itemStatusTone: Record<string, "green" | "red" | "amber" | "gray"> = {
  pass: "green",
  ok: "green",
  fail: "red",
  attention: "red",
  action_required: "amber",
  recommended: "amber",
  na: "gray",
  not_checked: "gray"
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SafetyCheckDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireRole(["customer", "admin", "super_admin"])]);
  const safetyCheck = await getCustomerSafetyCheckDetail(user, id);
  const isCompleted = safetyCheck?.status === "completed";
  const isCompliance = Boolean(safetyCheck?.certificate_number);
  const categoryResults = safetyCheck?.category_results ?? {};

  // Group checklist items by their category for a clean per-section report.
  const itemsByCategory = new Map<string, SafetyCheckItem[]>();
  for (const item of safetyCheck?.items ?? []) {
    const key = item.category_key ?? "general_readiness";
    const list = itemsByCategory.get(key) ?? [];
    list.push(item);
    itemsByCategory.set(key, list);
  }

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title={isCompliance ? "Rental compliance report" : "Safety Check report"} role="Customer account" />
        <div className="grid gap-5 lg:grid-cols-[.64fr_.36fr]">
          <div className="grid gap-5">
            <Card>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={isCompleted ? "green" : "gray"}>
                  {safetyCheck ? safetyCheck.status.replaceAll("_", " ") : "No completed report yet"}
                </Badge>
                {safetyCheck?.compliance_result ? (
                  <Badge tone={resultTone[safetyCheck.compliance_result]}>
                    {complianceResultLabel[safetyCheck.compliance_result]}
                  </Badge>
                ) : null}
              </div>
              <FileText className="mt-5 text-[var(--amber2)]" />
              <h1 className="mt-4 text-3xl font-black">
                {isCompliance
                  ? "Your compliance report is ready."
                  : isCompleted
                    ? "Your Safety Check report is ready."
                    : safetyCheck
                      ? "Your Safety Check booking is saved."
                      : "Your report is not ready yet."}
              </h1>
              <p className="mt-3 leading-7 text-[var(--text2)]">
                {safetyCheck?.summary ??
                  (safetyCheck
                    ? `${safetyCheck.preferred_window ? `Requested window: ${safetyCheck.preferred_window}. ` : ""}A report is published after the check is completed.`
                    : "After a completed check, this page shows results, score changes, summary notes, photos, and recommended fixes.")}
              </p>
              {isCompliance ? (
                <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">Certificate</p>
                  <p className="mt-1 text-lg font-black">{safetyCheck?.certificate_number}</p>
                  <p className="mt-1 text-sm text-[var(--text2)]">
                    Issued {formatDate(safetyCheck?.certificate_issued_at ?? null)}
                    {safetyCheck?.inspector_name ? ` · Inspector: ${safetyCheck.inspector_name}` : ""}
                    {safetyCheck?.inspector_licence_no ? ` · Licence ${safetyCheck.inspector_licence_no}` : ""}
                  </p>
                  <Button href={`/api/safety-checks/${id}/certificate`} className="mt-4">
                    <Download size={16} /> Download certificate (PDF)
                  </Button>
                </div>
              ) : safetyCheck?.score_after ? (
                <p className="mt-5 rounded-2xl bg-[var(--bg)] p-4 text-sm font-bold text-[var(--text2)]">
                  Home readiness score: {safetyCheck.score_after}%
                </p>
              ) : null}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button href="/dashboard/customer/safety-checks/book">Book another check</Button>
                <Button href="/post-job" variant="ghost">Get quotes from Fixers</Button>
              </div>
            </Card>

            {Object.keys(categoryResults).length ? (
              <Card>
                <ShieldCheck className="text-[var(--green)]" />
                <h2 className="mt-4 text-xl font-black">Results by category</h2>
                <div className="mt-4 grid gap-4">
                  {Object.entries(categoryResults).map(([key, result]) => {
                    const template = inspectionCategoryMap[key];
                    const categoryItems = itemsByCategory.get(key) ?? [];
                    return (
                      <div key={key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-black">{result.label}</p>
                          <Badge tone={resultTone[result.result]}>{complianceResultLabel[result.result]}</Badge>
                        </div>
                        {result.next_due_at ? (
                          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">
                            Next check due {formatDate(result.next_due_at)}
                            {template?.requiresLicence ? ` · ${template.licenceTrade}` : ""}
                          </p>
                        ) : null}
                        {categoryItems.length ? (
                          <div className="mt-3 grid gap-1.5">
                            {categoryItems.map((item) => (
                              <div key={item.id} className="flex items-center justify-between gap-2 text-sm">
                                <span className="text-[var(--text2)]">{item.label}</span>
                                <Badge tone={itemStatusTone[item.status] ?? "gray"}>{item.status.replaceAll("_", " ")}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ) : null}

            {safetyCheck?.photos.length ? (
              <Card>
                <h2 className="text-xl font-black">Photo evidence</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {safetyCheck.photos.map((photo) =>
                    photo.signed_url ? (
                      <a key={photo.id} href={photo.signed_url} target="_blank" rel="noreferrer" className="group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.signed_url}
                          alt={photo.caption ?? "Inspection photo"}
                          className="h-28 w-full rounded-xl border border-[var(--border)] object-cover"
                        />
                        {photo.caption ? <p className="mt-1 text-xs text-[var(--text3)]">{photo.caption}</p> : null}
                      </a>
                    ) : null
                  )}
                </div>
              </Card>
            ) : null}
          </div>

          <aside className="grid gap-5">
            {!Object.keys(categoryResults).length ? (
              <Card>
                <Wrench className="text-[var(--purple)]" />
                <h2 className="mt-4 text-xl font-black">Checklist areas</h2>
                <div className="mt-4 grid gap-2">
                  {(safetyCheck?.items.length ? safetyCheck.items.map((item) => `${item.label}: ${item.status.replaceAll("_", " ")}`) : safetyCheckChecklist).map((item) => (
                    <div key={item} className="rounded-xl bg-[var(--bg)] p-3 text-sm font-semibold text-[var(--text2)]">{item}</div>
                  ))}
                </div>
              </Card>
            ) : null}
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
