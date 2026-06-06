import Link from "next/link";
import { Badge, Card, DashboardHeader } from "@/components/ui";
import { AdminQueueItem } from "@/components/job-cards";
import { getAdminRequestQueue, type AdminRequestFilters, type JobStatus, type RequestLaneLabel } from "@/lib/jobs";

const lanes: (RequestLaneLabel | "all")[] = ["all", "Home emergency", "Roadside emergency", "Trade request", "Project quote"];
const statuses: (JobStatus | "all")[] = ["all", "received", "matching", "tradie_accepted", "en_route", "on_site", "quote_provided", "work_in_progress", "completed", "cancelled", "disputed"];
const assignments: NonNullable<AdminRequestFilters["assignment"]>[] = ["all", "unassigned", "assigned"];

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ lane?: string; status?: string; assignment?: string }> }) {
  const params = await searchParams;
  const requestedAssignment = params.assignment as NonNullable<AdminRequestFilters["assignment"]>;
  const filters: AdminRequestFilters = {
    lane: lanes.includes(params.lane as RequestLaneLabel | "all") ? (params.lane as RequestLaneLabel | "all") : "all",
    status: statuses.includes(params.status as JobStatus | "all") ? (params.status as JobStatus | "all") : "all",
    assignment: assignments.includes(requestedAssignment) ? requestedAssignment : "all"
  };
  const jobs = await getAdminRequestQueue(filters);

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Requests" role="Admin" />
        <div className="mb-5 grid gap-4">
          <FilterGroup label="Lane" param="lane" value={filters.lane ?? "all"} options={lanes} params={params} />
          <FilterGroup label="Status" param="status" value={filters.status ?? "all"} options={statuses} params={params} />
          <FilterGroup label="Assignment" param="assignment" value={filters.assignment ?? "all"} options={assignments} params={params} />
        </div>
        <Card variant="dark">
          <Badge tone="red">Dispatch console</Badge>
          <h2 className="mt-4 text-2xl font-black">{jobs.length} requests in this view</h2>
          <p className="mt-2 text-sm leading-6 text-white/65">
            Filter live requests by lane, operational status, and whether a Fixer has been assigned.
          </p>
          <div className="grid gap-3">
            {jobs.length ? (
              jobs.map((job) => <AdminQueueItem key={job.id} job={job} />)
            ) : (
              <p className="text-white/70">No active requests in the queue.</p>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}

function FilterGroup({
  label,
  param,
  value,
  options,
  params
}: {
  label: string;
  param: "lane" | "status" | "assignment";
  value: string;
  options: readonly string[];
  params: { lane?: string; status?: string; assignment?: string };
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-black uppercase tracking-wide text-white/45">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => {
          const next = new URLSearchParams();
          if (params.lane && param !== "lane") next.set("lane", params.lane);
          if (params.status && param !== "status") next.set("status", params.status);
          if (params.assignment && param !== "assignment") next.set("assignment", params.assignment);
          if (option !== "all") next.set(param, option);
          const href = `/admin/jobs${next.toString() ? `?${next.toString()}` : ""}`;

          return (
            <Link
              key={option}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                value === option ? "bg-[var(--amber)] text-white" : "bg-white/8 text-white/65 hover:bg-white/14"
              }`}
            >
              {option.replaceAll("_", " ")}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
