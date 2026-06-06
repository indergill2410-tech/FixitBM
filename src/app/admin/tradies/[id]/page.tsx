import { Badge, Card, DashboardHeader } from "@/components/ui";
import { CustomerJobCard } from "@/components/job-cards";
import { getAdminFixerDetail } from "@/lib/jobs";

export default async function AdminFixerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fixer = await getAdminFixerDetail(id);

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Fixer operations" role="Admin" />
        {fixer ? (
          <div className="grid gap-5">
            <Card variant="dark">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div>
                  <Badge tone={fixer.verification_status === "approved" ? "green" : "amber"}>{fixer.verification_status ?? "pending verification"}</Badge>
                  <h1 className="mt-4 text-3xl font-black">{fixer.business_name || fixer.trade_category}</h1>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    {fixer.trade_category} · {fixer.service_area ?? "Area pending"} · {fixer.user_email ?? "No email"} · {fixer.user_phone ?? "No phone"}
                  </p>
                </div>
                <div className="grid gap-2 lg:ml-auto lg:min-w-72">
                  <Badge tone={fixer.emergency_available ? "green" : "gray"}>{fixer.emergency_available ? "Emergency available" : "Emergency off"}</Badge>
                  <Badge tone="blue">Profile health {fixer.profile_health ?? 0}%</Badge>
                  <Badge tone="purple">Rating {fixer.rating ?? 0}</Badge>
                </div>
              </div>
            </Card>

            <div className="grid gap-5 lg:grid-cols-3">
              <Card variant="dark">
                <Badge>Subscription</Badge>
                <h2 className="mt-4 text-xl font-black">{fixer.subscription?.plan ?? "starter"}</h2>
                <p className="mt-2 text-sm text-white/65">{fixer.subscription?.status ?? "No subscription row"}</p>
              </Card>
              <Card variant="dark">
                <Badge tone="green">Wallet</Badge>
                <h2 className="mt-4 text-xl font-black">{fixer.wallet?.total_available ?? 0} credits</h2>
                <p className="mt-2 text-sm text-white/65">
                  Paid {fixer.wallet?.balance ?? 0} · Bonus {fixer.wallet?.bonus_balance ?? 0}
                </p>
              </Card>
              <Card variant="dark">
                <Badge tone="blue">Lead activity</Badge>
                <h2 className="mt-4 text-xl font-black">{fixer.lead_claims.length} recent claims</h2>
                <p className="mt-2 text-sm text-white/65">Lifetime used {fixer.wallet?.lifetime_used ?? 0} credits</p>
              </Card>
            </div>

            <div className="grid gap-5 lg:grid-cols-[.65fr_.35fr]">
              <Card variant="dark">
                <Badge tone="red">Assigned work</Badge>
                <h2 className="mt-4 text-2xl font-black">{fixer.assigned_jobs.length} recent assigned requests</h2>
                <div className="mt-5 grid gap-3 text-[var(--text)]">
                  {fixer.assigned_jobs.length ? (
                    fixer.assigned_jobs.map((job) => <CustomerJobCard key={job.id} job={job} hrefPrefix="/admin/jobs" />)
                  ) : (
                    <p className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">No assigned work yet.</p>
                  )}
                </div>
              </Card>
              <Card variant="dark">
                <Badge>Recent lead claims</Badge>
                <div className="mt-5 grid gap-3">
                  {fixer.lead_claims.length ? (
                    fixer.lead_claims.map((claim) => (
                      <div key={claim.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="font-bold">{claim.credits_spent} credits · {claim.status}</p>
                        <p className="mt-1 text-xs text-white/50">{new Date(claim.created_at).toLocaleString()}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/65">No lead claims yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <Card variant="dark">
            <p className="text-white/70">Fixer not found.</p>
          </Card>
        )}
      </section>
    </main>
  );
}

