import { Badge, Card, PublicHeader } from "@/components/ui";
import { tradiePlans } from "@/lib/data";

export default function PricingPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Pricing</Badge>
        <h1 className="mt-5 text-[40px] font-black tracking-tight md:text-[56px]">Clear pricing for customers and tradies.</h1>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <Card variant="membership">
            <h2 className="text-2xl font-black">Customer memberships</h2>
            <p className="mt-4 text-[var(--text2)]">Fixit Plus Home is $29/month. Fixit Plus Complete is $49/month. Job posting remains free.</p>
          </Card>
          <Card>
            <h2 className="text-2xl font-black">Tradie monetisation</h2>
            <p className="mt-4 text-[var(--text2)]">No commission. Tradies pay for subscriptions, lead credits, verification upgrades, priority access, and business tools.</p>
            <p className="mt-4 font-bold text-[var(--amber2)]">
              Launch offer: new tradies get 111 bonus lead credits every month for 6 months, even on Free Starter.
            </p>
          </Card>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {tradiePlans.map(([name, price]) => (
            <Card key={name}>
              <p className="font-black">{name}</p>
              <p className="mt-2 text-3xl font-black">{price}</p>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
