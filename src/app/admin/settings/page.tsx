import { Badge, Card, DashboardHeader } from "@/components/ui";
import { getEmailRuntimeStatus, type EmailDeliveryLog } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export default async function AdminSettingsPage() {
  const emailStatus = getEmailRuntimeStatus();
  const recentEmailLogs = await getRecentEmailLogs();
  const checks = [
    {
      label: "Database public URL",
      ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      detail: "Browser auth and customer/Fixer flows can reach the app data service."
    },
    {
      label: "Database publishable key",
      ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      detail: "Client auth uses the public app key only."
    },
    {
      label: "Database server key",
      ready: Boolean(process.env.SUPABASE_SECRET_KEY),
      detail: "Server actions, admin areas, uploads, and seed tooling can write safely."
    },
    {
      label: "Cron secret",
      ready: Boolean(process.env.CRON_SECRET),
      detail: "Monthly 111-credit Fixer bonus renewals can be protected in production."
    },
    {
      label: "Stripe secret key",
      ready: Boolean(process.env.STRIPE_SECRET_KEY),
      detail: "Checkout sessions can be created when matching price IDs are available."
    },
    {
      label: "Stripe webhook secret",
      ready: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      detail: "Billing events can be signature-checked before account reconciliation."
    },
    {
      label: "Resend API key",
      ready: emailStatus.hasApiKey,
      detail: "Transactional email can be sent for newsletter, requests, support, Safety Checks, and PropertySafe."
    },
    {
      label: "Verified sender",
      ready: Boolean(emailStatus.fromEmail),
      detail: `Sender set as ${emailStatus.fromEmail}. Confirm this sender is verified in Resend.`
    },
    {
      label: "Admin alert recipients",
      ready: emailStatus.adminAlertCount > 0,
      detail: `${emailStatus.adminAlertCount} team recipient${emailStatus.adminAlertCount === 1 ? "" : "s"} set for operational email alerts.`
    }
  ];

  return (
    <main className="min-h-screen bg-[#120f0c] text-white">
      <section className="container py-8">
        <DashboardHeader title="Settings" role="Admin" />
        <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
          <Card variant="dark">
            <h1 className="text-2xl font-black">Production readiness</h1>
            <p className="mt-2 text-white/70">
              Environment status only; secret values are never shown here.
            </p>
            <div className="mt-5 grid gap-3">
              {checks.map((check) => (
                <div key={check.label} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">{check.label}</p>
                    <Badge tone={check.ready ? "green" : "red"}>{check.ready ? "Ready" : "Needed"}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/65">{check.detail}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="dark">
            <h2 className="text-xl font-black">Business rules</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-white/75">
              <p>Customers start requests free, with guest-first posting kept open for emergencies.</p>
              <p>Fixers keep 100% of the work value; Fixit247 monetises subscriptions, lead credits, verification, priority, and tools.</p>
              <p>Launch bonus grants Fixers 111 lead credits every month for 6 months, including Free Starter accounts.</p>
              <p>Admin can assign requests, update status, review verification, refund bad leads, and monitor disputes.</p>
            </div>
          </Card>
        </div>

        <Card variant="dark" className="mt-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge tone={emailStatus.configured ? "green" : "red"}>{emailStatus.configured ? "Email ready" : "Email needs attention"}</Badge>
              <h2 className="mt-4 text-2xl font-black">Email delivery</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                Newsletter welcome, agency onboarding, support, Safety Check, request, and owner-invite emails should be
                visible here after the delivery log migration is applied.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-white/70">
              <p><span className="font-black text-white">Support:</span> {emailStatus.supportEmail}</p>
              <p><span className="font-black text-white">Site:</span> {emailStatus.appUrl}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {recentEmailLogs.length ? (
              recentEmailLogs.map((log) => (
                <div key={log.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-black">{log.subject}</p>
                      <p className="mt-1 text-sm text-white/60">{log.recipient} · {log.category ?? "transactional"}</p>
                    </div>
                    <Badge tone={log.status === "sent" ? "green" : log.status === "skipped" ? "amber" : "red"}>
                      {log.status}
                    </Badge>
                  </div>
                  {log.error ? <p className="mt-3 text-sm leading-6 text-red-200">{log.error}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white/65">
                No email delivery logs yet. Send a newsletter signup or agency walkthrough after deployment.
              </div>
            )}
          </div>
        </Card>
      </section>
    </main>
  );
}

async function getRecentEmailLogs(): Promise<EmailDeliveryLog[]> {
  if (!isSupabaseServerConfigured()) return [];
  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("email_delivery_logs")
    .select("id, recipient, subject, category, status, provider, provider_message_id, provider_status, error, idempotency_key, created_at")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) return [];
  return (data ?? []) as EmailDeliveryLog[];
}
