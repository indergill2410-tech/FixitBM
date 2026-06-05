import Link from "next/link";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { formatJobLocation, statusLabel, type JobSummary, type LeadSummary } from "@/lib/jobs";

export function CustomerJobCard({ job, hrefPrefix = "/dashboard/customer/jobs" }: { job: JobSummary; hrefPrefix?: string }) {
  return (
    <Card variant={job.urgency === "emergency" ? "emergency" : "default"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div>
          <Badge tone={job.urgency === "emergency" ? "red" : "amber"}>{job.urgency}</Badge>
          <h2 className="mt-3 text-xl font-black">{job.title}</h2>
          <p className="mt-1 text-sm text-[var(--text2)]">
            {job.public_reference} · {job.category} · {formatJobLocation(job)}
          </p>
        </div>
        <div className="md:ml-auto">
          <Badge tone="gray">{statusLabel(job.status)}</Badge>
          <Button href={`${hrefPrefix}/${job.id}`} variant="ghost" className="mt-3 w-full md:w-auto">
            View request
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function LeadCard({ lead }: { lead: LeadSummary }) {
  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--green-light)] text-lg font-black text-[var(--green)]">
          {lead.match_score}
        </div>
        <div>
          <Badge tone={lead.urgency === "emergency" ? "red" : "amber"}>{lead.urgency}</Badge>
          <h2 className="mt-2 text-xl font-black">{lead.title}</h2>
          <p className="text-sm text-[var(--text2)]">
            {lead.category} · {formatJobLocation(lead)} · {lead.credit_cost} credits
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-[var(--text3)]">{lead.description}</p>
        </div>
        <div className="ml-auto flex flex-col gap-2 md:items-end">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text3)]">
            <Clock size={14} />
            Posted {new Date(lead.created_at).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <form action="/api/leads/claim" method="post">
              <input type="hidden" name="jobId" value={lead.id} />
              <Button disabled={lead.already_claimed}>{lead.already_claimed ? "Claimed" : "Claim request"}</Button>
            </form>
            <Button href={`/dashboard/tradie/leads/${lead.id}`} variant="ghost">
              Details
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function AdminQueueItem({ job }: { job: JobSummary }) {
  return (
    <Link
      href={`/admin/jobs/${job.id}`}
      className="block rounded-xl border border-white/10 bg-white/5 p-4 transition hover:border-[var(--amber)]"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <Badge tone={job.urgency === "emergency" ? "red" : "amber"}>{job.type}</Badge>
          <h3 className="mt-2 font-black text-white">{job.title}</h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-white/65">
            <MapPin size={14} />
            {formatJobLocation(job)} · {job.public_reference}
          </p>
        </div>
        <Badge tone="gray" className="md:ml-auto">
          {statusLabel(job.status)}
        </Badge>
      </div>
    </Link>
  );
}
