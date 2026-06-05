import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { TradieProfileForm } from "@/components/tradie-profile-form";
import { VerificationDocumentUploadForm } from "@/components/verification-document-upload-form";
import { requireRole } from "@/lib/auth";
import { getTradieProfileDetail } from "@/lib/jobs";

export default async function TradieProfilePage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const profile = await getTradieProfileDetail(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Business profile" role="Fixer" />
        {profile ? (
          <div className="grid gap-5">
            <div className="grid gap-4 md:grid-cols-4">
              <StatCard label="Profile health" value={`${profile.profile_health ?? 0}%`} detail="Matching readiness" />
              <StatCard label="Verification" value={profile.verification_status ?? "pending"} detail="Admin-reviewed trust" />
              <StatCard label="Availability" value={profile.availability_status ?? "available"} detail="Lead visibility" />
              <StatCard label="Response" value={`${profile.response_rate ?? 0}%`} detail="Customer confidence" />
            </div>
            <div className="grid gap-5 lg:grid-cols-[.56fr_.44fr]">
              <Card>
                <Badge tone="green">Business details</Badge>
                <h2 className="mt-4 text-2xl font-black">{profile.business_name ?? "Business profile"}</h2>
                <div className="mt-4 grid gap-3 text-sm text-[var(--text2)]">
                  <p><strong className="text-[var(--text)]">Trade:</strong> {profile.trade_category}</p>
                  <p><strong className="text-[var(--text)]">Service area:</strong> {profile.service_area ?? "Not set"}</p>
                  <p><strong className="text-[var(--text)]">ABN:</strong> {profile.abn ?? "Not supplied"}</p>
                  <p><strong className="text-[var(--text)]">Licence:</strong> {profile.licence_number ?? "Not supplied"}</p>
                  <p><strong className="text-[var(--text)]">Emergency access:</strong> {profile.emergency_available ? "Enabled" : "Disabled"}</p>
                </div>
                <div className="mt-6">
                  <TradieProfileForm profile={profile} />
                </div>
              </Card>
              <div className="grid gap-5">
                <Card>
                  <Badge tone="blue">Verification</Badge>
                  <h2 className="mt-4 text-xl font-black">Upload trade documents</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                    Licence, insurance, ABN, identity, and police checks can be submitted for admin review.
                  </p>
                  <VerificationDocumentUploadForm />
                </Card>
                <Card>
                  <Badge tone="gray">Documents</Badge>
                  <div className="mt-4 grid gap-3">
                    {profile.documents.length ? (
                      profile.documents.map((document) => (
                        <div key={document.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-bold">{document.type.replaceAll("_", " ")}</p>
                            <Badge tone={document.status === "approved" ? "green" : document.status === "rejected" ? "red" : "amber"}>
                              {document.status}
                            </Badge>
                          </div>
                          <p className="mt-1 text-xs text-[var(--text3)]">{new Date(document.created_at).toLocaleString()}</p>
                          {document.notes ? <p className="mt-2 text-sm text-[var(--text2)]">{document.notes}</p> : null}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm leading-6 text-[var(--text2)]">Uploaded documents will appear here.</p>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <h2 className="font-black">Profile not found</h2>
            <p className="mt-2 text-[var(--text2)]">Complete Fixer registration to create a business profile.</p>
          </Card>
        )}
      </section>
    </main>
  );
}
