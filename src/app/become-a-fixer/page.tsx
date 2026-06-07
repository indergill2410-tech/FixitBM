import { Badge, Button, Card, PublicFooter, PublicHeader } from "@/components/ui";
import { tradiePlans } from "@/lib/data";

export default function BecomeAFixerPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge tone="purple">Fixer network</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
          Get real local requests without giving away the job value.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Join the Fixit247 Fixer network for emergency, repair, maintenance, installation, roadside, and project requests
          from customers ready to move.
        </p>
        <Card variant="membership" className="mt-8 max-w-2xl">
          <Badge>No commission</Badge>
          <h2 className="mt-4 text-2xl font-black">Keep 100% of the work value.</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            A Fixer is a verified local tradie, roadside helper, or service provider on Fixit247. You pay for lead access,
            priority, verification, stronger matching, and business tools, not a percentage of the work.
          </p>
          <Button href="/register/tradie" className="mt-5">
            Apply to become a Fixer
          </Button>
        </Card>
      </section>

      <section className="container grid gap-4 pb-10 md:grid-cols-3">
        {[
          ["Emergency requests", "Urgent home and roadside problems where speed matters."],
          ["Standard trade jobs", "Repairs, maintenance, installations, and scheduled work."],
          ["Larger project quotes", "Renovations, upgrades, make-good works, and multi-trade opportunities."]
        ].map(([title, copy]) => (
          <Card key={title}>
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{copy}</p>
          </Card>
        ))}
      </section>

      <section className="container pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tradiePlans.map(([name, price, copy]) => (
            <Card key={name} variant={name === "Emergency Pro" ? "membership" : "default"}>
              <h2 className="text-xl font-black">{name}</h2>
              <p className="mt-3 text-4xl font-black">{price}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text3)]">/month</p>
              <p className="mt-4 text-sm leading-6 text-[var(--text2)]">{copy}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-5">
          <h2 className="text-xl font-black">Lead quality protection</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            If a request cannot be contacted, is not genuine, or was already resolved before first contact, credits can be
            returned after review.
          </p>
        </Card>
      </section>
      <PublicFooter />
    </main>
  );
}
