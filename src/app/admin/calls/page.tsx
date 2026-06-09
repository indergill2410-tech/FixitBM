import { Badge, Card, DashboardHeader } from "@/components/ui";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

type VoiceCallLog = {
  id: string;
  from_number: string | null;
  caller_name: string | null;
  callback_number: string | null;
  suburb_or_address: string | null;
  issue: string | null;
  urgency: string | null;
  summary: string | null;
  transcript: string | null;
  created_at: string;
};

async function getVoiceCallLogs(): Promise<VoiceCallLog[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("voice_call_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  return (data ?? []) as VoiceCallLog[];
}

export default async function AdminCallsPage() {
  const calls = await getVoiceCallLogs();

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Phone calls" role="Admin" />

        <div className="grid gap-4">
          {calls.length ? (
            calls.map((call) => (
              <Card key={call.id}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge tone={call.urgency === "emergency" ? "red" : "blue"}>
                        {call.urgency === "emergency" ? "Emergency" : call.urgency === "planned" ? "Planned" : "Unsorted"}
                      </Badge>
                      <h2 className="truncate text-lg font-black">{call.caller_name || "Unknown caller"}</h2>
                    </div>
                    <p className="mt-2 text-sm text-[var(--text2)]">{call.issue || "No issue captured."}</p>
                    {call.summary ? <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{call.summary}</p> : null}
                  </div>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-sm text-[var(--text2)] lg:min-w-64">
                    <p>Callback: {call.callback_number || call.from_number || "—"}</p>
                    <p>Location: {call.suburb_or_address || "—"}</p>
                    <p className="mt-2 text-xs text-[var(--text3)]">{new Date(call.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {call.transcript ? (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-[var(--text3)]">
                      Transcript
                    </summary>
                    <pre className="mt-3 whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4 text-sm text-[var(--text2)]">
                      {call.transcript}
                    </pre>
                  </details>
                ) : null}
              </Card>
            ))
          ) : (
            <Card>
              <p className="text-[var(--text2)]">
                No phone calls captured yet. Calls answered by the Fixit247 voice line will appear here with the caller&apos;s
                details and a transcript.
              </p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
