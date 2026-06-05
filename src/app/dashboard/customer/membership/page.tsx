import { Badge, Card, DashboardHeader } from "@/components/ui";
import { CheckoutButton, PortalButton } from "@/components/billing-buttons";

export default function CustomerMembershipPage() {
  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Membership" role="Customer" />
        <Card variant="membership">
          <Badge>Fixit Plus</Badge>
          <h1 className="mt-4 text-3xl font-black">Peace of mind for your home and road.</h1>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Stripe checkout is prepared and will show a configuration-needed message until live Stripe keys and price IDs
            are added.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <CheckoutButton planCode="home" label="Start Home $29" variant="ghost" />
            <CheckoutButton planCode="complete" label="Start Complete $49" />
            <PortalButton />
          </div>
        </Card>
      </section>
    </main>
  );
}
