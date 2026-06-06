import { BadgeCheck, Headphones } from "lucide-react";
import { SupportTicketForm } from "@/components/support-ticket-form";
import { Badge, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getUserSupportTickets } from "@/lib/jobs";

export default async function TradieSupportPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const tickets = await getUserSupportTickets(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Fixer support" role="Fixer help" />
        <div className="grid gap-5 lg:grid-cols-[.58fr_.42fr]">
          <div className="grid gap-5">
            <Card variant="dark">
              <Headphones className="text-[var(--amber2)]" />
              <Badge className="mt-4">Fixit247 support</Badge>
              <h1 className="mt-4 text-3xl font-black">Ask about leads, credits, verification, or assigned work.</h1>
              <p className="mt-3 text-sm leading-6 text-white/70">
                Support tickets go into the admin queue with your account attached for faster follow-up.
              </p>
            </Card>
            <SupportTicketForm />
          </div>
          <aside className="grid gap-5">
            <Card>
              <BadgeCheck className="text-[var(--green)]" />
              <h2 className="mt-4 text-xl font-black">Lead quality issue?</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                Include the request reference and what happened so support can review whether credits should be returned.
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
                    Send a support request to keep lead, credit, verification, and account follow-up in one place.
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
