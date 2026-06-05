import { Badge, Card, DashboardHeader } from "@/components/ui";
import { getAdminMemberships } from "@/lib/jobs";

export default async function AdminMembershipsPage() {
  const memberships = await getAdminMemberships();

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Memberships" role="Admin" />
        <Card variant="dark">
          <Badge>Fixit Plus</Badge>
          <div className="mt-5 grid gap-3">
            {memberships.length ? (
              memberships.map((membership) => (
                <div key={membership.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div>
                      <p className="font-black">{membership.plan ?? membership.plan_code ?? "Membership"}</p>
                      <p className="mt-1 text-sm text-white/65">
                        Customer {membership.customer_id ?? "unknown"} · Renewal {membership.current_period_end ? new Date(membership.current_period_end).toLocaleDateString() : "pending"}
                      </p>
                    </div>
                    <Badge tone={membership.status === "active" ? "green" : "gray"} className="md:ml-auto">{membership.status ?? "pending"}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">No memberships yet.</div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
