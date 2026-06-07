import { Building2, CheckCircle2, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { PropertySafeInviteForm } from "@/components/admin-action-forms";
import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { getAdminPropertySafeProfiles } from "@/lib/propertysafe";

export default async function AdminPropertySafePage() {
  const profiles = await getAdminPropertySafeProfiles();
  const activeProfiles = profiles.filter((profile) => profile.status === "active").length;
  const sharedAccessCount = profiles.reduce((total, profile) => total + profile.participant_count, 0);
  const recommendations = profiles.reduce((total, profile) => total + profile.open_recommendation_count, 0);
  const agencyReady = profiles.filter((profile) => profile.participant_count > 0).length;

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="PropertySafe access" role="Admin" />

        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <StatCard label="Active records" value={String(activeProfiles)} detail="PropertySafe profiles" />
          <StatCard label="Shared users" value={String(sharedAccessCount)} detail="Owners, landlords, agencies" />
          <StatCard label="Agency ready" value={String(agencyReady)} detail="Records with explicit access" />
          <StatCard label="Open fixes" value={String(recommendations)} detail="Recommended next work" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[.64fr_.36fr]">
          <Card variant="dark">
            <Badge>Agency and owner access</Badge>
            <h1 className="mt-4 text-2xl font-black">PropertySafe records</h1>
            <p className="mt-3 leading-7 text-white/70">
              Share only explicit access to real PropertySafe records. Owners, landlords, property managers, and agency
              teams see the property history they are meant to see, without changing the Safety Check workflow.
            </p>
          </Card>
          <Card variant="dark">
            <Badge tone="green">Business rule</Badge>
            <h2 className="mt-4 text-xl font-black">Access is per property</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Do not infer access from suburb, email domain, or role alone. Every shared PropertySafe view needs a saved
              participant record and an audit trail.
            </p>
          </Card>
        </div>

        <div className="mt-6 grid gap-4">
          {profiles.length ? (
            profiles.map((profile) => (
              <Card key={profile.id} variant="dark">
                <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={profile.status === "active" ? "green" : "amber"}>{profile.status}</Badge>
                      <Badge tone="blue">{profile.protection_level}</Badge>
                    </div>
                    <h2 className="mt-4 text-2xl font-black">{profile.property_label}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {profile.customer_name}
                      {profile.customer_email ? ` · ${profile.customer_email}` : ""}
                    </p>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <Metric icon={Users} label="Shared access" value={String(profile.participant_count)} />
                      <Metric icon={ShieldCheck} label="Recommendations" value={String(profile.open_recommendation_count)} />
                      <Metric
                        icon={CheckCircle2}
                        label="Last check"
                        value={profile.last_assessed_at ? new Date(profile.last_assessed_at).toLocaleDateString() : "Pending"}
                      />
                      <Metric
                        icon={Building2}
                        label="Next review"
                        value={profile.next_review_at ? new Date(profile.next_review_at).toLocaleDateString() : "Pending"}
                      />
                    </div>

                    {profile.latest_assessment_summary ? (
                      <p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
                        {profile.latest_assessment_summary}
                      </p>
                    ) : (
                      <p className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
                        This record is ready for access setup. Published Safety Check reports will fill the PropertySafe
                        history when real checks are completed.
                      </p>
                    )}
                  </div>

                  <div>
                    <Badge>Share access</Badge>
                    <h3 className="mt-3 font-black">Owner, landlord, or agency</h3>
                    <p className="mt-2 text-sm leading-6 text-white/60">
                      Invite the exact person who should see this property record.
                    </p>
                    <div className="mt-4">
                      <PropertySafeInviteForm profileId={profile.id} />
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card variant="dark">
              <Badge>PropertySafe</Badge>
              <h2 className="mt-4 text-xl font-black">No PropertySafe records yet</h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                PropertySafe records are created from real saved properties and completed Safety Check reports.
              </p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <Icon className="text-[var(--amber)]" size={18} />
      <p className="mt-3 text-xs font-black uppercase tracking-wide text-white/45">{label}</p>
      <p className="mt-1 text-sm font-black text-white">{value}</p>
    </div>
  );
}
