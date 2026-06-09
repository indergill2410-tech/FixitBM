import Link from "next/link";
import { ArrowRight, Building2, MapPin, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { PropertySafeInviteActions } from "@/components/propertysafe/shared-access-forms";
import { requireRole } from "@/lib/auth";
import { getPropertySafeSharedAccess, propertySafeRelationshipLabel } from "@/lib/propertysafe";

export const dynamic = "force-dynamic";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" });
}

export default async function CustomerPropertySafePage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const { pendingInvites, records } = await getPropertySafeSharedAccess(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="PropertySafe" role="Shared property records" />

        {pendingInvites.length ? (
          <Card className="mt-2">
            <Badge tone="amber">Pending invitations</Badge>
            <h2 className="mt-3 text-2xl font-black">You have been invited to view a property record.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
              Accept to see the Safety Check history, findings, and recommended work shared with you. You can decline at
              any time.
            </p>
            <div className="mt-5 grid gap-3">
              {pendingInvites.map((invite) => (
                <div key={invite.participant_id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="flex items-center gap-2 font-black">
                        <Building2 size={16} className="text-[var(--amber2)]" />
                        {invite.property_label}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text2)]">
                        Shared by {invite.shared_by} · Access: {propertySafeRelationshipLabel(invite.relationship)}
                        {invite.can_request_work ? " · Can request work" : ""}
                      </p>
                    </div>
                    <PropertySafeInviteActions participantId={invite.participant_id} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : null}

        <Card className="mt-5">
          <Badge tone="green">Shared with you</Badge>
          <h2 className="mt-3 text-2xl font-black">Property records you can view.</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
            Records an owner or agency has shared with your account. Open one to see its latest readiness assessment.
          </p>
          <div className="mt-5 grid gap-3">
            {records.length ? (
              records.map((record) => (
                <Link
                  key={record.profile_id}
                  href={`/dashboard/customer/propertysafe/${record.profile_id}`}
                  className="block rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4 transition hover:border-amber-200 hover:bg-white"
                >
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="flex items-center gap-2 font-black">
                        <ShieldCheck size={16} className="text-[var(--green)]" />
                        {record.property_label}
                      </p>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[var(--text2)]">
                        <MapPin size={13} />
                        Shared by {record.shared_by} · {propertySafeRelationshipLabel(record.relationship)} · Last
                        assessed {formatDate(record.last_assessed_at)}
                      </p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-bold text-[var(--amber2)]">
                      Open record <ArrowRight size={15} />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5">
                <p className="font-black">No shared records yet.</p>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  When an owner or agency shares a PropertySafe record with your email, it will appear here to accept.
                </p>
                <Button href="/dashboard/customer" variant="ghost" className="mt-4">
                  Back to dashboard
                </Button>
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
