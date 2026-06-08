import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { tradiePlans } from "@/lib/data";
import { requireRole } from "@/lib/auth";
import { getTradieSubscription } from "@/lib/jobs";
import { CheckoutButton, PortalButton } from "@/components/billing-buttons";
import { showFixerSubscriptionUi } from "@/lib/featureFlags";

export default async function TradieSubscriptionPage() {
  const user = await requireRole(["tradie", "admin", "super_admin"]);
  const subscription = await getTradieSubscription(user);

  if (!showFixerSubscriptionUi) {
    return (
      <main className="premium-shell min-h-screen">
        <section className="container py-8">
          <DashboardHeader title="Fixer profile review" role="Fixer" />
          <Card variant="membership">
            <Badge tone="green">Recruitment mode</Badge>
            <h1 className="mt-4 text-3xl font-black">Paid Fixer plans are not shown right now.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text2)]">
              Complete your Fixer profile, documents, service areas, and work interests so the Fixit 247 team can review
              your readiness for suitable job opportunities.
            </p>
            <Button href="/dashboard/tradie/profile" className="mt-5">
              Complete profile
            </Button>
          </Card>
        </section>
      </main>
    );
  }

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Subscription" role="Fixer" />
        <Card variant="membership">
          <Badge>Current plan</Badge>
          <h1 className="mt-4 text-3xl font-black">
            {subscription?.plan ? subscription.plan.replace("_", " ") : "Free Starter"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Free Starter can still claim leads using 111 bonus credits renewed every month for the first 6 months. Paid
            plans add priority access, stronger matching, alerts, and higher growth limits.
          </p>
        </Card>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tradiePlans.map(([name, price, copy]) => (
            <Card key={name}>
              <h2 className="font-black">{name}</h2>
              <p className="mt-3 text-3xl font-black">{price}</p>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{copy}</p>
              <div className="mt-5">
                {name === "Free Starter" ? (
                  <Button variant="ghost" className="w-full">
                    Current free plan
                  </Button>
                ) : (
                  <CheckoutButton
                    planCode={name === "Local Pro" ? "local_pro" : name === "Emergency Pro" ? "emergency_pro" : "growth_partner"}
                    label="Start plan"
                    variant={name === "Emergency Pro" ? "primary" : "ghost"}
                  />
                )}
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-5 max-w-sm">
          <PortalButton />
        </div>
      </section>
    </main>
  );
}
