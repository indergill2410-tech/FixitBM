import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { requireRole } from "@/lib/auth";
import { getConnectAccount } from "@/lib/connect";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function FixerPayoutsPage() {
  const user = await requireRole(["tradie"]);

  const supabase = createSupabaseAdminClient();

  let tradieId: string | null = null;
  if (supabase) {
    const { data } = await supabase
      .from("tradie_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    tradieId = data?.id ?? null;
  }

  const account = tradieId ? await getConnectAccount(tradieId) : null;

  type FixerPayout = {
    id: string;
    job_id: string;
    amount_cents: number;
    currency: string;
    status: string;
    note: string | null;
    created_at: string;
  };

  let payouts: FixerPayout[] = [];
  if (supabase && tradieId) {
    const { data } = await supabase
      .from("fixer_payouts")
      .select("id, job_id, amount_cents, currency, status, note, created_at")
      .eq("tradie_id", tradieId)
      .order("created_at", { ascending: false })
      .limit(50);
    payouts = (data ?? []) as FixerPayout[];
  }

  const statusColour: Record<string, string> = {
    paid: "bg-green-500/20 text-green-700",
    processing: "bg-amber-500/20 text-amber-700",
    failed: "bg-red-500/20 text-red-700",
    pending: "bg-[var(--bg2)] text-[var(--text3)]"
  };

  const accountStatusColour: Record<string, string> = {
    active: "bg-green-500/20 text-green-700",
    restricted: "bg-amber-500/20 text-amber-700",
    disabled: "bg-red-500/20 text-red-700",
    pending: "bg-[var(--bg2)] text-[var(--text3)]"
  };

  return (
    <main className="premium-shell min-h-screen text-[var(--text)]">
      <section className="container py-8">
        <DashboardHeader title="Your payouts" role="Earnings &amp; Stripe Connect" />

        <div className="grid gap-4">
          {!account || !account.onboarding_complete ? (
            <Card>
              <h2 className="text-lg font-black">Set up payouts</h2>
              <p className="mt-2 text-[var(--text2)]">
                Connect your bank account via Stripe to receive earnings from completed jobs.
              </p>
              <form className="mt-4" method="POST" action="/api/stripe/connect/onboard">
                <Button type="submit">Set up payouts</Button>
              </form>
            </Card>
          ) : (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black">Payout account</h2>
                  <p className="mt-1 text-sm text-[var(--text2)]">Stripe Connect Express</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${accountStatusColour[account.status] ?? accountStatusColour.pending}`}
                  >
                    {account.status}
                  </span>
                  {account.payouts_enabled ? (
                    <Badge tone="green">Payouts enabled</Badge>
                  ) : (
                    <Badge tone="amber">Payouts not enabled</Badge>
                  )}
                </div>
              </div>
              {!account.payouts_enabled && (
                <form className="mt-4" method="POST" action="/api/stripe/connect/onboard">
                  <Button type="submit" variant="ghost">
                    Resume onboarding
                  </Button>
                </form>
              )}
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-black">Payout history</h2>
            {payouts.length === 0 ? (
              <p className="mt-3 text-[var(--text2)]">No payouts received yet.</p>
            ) : (
              <div className="mt-4 grid gap-3">
                {payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-[var(--text)]">
                        Job {payout.job_id.slice(0, 8)}…
                      </p>
                      {payout.note ? (
                        <p className="mt-0.5 truncate text-xs text-[var(--text3)]">{payout.note}</p>
                      ) : null}
                      <p className="mt-0.5 text-xs text-[var(--text3)]">
                        {new Date(payout.created_at).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-black text-[var(--text)]">
                        ${(payout.amount_cents / 100).toFixed(2)} {payout.currency.toUpperCase()}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusColour[payout.status] ?? statusColour.pending}`}
                      >
                        {payout.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </main>
  );
}
