import type { Metadata } from "next";
import { Check, Clock, Home, ShieldAlert, Star, Wrench } from "lucide-react";
import { Badge, Button, Card, MobileBottomActionBar, PublicHeader } from "@/components/ui";
import { CheckoutButton } from "@/components/billing-buttons";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fixit Plus | Home and roadside emergency peace of mind",
  description:
    "Fixit Plus gives your household priority access, emergency coordination, saved profiles, and member support from $29/month.",
  alternates: { canonical: "/fixit-plus" },
  openGraph: {
    title: "Fixit Plus",
    description: "Peace of mind before panic starts.",
    url: `${appUrl}/fixit-plus`,
    type: "website"
  }
};

const plans = [
  {
    name: "Fixit Plus Home",
    code: "home",
    price: "$29",
    note: "Peace of mind for home emergencies.",
    recommended: false,
    features: [
      "24/7 emergency request support",
      "Priority home emergency matching",
      "Plumbing emergencies",
      "Electrical faults",
      "Lockouts",
      "Leaks and urgent repairs",
      "Roof and storm issues",
      "Glass breakage",
      "Saved property profile",
      "Emergency history",
      "Maintenance reminders",
      "Member support"
    ]
  },
  {
    name: "Fixit Plus Complete",
    code: "complete",
    price: "$49",
    note: "Peace of mind at home and on the road.",
    recommended: true,
    features: [
      "Everything in Home",
      "Roadside emergency coordination",
      "Flat battery help",
      "Tyre change support",
      "Vehicle lockout support",
      "Fuel emergency support",
      "Towing coordination",
      "Mechanic matching",
      "Saved vehicle profile",
      "Family vehicle records",
      "Home + road dashboard"
    ]
  }
];

export default function FixitPlusPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Fixit Plus</Badge>
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <h1 className="mt-5 text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
              Peace of mind before panic starts.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
              Protect your home, your road moments, and your family from the stress of not knowing who to call.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/post-job">Get Help Now</Button>
              <Button href="#plans" variant="ghost">Compare plans</Button>
            </div>
          </div>
          <Card variant="emergency">
            <Clock className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-xl font-black">72-hour activation period</h2>
            <p className="mt-2 leading-7 text-[var(--text2)]">
              Fixit Plus membership benefits apply after a 72-hour activation period. Existing emergencies can still be
              posted free and handled as pay-as-you-go requests.
            </p>
          </Card>
        </div>
      </section>

      <section id="plans" className="container grid gap-5 pb-12 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} variant={plan.recommended ? "membership" : "default"} className="relative">
            {plan.recommended ? <Badge tone="amber">Recommended</Badge> : <Badge tone="gray">Home</Badge>}
            <h2 className="mt-4 text-2xl font-black">{plan.name}</h2>
            <p className="mt-2 text-[var(--text2)]">{plan.note}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-5xl font-black tracking-tight">{plan.price}</span>
              <span className="pb-2 text-sm font-semibold text-[var(--text2)]">/month</span>
            </div>
            <div className="mt-6 grid gap-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex gap-3 text-sm text-[var(--text2)]">
                  <Check size={17} className="mt-0.5 shrink-0 text-[var(--green)]" />
                  {feature}
                </div>
              ))}
            </div>
            <div className="mt-7">
              <CheckoutButton
                planCode={plan.code}
                label={plan.recommended ? "Start Complete $49" : "Start Home $29"}
                variant={plan.recommended ? "primary" : "ghost"}
              />
            </div>
          </Card>
        ))}
      </section>

      <section className="container grid gap-5 pb-12 md:grid-cols-3">
        <Card>
          <Home className="text-[var(--amber2)]" />
          <h3 className="mt-4 font-black">What Home covers</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Plumbing, electrical, lockouts, leaks, roof and storm issues, urgent repairs, glass breakage, and saved home
            context.
          </p>
        </Card>
        <Card>
          <ShieldAlert className="text-[var(--blue)]" />
          <h3 className="mt-4 font-black">What Complete adds</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Roadside coordination, flat battery help, tyre change support, vehicle lockout support, fuel emergency support,
            towing coordination, and saved vehicle records.
          </p>
        </Card>
        <Card>
          <Wrench className="text-[var(--purple)]" />
          <h3 className="mt-4 font-black">Any trade job still works</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Membership is for emergency peace of mind. Standard trade jobs and larger projects can still be posted free.
          </p>
        </Card>
      </section>

      <section className="container grid gap-5 pb-12 lg:grid-cols-2">
        <Card variant="emergency">
          <Badge tone="red">Important</Badge>
          <h3 className="mt-4 text-2xl font-black">What is quoted separately</h3>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            Membership gives priority access, emergency coordination, saved profiles, and member support. Labour, parts,
            towing, repairs, trade work, renovations, and specialist services are quoted separately unless specifically
            included.
          </p>
        </Card>
        <Card variant="membership">
          <Star className="text-[var(--amber2)]" />
          <h3 className="mt-4 text-2xl font-black">Saved home and vehicle profiles</h3>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            Keep property and vehicle details ready so urgent requests start with the information Fixers and support need.
          </p>
        </Card>
      </section>

      <section className="container grid gap-4 pb-16 md:grid-cols-3">
        {[
          ["Does Fixit Plus include free repairs?", "No. Repairs, labour, parts, towing, and specialist services are quoted separately unless specifically included."],
          ["Can I post an emergency without membership?", "Yes. Existing emergencies can be posted free and handled as pay-as-you-go requests."],
          ["Why the activation period?", "The 72-hour activation period protects the membership from being used only after an emergency has already happened."]
        ].map(([question, answer]) => (
          <Card key={question}>
            <h3 className="font-black">{question}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{answer}</p>
          </Card>
        ))}
      </section>
      <MobileBottomActionBar />
    </main>
  );
}
