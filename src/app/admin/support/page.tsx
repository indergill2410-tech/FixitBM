import { Badge, Card, DashboardHeader } from "@/components/ui";
import { getAdminSupportTickets } from "@/lib/jobs";

export default async function AdminSupportPage() {
  const tickets = await getAdminSupportTickets();

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Support" role="Admin" />
        <Card variant="dark">
          <Badge tone="blue">Support queue</Badge>
          <h2 className="mt-4 text-2xl font-black">Tickets and customer escalations</h2>
          <div className="mt-5 grid gap-3">
            {tickets.length ? (
              tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <div>
                      <p className="font-black">{ticket.subject ?? ticket.title ?? "Support ticket"}</p>
                      <p className="mt-1 text-sm text-white/65">{ticket.message ?? ticket.description ?? ticket.notes ?? "No message recorded."}</p>
                    </div>
                    <Badge tone="gray" className="md:ml-auto">{ticket.status ?? "open"}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/70">No support tickets yet.</div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}
