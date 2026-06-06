import { SupportTicketStatusForm } from "@/components/admin-action-forms";
import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { getAdminSupportTickets } from "@/lib/jobs";

export default async function AdminSupportPage() {
  const tickets = await getAdminSupportTickets();
  const open = tickets.filter((ticket) => (ticket.status ?? "open") === "open").length;
  const waiting = tickets.filter((ticket) => ticket.status === "waiting").length;
  const resolved = tickets.filter((ticket) => ["resolved", "closed"].includes(ticket.status ?? "")).length;

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Support" role="Admin" />
        <div className="mb-5 grid gap-4 md:grid-cols-3">
          <StatCard label="Open" value={String(open)} detail="Needs first response" />
          <StatCard label="Waiting" value={String(waiting)} detail="Needs follow-up" />
          <StatCard label="Resolved" value={String(resolved)} detail="Closed or resolved" />
        </div>
        <Card variant="dark">
          <Badge tone="blue">Support queue</Badge>
          <h2 className="mt-4 text-2xl font-black">Tickets and customer escalations</h2>
          <div className="mt-5 grid gap-3">
            {tickets.length ? (
              tickets.map((ticket) => (
                <div key={ticket.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{ticket.subject ?? ticket.title ?? "Support ticket"}</p>
                        <Badge tone="gray">{ticket.status ?? "open"}</Badge>
                      </div>
                      <p className="mt-2 text-sm font-bold text-white/55">{ticket.customer_name}</p>
                      <p className="mt-1 text-sm text-white/65">
                        {ticket.body ?? ticket.message ?? ticket.description ?? ticket.notes ?? "No message recorded."}
                      </p>
                    </div>
                    <SupportTicketStatusForm ticketId={ticket.id} currentStatus={ticket.status} />
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
