import Link from "next/link";
import { Badge, Card, DashboardHeader } from "@/components/ui";
import { getAdminFixers } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function AdminTradiesPage() {
  const fixers = await getAdminFixers();
  const ranked = [...fixers].sort((a, b) => b.assigned_count - a.assigned_count);

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Fixer network" role="Admin" />
        <Card variant="dark">
          <Badge tone="green">Live directory</Badge>
          <h1 className="mt-4 text-2xl font-black">{fixers.length} Fixers in the network</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Ranked by active load. Compare rating, response rate, and profile health before dispatching new work.
          </p>
          <div className="mt-5 grid gap-3">
            {ranked.length ? (
              ranked.map((fixer) => (
                <Link key={fixer.id} href={`/admin/tradies/${fixer.id}`} className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-300/40 hover:bg-white/10">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div className="min-w-0">
                      <p className="font-black">{fixer.business_name || fixer.trade_category}</p>
                      <p className="mt-1 text-sm text-white/65">
                        {fixer.trade_category} · {fixer.service_area ?? "Area pending"}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 lg:ml-auto">
                      <PerfMetric label="Active load" value={String(fixer.assigned_count)} />
                      <PerfMetric label="Claims" value={String(fixer.claimed_count)} />
                      <PerfMetric label="Rating" value={fixer.rating ? `${fixer.rating.toFixed(1)}★` : "—"} />
                      <PerfMetric label="Response" value={fixer.response_rate ? `${fixer.response_rate}%` : "—"} />
                      <PerfMetric label="Profile" value={fixer.profile_health ? `${fixer.profile_health}%` : "—"} />
                      <div className="flex flex-col gap-1.5">
                        <Badge tone={fixer.emergency_available ? "green" : "gray"}>{fixer.emergency_available ? "Emergency on" : "Emergency off"}</Badge>
                        <Badge tone={fixer.verification_status === "approved" ? "green" : "amber"}>{fixer.verification_status ?? "pending"}</Badge>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">No Fixer profiles yet.</div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}

function PerfMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-black tabular-nums">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-white/40">{label}</p>
    </div>
  );
}
