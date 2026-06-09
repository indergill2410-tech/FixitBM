import Image from "next/image";
import { Card, DashboardHeader } from "@/components/ui";
import { formatJobLocation, getAdminJobDetail, getSuggestedFixersForJob, statusLabel } from "@/lib/jobs";
import { AssignTradieForm, FixerPayoutForm, JobStatusForm } from "@/components/admin-action-forms";
import { getConnectAccount } from "@/lib/connect";

const payoutEligibleStatuses = new Set(["work_in_progress", "completed", "reviewed"]);

export default async function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getAdminJobDetail(id);
  const suggestedFixers = job ? await getSuggestedFixersForJob(job) : [];

  const showPayoutForm =
    job?.assigned_tradie_id != null && payoutEligibleStatuses.has(job?.status ?? "");
  const payoutAccount =
    showPayoutForm && job?.assigned_tradie_id
      ? await getConnectAccount(job.assigned_tradie_id)
      : null;

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Admin request detail" role={`Request ${id}`} />
        {job ? (
          <div className="grid gap-4">
            <Card>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h1 className="text-2xl font-black">{job.title}</h1>
                  <p className="mt-2 text-[var(--text2)]">
                    {job.public_reference} · {job.category} · {statusLabel(job.status)}
                  </p>
                  <p className="mt-5 max-w-3xl leading-7 text-[var(--text2)]">{job.description}</p>
                </div>
                <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-sm text-[var(--text2)] lg:min-w-72">
                  <p className="font-bold text-[var(--text)]">Request details</p>
                  <p className="mt-3">Location: {formatJobLocation(job)}</p>
                  <p>Contact: {job.guest_name || "Account customer"} · {job.guest_phone || job.preferred_contact_method}</p>
                  <p>Assigned Fixer: {job.assigned_tradie_name || "Unassigned"}</p>
                </div>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-black">Operations</h2>
                  {job.urgency === "emergency" ? (
                    <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-black uppercase tracking-wide text-red-300">
                      Emergency dispatch
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                  <p className="text-xs font-black uppercase tracking-wide text-[var(--text3)]">
                    Suggested Fixers for this request
                  </p>
                  <div className="mt-3 grid gap-2">
                    {suggestedFixers.slice(0, 5).map((fixer) => (
                      <div
                        key={fixer.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-[var(--text)]">
                            {fixer.business_name || fixer.trade_category}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-[var(--text3)]">
                            {fixer.match_reasons.length ? fixer.match_reasons.join(" · ") : "No strong match signals"}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${
                            fixer.match_score >= 60
                              ? "bg-green-500/20 text-green-300"
                              : fixer.match_score >= 30
                                ? "bg-amber-500/20 text-amber-200"
                                : "bg-[var(--bg2)] text-[var(--text3)]"
                          }`}
                        >
                          {fixer.match_score}
                        </span>
                      </div>
                    ))}
                    {suggestedFixers.length ? null : (
                      <p className="text-sm text-[var(--text2)]">No Fixer profiles available to suggest yet.</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <AssignTradieForm jobId={job.id} tradies={suggestedFixers} />
                  <JobStatusForm jobId={job.id} />
                </div>
                {showPayoutForm && job.assigned_tradie_id ? (
                  <FixerPayoutForm
                    jobId={job.id}
                    tradieId={job.assigned_tradie_id}
                    payoutsEnabled={payoutAccount?.payouts_enabled ?? false}
                  />
                ) : null}
              </Card>

              <Card>
                <h2 className="text-lg font-black">Status timeline</h2>
                <div className="mt-4 grid gap-3">
                  {job.events.length ? (
                    job.events.map((event) => (
                      <div key={event.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold">{event.title}</p>
                          <span className="text-xs text-[var(--text3)]">{new Date(event.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-1 text-sm text-[var(--text2)]">{statusLabel(event.status)}</p>
                        {event.note ? <p className="mt-2 text-sm text-[var(--text2)]">{event.note}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--text2)]">No status events recorded yet.</p>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <h2 className="text-lg font-black">Messages</h2>
                <div className="mt-4 grid gap-3">
                  {job.messages.length ? (
                    job.messages.map((message) => (
                      <div key={message.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <p className="font-bold text-[var(--text)]">{message.sender_label || "Fixit247"}</p>
                          <span className="text-xs text-[var(--text3)]">{new Date(message.created_at).toLocaleString()}</span>
                        </div>
                        <p className="mt-2 text-[var(--text2)]">{message.body}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--text2)]">No messages on this request yet.</p>
                  )}
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-black">Audit activity</h2>
                <div className="mt-4 grid gap-3">
                  {job.audit_logs.length ? (
                    job.audit_logs.map((log) => (
                      <div key={log.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
                        <p className="font-bold">{log.action.replaceAll("_", " ")}</p>
                        <p className="mt-1 text-xs text-[var(--text3)]">{new Date(log.created_at).toLocaleString()}</p>
                        {log.metadata ? <p className="mt-2 text-sm text-[var(--text2)]">{JSON.stringify(log.metadata)}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-[var(--text2)]">No admin actions recorded yet.</p>
                  )}
                </div>
              </Card>
            </div>

            {job.photos.length ? (
              <Card>
                <h2 className="text-lg font-black">Request photos</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {job.photos.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg2)]">
                      {photo.signed_url ? (
                        <Image
                          src={photo.signed_url}
                          alt={photo.file_name || "Request photo"}
                          width={640}
                          height={420}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center text-sm text-[var(--text2)]">Private photo</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ) : null}
          </div>
        ) : (
          <Card>
            <p className="text-[var(--text2)]">Request not found.</p>
          </Card>
        )}
      </section>
    </main>
  );
}
