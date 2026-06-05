import Image from "next/image";
import { Card, DashboardHeader } from "@/components/ui";
import { formatJobLocation, getAdminJobDetail, getAvailableTradiesForAdmin, statusLabel } from "@/lib/jobs";
import { AssignTradieForm, JobStatusForm } from "@/components/admin-action-forms";

export default async function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [job, tradies] = await Promise.all([getAdminJobDetail(id), getAvailableTradiesForAdmin()]);

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Admin job detail" role={`Job ${id}`} />
        {job ? (
          <div className="grid gap-4">
            <Card variant="dark">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-2xl font-black">{job.title}</h1>
                  <p className="mt-2 text-white/70">
                    {job.public_reference} · {job.category} · {statusLabel(job.status)}
                  </p>
                  <p className="mt-5 max-w-3xl leading-7 text-white/75">{job.description}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/75 lg:min-w-72">
                  <p className="font-bold text-white">Request details</p>
                  <p className="mt-3">Location: {formatJobLocation(job)}</p>
                  <p>Contact: {job.guest_name || "Account customer"} · {job.guest_phone || job.preferred_contact_method}</p>
                  <p>Assigned: {job.assigned_tradie_name || "Unassigned"}</p>
                  <p>Credits: {job.credit_cost}</p>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <Card variant="dark">
                <h2 className="text-lg font-black">Operations</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <AssignTradieForm jobId={job.id} tradies={tradies} />
                  <JobStatusForm jobId={job.id} />
                </div>
              </Card>

              <Card variant="dark">
                <h2 className="text-lg font-black">Status timeline</h2>
                <div className="mt-4 grid gap-3">
                  {job.events.length ? (
                    job.events.map((event) => (
                      <div key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold">{event.title}</p>
                          <span className="text-xs text-white/50">{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-white/60">{statusLabel(event.status)}</p>
                        {event.note ? <p className="mt-2 text-sm text-white/75">{event.note}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-white/70">No status events recorded yet.</p>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card variant="dark" className="lg:col-span-2">
                <h2 className="text-lg font-black">Messages</h2>
                <div className="mt-4 grid gap-3">
                  {job.messages.length ? (
                    job.messages.map((message) => (
                      <div key={message.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <p className="font-bold text-white">{message.sender_label || "Fixit247"}</p>
                          <span className="text-xs text-white/50">{new Date(message.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-white/75">{message.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-white/70">No messages on this job yet.</p>
                  )}
                </div>
              </Card>

              <Card variant="dark">
                <h2 className="text-lg font-black">Audit activity</h2>
                <div className="mt-4 grid gap-3">
                  {job.audit_logs.length ? (
                    job.audit_logs.map((log) => (
                      <div key={log.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <p className="font-bold">{log.action.replaceAll("_", " ")}</p>
                        <p className="mt-1 text-xs text-white/50">{new Date(log.created_at).toLocaleString()}</p>
                        {log.metadata ? <p className="mt-2 text-sm text-white/65">{JSON.stringify(log.metadata)}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-white/70">No admin actions recorded yet.</p>
                  )}
                </div>
              </Card>
            </div>

            {job.photos.length ? (
              <Card variant="dark">
                <h2 className="text-lg font-black">Job photos</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {job.photos.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
                      {photo.signed_url ? (
                        <Image
                          src={photo.signed_url}
                          alt={photo.file_name || "Job photo"}
                          width={640}
                          height={420}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-sm text-white/60">Private photo</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>
        ) : (
          <Card variant="dark">
            <p className="text-white/70">Job not found.</p>
          </Card>
        )}
      </section>
    </main>
  );
}
