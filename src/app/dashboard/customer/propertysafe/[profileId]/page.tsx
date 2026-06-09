import { notFound } from "next/navigation";
import { AlertTriangle, ArrowLeft, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getPropertySafeSharedRecord, propertySafeRelationshipLabel } from "@/lib/propertysafe";

export const dynamic = "force-dynamic";

const severityTone: Record<string, "red" | "amber" | "blue" | "gray"> = {
  urgent: "red",
  high: "red",
  medium: "amber",
  low: "blue"
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default async function SharedPropertySafeRecordPage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId } = await params;
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const record = await getPropertySafeSharedRecord(user, profileId);

  if (!record) notFound();

  const assessment = record.latestAssessment;

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title={record.property_label} role="Shared PropertySafe record" />

        <Button href="/dashboard/customer/propertysafe" variant="ghost" className="mb-4">
          <ArrowLeft size={15} /> All shared records
        </Button>

        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="green">{propertySafeRelationshipLabel(record.relationship)} access</Badge>
            {record.can_request_work ? <Badge tone="blue">Can request work</Badge> : null}
            {record.can_view_financials ? <Badge tone="amber">Financials visible</Badge> : null}
          </div>
          <p className="mt-3 text-sm text-[var(--text2)]">
            Shared by {record.shared_by} · Protection level: {record.profile.protection_level} · Next review{" "}
            {formatDate(record.profile.next_review_at)}
          </p>
        </Card>

        {assessment ? (
          <Card className="mt-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[var(--green)]" size={20} />
              <div>
                <Badge tone="green">Latest readiness assessment</Badge>
                <p className="mt-1 text-sm text-[var(--text3)]">Published {formatDate(assessment.published_at)}</p>
              </div>
              {typeof assessment.score_after === "number" ? (
                <span className="ml-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--green-light)] text-2xl font-black text-[var(--green)]">
                  {assessment.score_after}
                </span>
              ) : null}
            </div>
            {assessment.summary ? (
              <p className="mt-4 leading-7 text-[var(--text2)]">{assessment.summary}</p>
            ) : null}
          </Card>
        ) : (
          <Card className="mt-4">
            <p className="font-black">No published assessment yet.</p>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Once a Safety Check report is published for this property, its readiness assessment will appear here.
            </p>
          </Card>
        )}

        {record.findings.length ? (
          <Card className="mt-4">
            <Badge tone="amber">Findings</Badge>
            <h2 className="mt-3 text-xl font-black">Visible concerns from the last check</h2>
            <div className="mt-4 grid gap-3">
              {record.findings.map((finding) => (
                <div key={finding.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 font-black">
                      <AlertTriangle size={15} className="text-[var(--amber2)]" />
                      {finding.title}
                    </p>
                    <Badge tone={severityTone[finding.severity] ?? "gray"}>{finding.severity}</Badge>
                  </div>
                  {finding.notes ? <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{finding.notes}</p> : null}
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        {record.recommendations.length ? (
          <Card className="mt-4">
            <Badge tone="blue">Recommended work</Badge>
            <h2 className="mt-3 text-xl font-black">Follow-up the owner may want done</h2>
            <div className="mt-4 grid gap-3">
              {record.recommendations.map((recommendation) => (
                <div key={recommendation.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black">{recommendation.title}</p>
                    <Badge tone={severityTone[recommendation.priority] ?? "gray"}>{recommendation.priority}</Badge>
                  </div>
                  {recommendation.description ? (
                    <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{recommendation.description}</p>
                  ) : null}
                  {recommendation.trade_type ? (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--text3)]">
                      Trade: {recommendation.trade_type}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            {record.can_request_work ? (
              <p className="mt-4 text-xs leading-5 text-[var(--text3)]">
                You have permission to request work on this property. Work requests are coordinated with the property
                owner and Fixit247.
              </p>
            ) : (
              <p className="mt-4 text-xs leading-5 text-[var(--text3)]">
                You have view-only access. Requesting work is reserved for participants the owner has authorised.
              </p>
            )}
          </Card>
        ) : null}
      </section>
    </main>
  );
}
