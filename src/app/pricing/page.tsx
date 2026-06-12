import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Badge, Button, Card, PublicFooter, PublicHeader } from "@/components/ui";
import { CheckoutButton } from "@/components/billing-buttons";
import { showFixerSubscriptionUi } from "@/lib/featureFlags";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fixit247 Pricing | Fixit Peace Home and Complete",
  description: "Simple peace-of-mind plans for home and roadside emergencies. Free requests plus Fixit Peace from $29/month.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Fixit247 Pricing",
    description: "Simple peace-of-mind plans for your home and road.",
    url: `${appUrl}/pricing`,
    type: "website"
  }
};

const customerPlans = [
  {
    code: "home",
    name: "Fixit Peace Home",
    price: "$29",
    note: "Peace of mind for home emergencies.",
    features: ["Priority home emergency matching", "Saved property profile", "Emergency history", "Member support"]
  },
  {
    code: "complete",
    name: "Fixit Peace Complete",
    price: "$49",
    note: "Peace of mind at home and on the road.",
    features: ["Everything in Home", "Roadside coordination", "Saved vehicle profile", "Home + road account"]
  }
];

export default function PricingPage() {
  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Pricing</Badge>
        <h1 className="mt-5 max-w-3xl text-[40px] font-black leading-tight tracking-tight md:text-[56px]">
          Start free. Add protection when you want more peace of mind.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Any customer can start a request without paying Fixit247. Fixit Peace adds priority support, saved details,
          reminders, and Safety Checks for households that want more readiness.
        </p>
      </section>

      <section className="container grid gap-5 pb-12 md:grid-cols-3">
        <Card>
          <Badge tone="gray">Free</Badge>
          <h2 className="mt-4 text-2xl font-black">Request posting</h2>
          <p className="mt-3 text-4xl font-black">$0</p>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            Post home emergencies, roadside help, standard trade jobs, and larger project quote requests free.
          </p>
          <Button href="/post-job" variant="ghost" className="mt-5 w-full">Post a request free</Button>
        </Card>
        {customerPlans.map((plan) => (
          <Card key={plan.code} variant={plan.code === "complete" ? "membership" : "default"}>
            <Badge tone={plan.code === "complete" ? "amber" : "gray"}>{plan.code === "complete" ? "Recommended" : "Home"}</Badge>
            <h2 className="mt-4 text-2xl font-black">{plan.name}</h2>
            <p className="mt-3 text-4xl font-black">{plan.price}</p>
            <p className="mt-1 text-sm font-semibold text-[var(--text3)]">/month</p>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{plan.note}</p>
            <div className="mt-5 grid gap-3">
              {plan.features.map((feature) => (
                <p key={feature} className="flex gap-2 text-sm text-[var(--text2)]">
                  <Check size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  {feature}
                </p>
              ))}
            </div>
            <div className="mt-5">
              <CheckoutButton planCode={plan.code} label={`Start ${plan.code === "home" ? "Home" : "Complete"}`} variant={plan.code === "complete" ? "primary" : "ghost"} />
            </div>
          </Card>
        ))}
      </section>

      <section className="container grid gap-5 pb-16 lg:grid-cols-[1fr_.65fr]">
        <Card variant="emergency">
          <Badge tone="red">Quoted separately</Badge>
          <h2 className="mt-4 text-2xl font-black">Membership is not a promise of free repairs.</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            Membership gives priority access, emergency coordination, saved profiles, and member support. Labour, parts,
            towing, repairs, trade work, renovations, and specialist services are quoted separately unless specifically
            included.
          </p>
        </Card>
        <Card>
          <h2 className="text-xl font-black">Are you a verified provider?</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            {showFixerSubscriptionUi
              ? "Fixers keep 100% of the job value and can choose plans, credits, verification, and priority access."
              : "Fixit 247 is onboarding reliable trades for emergency repairs, planned maintenance, agency work, and property service opportunities."}
          </p>
          <Button href="/become-a-fixer" variant="ghost" className="mt-5 w-full">
            {showFixerSubscriptionUi ? "See Fixer plans" : "Become a Fixer"}
          </Button>
        </Card>
      </section>
      <PublicFooter />
    </main>
  );
}
