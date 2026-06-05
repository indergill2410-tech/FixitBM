import { Badge, Card, DashboardHeader } from "@/components/ui";

export default function AdminSettingsPage() {
  const checks = [
    {
      label: "Supabase public URL",
      ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
      detail: "Browser auth and customer/tradie flows can reach the project."
    },
    {
      label: "Supabase publishable key",
      ready: Boolean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
      detail: "Client auth uses the public publishable key only."
    },
    {
      label: "Supabase server key",
      ready: Boolean(process.env.SUPABASE_SECRET_KEY),
      detail: "Server actions, admin dashboards, uploads, and seed tooling can write safely."
    },
    {
      label: "Cron secret",
      ready: Boolean(process.env.CRON_SECRET),
      detail: "Monthly 111-credit tradie bonus renewals can be protected in production."
    },
    {
      label: "Stripe secret key",
      ready: Boolean(process.env.STRIPE_SECRET_KEY),
      detail: "Checkout sessions can be created when the matching price IDs are also configured."
    },
    {
      label: "Stripe webhook secret",
      ready: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      detail: "Webhook requests are signature-checked before future billing reconciliation work."
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
              <p>Customers post jobs free, with guest-first posting kept open for emergencies.</p>
              <p>Tradies keep 100% of the job value; Fixit247 monetises subscriptions, lead credits, verification, priority, and tools.</p>
              <p>Launch bonus grants tradies 111 lead credits every month for 6 months, including Free Starter accounts.</p>
              <p>Admin can assign jobs, update status, review verification, refund bad leads, and monitor disputes.</p>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
