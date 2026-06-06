import Link from "next/link";
import { Badge, Card, DashboardHeader } from "@/components/ui";
import { getAdminCustomers } from "@/lib/jobs";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomers();
  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Customers" role="Admin" />
        <Card variant="dark">
          <Badge tone="blue">Customer directory</Badge>
          <div className="mt-5 grid gap-3">
            {customers.length ? (
              customers.map((customer) => (
                <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-300/40 hover:bg-white/10">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div>
                      <p className="font-black">{[customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Customer"}</p>
                      <p className="mt-1 text-sm text-white/65">{customer.email} · {customer.phone ?? "No phone"} · {customer.job_count} requests</p>
                    </div>
                    <Badge tone={customer.status === "active" ? "green" : "gray"} className="md:ml-auto">{customer.status}</Badge>
                  </div>
                </Link>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">No customers yet.</div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
