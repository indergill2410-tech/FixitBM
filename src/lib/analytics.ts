import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

// Funnel aggregation for the admin console. Event volume is fetched raw and
// aggregated in process — fine at current scale (capped), revisit with a SQL
// rollup once volume grows.

export type FunnelSummary = {
  totalEvents: number;
  wizardStarts: number;
  step2Sessions: number;
  step3Sessions: number;
  submittedSessions: number;
  conversionRate: number | null;
  laneBreakdown: { lane: string; submissions: number; failures: number }[];
  eventCounts: { event: string; count: number }[];
  capped: boolean;
};

const FETCH_CAP = 5000;

type EventRow = {
  event: string;
  session_id: string | null;
  properties: Record<string, unknown> | null;
};

export async function getFunnelSummary(days = 30): Promise<FunnelSummary> {
  noStore();

  const empty: FunnelSummary = {
    totalEvents: 0,
    wizardStarts: 0,
    step2Sessions: 0,
    step3Sessions: 0,
    submittedSessions: 0,
    conversionRate: null,
    laneBreakdown: [],
    eventCounts: [],
    capped: false
  };

  if (!isSupabaseServerConfigured()) return empty;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return empty;

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("analytics_events")
    .select("event, session_id, properties")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(FETCH_CAP);

  if (error || !data) return empty;

  const rows = data as EventRow[];
  const stepSessions: Record<number, Set<string>> = { 1: new Set(), 2: new Set(), 3: new Set() };
  const submittedSessions = new Set<string>();
  const eventCounts = new Map<string, number>();
  const lanes = new Map<string, { submissions: number; failures: number }>();

  for (const row of rows) {
    eventCounts.set(row.event, (eventCounts.get(row.event) ?? 0) + 1);
    const session = row.session_id ?? "anon";
    const props = row.properties ?? {};

    if (row.event === "wizard_step") {
      const step = Number(props.step);
      if (step === 1 || step === 2 || step === 3) stepSessions[step].add(session);
    }

    if (row.event === "wizard_submit") {
      const lane = typeof props.lane === "string" ? props.lane : "unknown";
      const entry = lanes.get(lane) ?? { submissions: 0, failures: 0 };
      if (props.ok === true) {
        entry.submissions += 1;
        submittedSessions.add(session);
      } else {
        entry.failures += 1;
      }
      lanes.set(lane, entry);
    }
  }

  const wizardStarts = stepSessions[1].size;

  return {
    totalEvents: rows.length,
    wizardStarts,
    step2Sessions: stepSessions[2].size,
    step3Sessions: stepSessions[3].size,
    submittedSessions: submittedSessions.size,
    conversionRate: wizardStarts ? Math.round((submittedSessions.size / wizardStarts) * 100) : null,
    laneBreakdown: Array.from(lanes.entries())
      .map(([lane, value]) => ({ lane, ...value }))
      .sort((a, b) => b.submissions - a.submissions),
    eventCounts: Array.from(eventCounts.entries())
      .map(([event, count]) => ({ event, count }))
      .sort((a, b) => b.count - a.count),
    capped: rows.length >= FETCH_CAP
  };
}
