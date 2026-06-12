import { Badge, Card, DashboardHeader } from "@/components/ui";
import { CustomerJobCard } from "@/components/job-cards";
import { getAdminCustomerDetail } from "@/lib/jobs";

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getAdminCustomerDetail(id);

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Customer intelligence" role="Admin" />
        {customer ? (
          <div className="grid gap-5">
            <Card>
              <Badge tone={customer.status === "active" ? "green" : "gray"}>{customer.status}</Badge>
              <h1 className="mt-4 text-3xl font-black">{[customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Customer"}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                {customer.email ?? "No email"} · {customer.phone ?? "No phone"} · Joined {new Date(customer.created_at).toLocaleDateString()}
              </p>
            </Card>

            <div className="grid gap-5 lg:grid-cols-[.65fr_.35fr]">
              <Card>
                <Badge tone="red">Requests</Badge>
                <h2 className="mt-4 text-2xl font-black">{customer.jobs.length} recent requests</h2>
                <div className="mt-5 grid gap-3 text-[var(--text)]">
                  {customer.jobs.length ? (
                    customer.jobs.map((job) => <CustomerJobCard key={job.id} job={job} hrefPrefix="/admin/jobs" />)
                  ) : (
                    <p className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-[var(--text2)]">No requests yet.</p>
                  )}
                </div>
              </Card>

              <div className="grid gap-5">
                <Card>
                  <Badge>Fixit Peace</Badge>
                  <div className="mt-4 grid gap-3">
                    {customer.memberships.length ? (
                      customer.memberships.map((membership) => (
                        <div key={String(membership.id)} className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                          <p className="font-black">{String(membership.plan ?? membership.plan_code ?? "Membership")}</p>
                          <p className="mt-1 text-sm text-[var(--text2)]">{String(membership.status ?? "pending")}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-[var(--text2)]">No membership rows yet.</p>
                    )}
                  </div>
                </Card>

                <Card>
                  <Badge tone="blue">Home and road profile</Badge>
                  <p className="mt-4 text-sm leading-6 text-[var(--text2)]">{customer.properties.length} saved properties</p>
                  <p className="text-sm leading-6 text-[var(--text2)]">{customer.vehicles.length} saved vehicles</p>
                  <div className="mt-4 grid gap-2">
                    {customer.properties.slice(0, 3).map((property) => (
                      <div key={property.id} className="rounded-xl bg-[var(--bg2)] p-3 text-sm text-[var(--text2)]">
                        {property.label ?? "Property"} · {property.address}
                      </div>
                    ))}
                    {customer.vehicles.slice(0, 3).map((vehicle) => (
                      <div key={vehicle.id} className="rounded-xl bg-[var(--bg2)] p-3 text-sm text-[var(--text2)]">
                        {[vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") || vehicle.label || "Vehicle"}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card>
                  <Badge tone="green">Reviews</Badge>
                  <p className="mt-4 text-sm leading-6 text-[var(--text2)]">{customer.reviews.length} customer reviews recorded.</p>
                </Card>
              </div>
            </div>
          </div>
        ) : (
          <Card>
            <p className="text-[var(--text2)]">Customer not found.</p>
          </Card>
        )}
      </section>
    </main>
  );
}
