import { Badge, Card, PublicHeader } from "@/components/ui";

export default function BillingStatusPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Card className="max-w-2xl">
          <Badge>Billing status</Badge>
          <h1 className="mt-4 text-3xl font-black">Billing setup is ready for Stripe keys.</h1>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            Checkout will create Stripe sessions when the secret key and product price IDs are configured. Customer portal
            and webhook reconciliation remain gated until Stripe customer records and verified webhook handling are finalised.
          </p>
        </Card>
      </section>
    </main>
  );
}
