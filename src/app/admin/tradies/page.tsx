import Link from "next/link";
import { Badge, Card, DashboardHeader } from "@/components/ui";
import { getAdminFixers } from "@/lib/jobs";

export default async function AdminTradiesPage() {
  const fixers = await getAdminFixers();

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Fixer network" role="Admin" />
        <Card variant="dark">
          <Badge tone="green">Live directory</Badge>
          <h1 className="mt-4 text-2xl font-black">{fixers.length} Fixers in the network</h1>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Manage availability, verification, profile health, assigned work, and lead activity.
          </p>
          <div className="mt-5 grid gap-3">
            {fixers.length ? (
              fixers.map((fixer) => (
                <Link key={fixer.id} href={`/admin/tradies/${fixer.id}`} className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-300/40 hover:bg-white/10">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    <div>
                      <p className="font-black">{fixer.business_name || fixer.trade_category}</p>
                      <p className="mt-1 text-sm text-white/65">
                        {fixer.trade_category} · {fixer.service_area ?? "Area pending"} · {fixer.assigned_count} assigned · {fixer.claimed_count} claims
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:ml-auto">
                      <Badge tone={fixer.emergency_available ? "green" : "gray"}>{fixer.emergency_available ? "Emergency on" : "Emergency off"}</Badge>
                      <Badge tone={fixer.verification_status === "approved" ? "green" : "amber"}>{fixer.verification_status ?? "pending"}</Badge>
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
