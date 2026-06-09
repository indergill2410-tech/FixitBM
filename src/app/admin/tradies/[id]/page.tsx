import { Badge, Card, DashboardHeader } from "@/components/ui";
import { CustomerJobCard } from "@/components/job-cards";
import { fixerMarketplaceEnabled } from "@/lib/featureFlags";
import { getAdminFixerDetail } from "@/lib/jobs";

export default async function AdminFixerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const fixer = await getAdminFixerDetail(id);

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Fixer operations" role="Admin" />
        {fixer ? (
          <div className="grid gap-5">
            <Card>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div>
                  <Badge tone={fixer.verification_status === "approved" ? "green" : "amber"}>{fixer.verification_status ?? "pending verification"}</Badge>
                  <h1 className="mt-4 text-3xl font-black">{fixer.business_name || fixer.trade_category}</h1>
                  <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
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

            <div className="grid gap-5 sm:grid-cols-3">
              <Card>
                <Badge tone="blue">Profile health</Badge>
                <h2 className="mt-4 text-3xl font-black">{fixer.profile_health ?? 0}%</h2>
                <p className="mt-2 text-sm text-[var(--text2)]">Onboarding completeness</p>
              </Card>
              <Card>
                <Badge tone="purple">Rating</Badge>
                <h2 className="mt-4 text-3xl font-black">{fixer.rating ? fixer.rating.toFixed(1) : "—"}</h2>
                <p className="mt-2 text-sm text-[var(--text2)]">{fixer.total_reviews ?? 0} reviews</p>
              </Card>
              <Card>
                <Badge tone={fixer.emergency_available ? "green" : "gray"}>Availability</Badge>
                <h2 className="mt-4 text-3xl font-black">{fixer.assigned_jobs.length}</h2>
                <p className="mt-2 text-sm text-[var(--text2)]">Active assigned requests</p>
              </Card>
            </div>

            {fixerMarketplaceEnabled ? (
              <div className="grid gap-5 sm:grid-cols-3">
                <Card>
                  <Badge>Subscription</Badge>
                  <h2 className="mt-4 text-xl font-black">{fixer.subscription?.plan ?? "starter"}</h2>
                  <p className="mt-2 text-sm text-[var(--text2)]">{fixer.subscription?.status ?? "No subscription row"}</p>
                </Card>
                <Card>
                  <Badge tone="green">Wallet</Badge>
                  <h2 className="mt-4 text-xl font-black">{fixer.wallet?.total_available ?? 0} credits</h2>
                  <p className="mt-2 text-sm text-[var(--text2)]">
                    Paid {fixer.wallet?.balance ?? 0} · Bonus {fixer.wallet?.bonus_balance ?? 0}
                  </p>
                </Card>
                <Card>
                  <Badge tone="blue">Lead activity</Badge>
                  <h2 className="mt-4 text-xl font-black">{fixer.lead_claims.length} recent claims</h2>
                  <p className="mt-2 text-sm text-[var(--text2)]">Lifetime used {fixer.wallet?.lifetime_used ?? 0} credits</p>
                </Card>
              </div>
            ) : null}

            <Card>
              <Badge tone="red">Assigned work</Badge>
              <h2 className="mt-4 text-2xl font-black">{fixer.assigned_jobs.length} recent assigned requests</h2>
              <div className="mt-5 grid gap-3 text-[var(--text)]">
                {fixer.assigned_jobs.length ? (
                  fixer.assigned_jobs.map((job) => <CustomerJobCard key={job.id} job={job} hrefPrefix="/admin/jobs" />)
                ) : (
                  <p className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-[var(--text2)]">No assigned work yet.</p>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <Card>
            <p className="text-[var(--text2)]">Fixer not found.</p>
          </Card>
        )}
      </section>
    </main>
  );
}

