import { Check, Clock, Home, ShieldAlert } from "lucide-react";
import { Badge, Card, MobileBottomActionBar, PublicHeader } from "@/components/ui";
import { CheckoutButton } from "@/components/billing-buttons";

const plans = [
  {
    name: "Fixit Plus Home",
    code: "home",
    price: "$29",
    note: "Emergency peace of mind for your home.",
    recommended: false,
    features: [
      "24/7 emergency request support",
      "Priority home emergency matching",
      "Plumbing and electrical emergencies",
      "Lockouts, leaks, urgent repairs",
      "Saved property profile",
      "Emergency job history",
      "Maintenance reminders",
      "Priority support"
    ]
  },
  {
    name: "Fixit Plus Complete",
    code: "complete",
    price: "$49",
    note: "Home + roadside emergency peace of mind.",
    recommended: true,
    features: [
      "Everything in Home",
      "Roadside support coordination",
      "Flat battery and tyre change support",
      "Vehicle lockout and fuel emergency support",
      "Towing coordination",
      "Mechanic matching",
      "Saved vehicle profile",
      "Home + road emergency dashboard"
    ]
  }
];

export default function FixitPlusPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Peace of mind for your home and road</Badge>
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <h1 className="mt-5 text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
              One membership for the moments when things go wrong.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
              From burst pipes and lockouts to flat tyres and dead batteries, Fixit Plus helps you get emergency support
              when you need it most.
            </p>
          </div>
          <Card variant="emergency">
            <Clock className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-xl font-black">72-hour activation period</h2>
            <p className="mt-2 leading-7 text-[var(--text2)]">
              Fixit Plus membership benefits apply after a 72-hour activation period. Existing emergencies can still be
              posted free and handled as pay-as-you-go jobs.
            </p>
          </Card>
        </div>
      </section>

      <section className="container grid gap-5 pb-12 md:grid-cols-2">
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

      <section className="container grid gap-5 pb-16 md:grid-cols-3">
        <Card>
          <Home className="text-[var(--amber2)]" />
          <h3 className="mt-4 font-black">Home emergencies covered</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Plumbing, electrical, lockouts, leaks, roof and storm issues, urgent repairs, and glass breakage.</p>
        </Card>
        <Card>
          <ShieldAlert className="text-[var(--blue)]" />
          <h3 className="mt-4 font-black">Road support in Complete</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Flat battery help, tyre change support, vehicle lockout support, fuel emergencies, towing coordination, and mechanic matching.</p>
        </Card>
        <Card>
          <Badge tone="red">Important</Badge>
          <h3 className="mt-4 font-black">What is not included</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Tradie labour, parts, call-out fees, repairs, towing, and specialist services are quoted separately unless specifically included in your plan.</p>
        </Card>
      </section>
      <MobileBottomActionBar />
    </main>
  );
}
