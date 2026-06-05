import { Badge, Card, DashboardHeader } from "@/components/ui";
import { JobMessageForm } from "@/components/job-message-form";
import { JobPhotoUploadForm } from "@/components/job-photo-upload-form";
import { TradieJobActions } from "@/components/tradie-job-actions";
import { requireRole } from "@/lib/auth";
import { formatJobLocation, getTradieJobDetail, statusLabel } from "@/lib/jobs";

export default async function TradieJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireRole(["tradie", "admin", "super_admin"])]);
  const job = await getTradieJobDetail(user, id);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Tradie job detail" role={`Job ${id}`} />
        {job ? (
          <div className="grid gap-5 lg:grid-cols-[.65fr_.35fr]">
            <Card variant="emergency">
              <Badge>{statusLabel(job.status)}</Badge>
              <h1 className="mt-4 text-2xl font-black">{job.title}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                {job.public_reference} · {job.category} · {formatJobLocation(job)}
              </p>
              <p className="mt-4 leading-7 text-[var(--text2)]">{job.description}</p>
              <div className="mt-6 grid gap-3">
                {(job.events.length ? job.events : [{ id: "fallback", title: "Job posted", status: job.status, note: "Request received.", created_at: job.created_at }]).map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <span className="mt-1 h-3 w-3 rounded-full bg-[var(--green)]" />
                    <div>
                      <p className="font-bold">{event.title}</p>
                      <p className="text-xs text-[var(--text3)]">{new Date(event.created_at).toLocaleString()}</p>
                      {event.note ? <p className="mt-1 text-sm text-[var(--text2)]">{event.note}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <div className="grid gap-5">
              <Card>
                <Badge tone="amber">Job actions</Badge>
                <h2 className="mt-4 text-xl font-black">Move the work forward</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  Update only confirmed assigned jobs. Customers and ops see these status changes on the shared timeline.
                </p>
                <TradieJobActions jobId={job.id} status={job.status} />
              </Card>
              <Card>
                <Badge tone="blue">Chat</Badge>
                <div className="mt-5 grid gap-3">
                  {job.messages.length ? (
                    job.messages.map((message) => (
                      <div key={message.id} className="rounded-2xl bg-[var(--bg2)] p-4 text-sm text-[var(--text2)]">
                        <p className="font-bold text-[var(--text)]">{message.sender_label ?? "Fixit247"}</p>
                        <p className="mt-1">{message.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[var(--text2)]">Use the job chat for customer updates and support notes.</p>
                  )}
                </div>
                <JobMessageForm jobId={job.id} />
              </Card>
              <Card>
                <Badge tone="green">Photos</Badge>
                <div className="mt-5 grid gap-2">
                  {job.photos.length ? (
                    job.photos.map((photo) => (
                      <div key={photo.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg2)]">
                        {photo.signed_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={photo.signed_url} alt={photo.file_name ?? "Job photo"} className="aspect-video w-full object-cover" />
                        ) : null}
                        <p className="p-3 text-sm font-semibold text-[var(--text2)]">{photo.file_name ?? photo.file_url}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[var(--text2)]">Attach inspection photos as the job progresses.</p>
                  )}
                </div>
                <JobPhotoUploadForm jobId={job.id} />
              </Card>
            </div>
          </div>
        ) : (
          <Card>
            <h1 className="text-xl font-black">Job not found</h1>
            <p className="mt-2 text-[var(--text2)]">This job may not be assigned to your trade profile yet.</p>
          </Card>
        )}
      </section>
    </main>
  );
}
