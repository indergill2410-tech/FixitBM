import { Badge, Card, DashboardHeader } from "@/components/ui";
import { JobMessageForm } from "@/components/job-message-form";
import { JobPhotoUploadForm } from "@/components/job-photo-upload-form";
import { JobReviewForm } from "@/components/job-review-form";
import { requireRole } from "@/lib/auth";
import { formatJobLocation, getCustomerJobDetail, statusLabel } from "@/lib/jobs";

export default async function CustomerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ id }, user] = await Promise.all([params, requireRole(["customer", "admin", "super_admin"])]);
  const job = await getCustomerJobDetail(user, id);

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Request detail" role={`Request ${id}`} />
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
                {(job.events.length ? job.events : [{ id: "fallback", title: "Request posted", status: job.status, note: "Request received.", created_at: job.created_at }]).map((event) => (
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
                    <p className="text-sm leading-6 text-[var(--text2)]">Replies from support or a Fixer are saved here.</p>
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
                          <img src={photo.signed_url} alt={photo.file_name ?? "Request photo"} className="aspect-video w-full object-cover" />
                        ) : null}
                        <p className="p-3 text-sm font-semibold text-[var(--text2)]">{photo.file_name ?? photo.file_url}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm leading-6 text-[var(--text2)]">Add request photos so support and Fixers can assess the issue faster.</p>
                  )}
                </div>
                <JobPhotoUploadForm jobId={job.id} />
              </Card>
              {["completed", "closed"].includes(job.status) ? (
                <Card>
                  <Badge tone="green">Review</Badge>
                  <h2 className="mt-4 text-xl font-black">Rate this completed request</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Your review helps keep the Fixit247 network accountable.</p>
                  <JobReviewForm jobId={job.id} />
                </Card>
              ) : null}
            </div>
          </div>
        ) : (
          <Card>
            <h1 className="text-xl font-black">Request not found</h1>
            <p className="mt-2 text-[var(--text2)]">This request may not belong to the signed-in customer.</p>
          </Card>
        )}
      </section>
    </main>
  );
}
