import { MembershipStatusForm } from "@/components/admin-action-forms";
import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { getAdminMemberships } from "@/lib/jobs";

export default async function AdminMembershipsPage() {
  const memberships = await getAdminMemberships();
  const active = memberships.filter((membership) => membership.status === "active").length;
  const pending = memberships.filter((membership) => membership.status === "pending_activation").length;
  const inactive = memberships.filter((membership) => !["active", "pending_activation"].includes(membership.status ?? "")).length;

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Memberships" role="Admin" />
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Active" value={String(active)} detail="Live Fixit Peace" />
          <StatCard label="Activating" value={String(pending)} detail="72-hour protection window" />
          <StatCard label="Inactive" value={String(inactive)} detail="Paused or cancelled" />
        </div>
        <Card>
          <Badge>Fixit Peace</Badge>
          <div className="mt-5 grid gap-3">
            {memberships.length ? (
              memberships.map((membership) => (
                <div key={membership.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{membership.plan ?? membership.plan_code ?? "Membership"}</p>
                        <Badge tone={membership.status === "active" ? "green" : membership.status === "pending_activation" ? "amber" : "gray"}>
                          {membership.status ?? "pending"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-[var(--text2)]">
                        {membership.customer_name}
                        {membership.customer_email ? ` · ${membership.customer_email}` : ""}
                      </p>
                      <p className="mt-1 text-sm text-[var(--text2)]">
                        Renewal {membership.current_period_end ? new Date(membership.current_period_end).toLocaleDateString() : "pending"} · Activation{" "}
                        {membership.activation_effective_at ? new Date(membership.activation_effective_at).toLocaleDateString() : "pending"}
                      </p>
                    </div>
                    <MembershipStatusForm membershipId={membership.id} currentStatus={membership.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-[var(--text2)]">No memberships yet.</div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
