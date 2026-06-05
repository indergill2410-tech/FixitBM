import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { tradiePlans } from "@/lib/data";

export default function ForTradiesPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge tone="purple">For tradies</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          Win local jobs without giving away a percentage.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          No commission. Keep 100% of the job value. Pay only for real job opportunities, priority access, and tools that
          help your business grow.
        </p>
        <Card variant="membership" className="mt-8 max-w-2xl">
          <Badge>Launch tradie offer</Badge>
          <h2 className="mt-4 text-2xl font-black">Get 111 bonus lead credits every month for 6 months.</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            New tradies can claim job leads with monthly renewed bonus credits while staying on the Free Starter plan.
            No paid subscription required to test real local opportunities.
          </p>
          <Button href="/register/tradie" className="mt-5">
            Claim monthly bonus credits
          </Button>
        </Card>
      </section>
      <section className="container grid gap-4 pb-16 md:grid-cols-2 lg:grid-cols-4">
        {tradiePlans.map(([name, price, copy]) => (
          <Card key={name}>
            <h2 className="text-xl font-black">{name}</h2>
            <p className="mt-3 text-4xl font-black">{price}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text3)]">/month</p>
            <p className="mt-4 text-sm leading-6 text-[var(--text2)]">{copy}</p>
            <Button href="/dashboard/tradie" variant={name === "Emergency Pro" ? "primary" : "ghost"} className="mt-6 w-full">
              Preview dashboard
            </Button>
          </Card>
        ))}
      </section>
    </main>
  );
}
