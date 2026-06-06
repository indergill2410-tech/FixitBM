import { Headphones, ShieldCheck } from "lucide-react";
import { SupportTicketForm } from "@/components/support-ticket-form";
import { Badge, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getUserSupportTickets } from "@/lib/jobs";

export default async function CustomerSupportPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const tickets = await getUserSupportTickets(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Support" role="Customer help" />
        <div className="grid gap-5 lg:grid-cols-[.58fr_.42fr]">
          <div className="grid gap-5">
            <Card>
              <Headphones className="text-[var(--amber2)]" />
              <Badge className="mt-4">Fixit247 support</Badge>
              <h1 className="mt-4 text-3xl font-black">Get help with a request, membership, or account.</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
                Send one clear support request and the team can review it from the admin support queue.
              </p>
            </Card>
            <SupportTicketForm />
          </div>
          <aside className="grid gap-5">
            <Card variant="membership">
              <ShieldCheck className="text-[var(--amber2)]" />
              <h2 className="mt-4 text-xl font-black">For urgent home or road help, start a request first.</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Support is best for account, membership, billing, dispute, and follow-up questions.
              </p>
            </Card>
            <Card>
              <Badge tone="gray">Recent support</Badge>
              <div className="mt-4 grid gap-3">
                {tickets.length ? (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black">{ticket.subject ?? ticket.title ?? "Support ticket"}</p>
                        <Badge tone={ticket.status === "resolved" || ticket.status === "closed" ? "green" : "amber"}>
                          {ticket.status ?? "open"}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-[var(--text2)]">
                        {ticket.message ?? ticket.description ?? ticket.notes ?? "Support request saved."}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm leading-6 text-[var(--text2)]">
                    Send a support request to keep follow-up notes, status, and resolution history in one place.
                  </p>
                )}
              </div>
            </Card>
          </aside>
        </div>
      </section>
    </main>
  );
}
