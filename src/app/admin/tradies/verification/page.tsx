import { Badge, Card, DashboardHeader } from "@/components/ui";
import { VerificationDecisionForm } from "@/components/admin-action-forms";
import { getAdminVerificationQueue } from "@/lib/jobs";

export default async function AdminVerificationPage() {
  const documents = await getAdminVerificationQueue();

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Verification queue" role="Admin" />
        <div className="grid gap-5">
          {documents.length ? (
            documents.map((document) => (
              <Card key={document.id}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                  <div>
                    <Badge tone={document.status === "pending" ? "amber" : document.status === "approved" ? "green" : "red"}>{document.status}</Badge>
                    <h2 className="mt-4 text-xl font-black">{document.tradie_name}</h2>
                    <p className="mt-1 text-sm text-[var(--text2)]">{document.type} · {document.file_url ?? "No file path"}</p>
                    {document.notes ? <p className="mt-2 text-sm text-[var(--text2)]">{document.notes}</p> : null}
                  </div>
                  <div className="w-full lg:ml-auto lg:max-w-xl">
                    <VerificationDecisionForm documentId={document.id} />
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card>
              <h2 className="font-black">No verification documents yet</h2>
              <p className="mt-2 text-sm text-[var(--text2)]">Submitted Fixer documents are reviewed here.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
