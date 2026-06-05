import { Badge, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getCustomerMessageThreads } from "@/lib/jobs";

export default async function CustomerMessagesPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const threads = await getCustomerMessageThreads(user);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Messages" role="Customer" />
        <div className="grid gap-4">
          {threads.length ? (
            threads.map((thread) => (
              <a key={thread.id} href={`/dashboard/customer/jobs/${thread.job_id}`}>
                <Card>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div>
                      <Badge tone="blue">{thread.job_reference}</Badge>
                      <h2 className="mt-3 font-black">{thread.job_title}</h2>
                      <p className="mt-1 line-clamp-2 text-sm text-[var(--text2)]">
                        {thread.sender_label ?? "Fixit247"}: {thread.body}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-[var(--text3)] md:ml-auto">{new Date(thread.created_at).toLocaleString()}</p>
                  </div>
                </Card>
              </a>
            ))
          ) : (
            <Card>
              <h2 className="font-black">No messages yet</h2>
              <p className="mt-2 text-[var(--text2)]">Job conversations appear here once a request has updates.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
