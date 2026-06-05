import { Badge, Card, PublicHeader } from "@/components/ui";

export default function BillingStatusPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Card className="max-w-2xl">
          <Badge>Billing status</Badge>
          <h1 className="mt-4 text-3xl font-black">Payment architecture is prepared.</h1>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            Checkout, customer portal, and webhook endpoints exist, but live Stripe checkout is disabled until Stripe SDK
            setup, product price IDs, and webhook verification are completed.
          </p>
        </Card>
      </section>
    </main>
  );
}
