import { BarChart3, TrendingUp } from "lucide-react";
import { Badge, Card, DashboardHeader, StatCard } from "@/components/ui";
import { getFunnelSummary } from "@/lib/analytics";

function labelizeLane(lane: string) {
  return lane.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function AdminAnalyticsPage() {
  const funnel = await getFunnelSummary(30);

  const funnelSteps = [
    { label: "Reached details (step 1)", value: funnel.wizardStarts },
    { label: "Reached location (step 2)", value: funnel.step2Sessions },
    { label: "Reached contact (step 3)", value: funnel.step3Sessions },
    { label: "Submitted", value: funnel.submittedSessions }
  ];
  const max = Math.max(1, ...funnelSteps.map((step) => step.value));

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Conversion funnel" role="Admin" />
        <div className="mb-5 grid gap-4 md:grid-cols-4">
          <StatCard label="Events (30d)" value={String(funnel.totalEvents)} detail={funnel.capped ? "Capped sample" : "All tracked events"} />
          <StatCard label="Wizard starts" value={String(funnel.wizardStarts)} detail="Sessions past step 1" />
          <StatCard label="Submissions" value={String(funnel.submittedSessions)} detail="Successful requests" />
          <StatCard
            label="Conversion"
            value={funnel.conversionRate === null ? "—" : `${funnel.conversionRate}%`}
            detail="Starts → submitted"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-[.6fr_.4fr]">
          <Card>
            <TrendingUp className="text-[var(--amber2)]" />
            <h1 className="mt-4 text-2xl font-black">Request wizard funnel (last 30 days)</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Distinct sessions reaching each step of /post-job. The gap between bars is where people drop off.
            </p>
            <div className="mt-6 grid gap-4">
              {funnelSteps.map((step) => (
                <div key={step.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <p className="font-bold">{step.label}</p>
                    <p className="font-black">{step.value}</p>
                  </div>
                  <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[var(--bg2)]">
                    <div
                      className="h-full rounded-full bg-[var(--amber)]"
                      style={{ width: `${Math.round((step.value / max) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {!funnel.totalEvents ? (
              <p className="mt-5 rounded-xl bg-[var(--bg)] p-4 text-sm leading-6 text-[var(--text2)]">
                No events recorded yet. Data appears here as soon as visitors move through the request wizard.
              </p>
            ) : null}
          </Card>

          <div className="grid gap-5">
            <Card>
              <BarChart3 className="text-[var(--green)]" />
              <h2 className="mt-4 text-xl font-black">Submissions by lane</h2>
              <div className="mt-4 grid gap-2">
                {funnel.laneBreakdown.length ? (
                  funnel.laneBreakdown.map((lane) => (
                    <div key={lane.lane} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg)] p-3 text-sm">
                      <p className="font-bold">{labelizeLane(lane.lane)}</p>
                      <p>
                        <span className="font-black text-[var(--green)]">{lane.submissions}</span>
                        {lane.failures ? <span className="ml-2 font-bold text-[var(--red)]">{lane.failures} failed</span> : null}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-[var(--bg)] p-3 text-sm text-[var(--text2)]">No submissions tracked yet.</p>
                )}
              </div>
            </Card>
            <Card>
              <Badge>All events</Badge>
              <div className="mt-4 grid gap-2">
                {funnel.eventCounts.length ? (
                  funnel.eventCounts.map((item) => (
                    <div key={item.event} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--bg)] p-3 text-sm">
                      <p className="font-semibold text-[var(--text2)]">{item.event}</p>
                      <p className="font-black">{item.count}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-xl bg-[var(--bg)] p-3 text-sm text-[var(--text2)]">Nothing tracked in the last 30 days.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>
    </main>
  );
}
