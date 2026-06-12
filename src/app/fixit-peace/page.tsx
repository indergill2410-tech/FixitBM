import type { Metadata } from "next";
import { Check, Clock, Home, ShieldAlert, Star, Wrench } from "lucide-react";
import { Badge, Button, Card, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { CheckoutButton } from "@/components/billing-buttons";
import { appUrl } from "@/lib/seo";
import { activationCopy, safetyCheckChecklist, safetyCheckDisclaimer } from "@/lib/safety-checks";

export const metadata: Metadata = {
  title: "Fixit Peace | Home and roadside emergency peace of mind",
  description:
    "Fixit Peace gives your household priority access, emergency coordination, saved profiles, and member support from $29/month.",
  alternates: { canonical: "/fixit-peace" },
  openGraph: {
    title: "Fixit Peace",
    description: "Peace of mind before panic starts.",
    url: `${appUrl}/fixit-peace`,
    type: "website"
  }
};

const plans = [
  {
    name: "Fixit Peace Home",
    code: "home",
    price: "$29",
    note: "Peace of mind for home emergencies.",
    recommended: false,
    features: [
      "Priority emergency request support",
      "Saved home details and emergency history",
      "6-monthly Home Safety & Readiness Check",
      "Member account, reminders, and recommended fixes"
    ]
  },
  {
    name: "Fixit Peace Complete",
    code: "complete",
    price: "$49",
    note: "Peace of mind at home and on the road.",
    recommended: true,
    features: [
      "Everything in Home",
      "Home + road emergency request support",
      "Saved home and vehicle details",
      "6-monthly home + road readiness check",
      "Member account, roadside reminders, and recommended fixes"
    ]
  }
];

export default function FixitPlusPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container py-14">
        <Badge>Fixit Peace</Badge>
        <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-end">
          <div>
            <h1 className="mt-5 text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
              Protect the moments before home panic starts.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
              Fixit Peace gives your household priority request support, saved home details, and a 6-monthly Safety &
              Readiness Check, so the next leak, lockout, fault, storm, or breakdown starts with a plan.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button href="/post-job">Get help now</Button>
              <Button href="#plans" variant="ghost">Compare plans</Button>
            </div>
          </div>
          <Card variant="emergency">
            <Clock className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-xl font-black">Fair-use activation</h2>
            <p className="mt-2 leading-7 text-[var(--text2)]">
              To keep Fixit Peace fair for every member, benefits activate after 72 hours. Existing emergencies can still be
              started free and handled as pay-as-you-go requests.
            </p>
          </Card>
        </div>
      </section>

      <section id="plans" className="container grid gap-5 pb-12 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.name} variant={plan.recommended ? "membership" : "default"} className="relative">
            {plan.recommended ? <Badge tone="amber">Best value</Badge> : <Badge tone="gray">Home</Badge>}
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
                label={plan.recommended ? "Protect home + road" : "Protect my home"}
                variant={plan.recommended ? "primary" : "ghost"}
              />
            </div>
          </Card>
        ))}
      </section>

      <section id="safety-check" className="container grid gap-5 pb-12 lg:grid-cols-[.9fr_1.1fr]">
        <Card variant="membership">
          <Badge>Included with Fixit Peace</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Included with Fixit Peace: your 6-monthly Safety Check.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Most people only think about home emergencies after something goes wrong. Fixit Peace helps you prepare earlier
            with a visual readiness check, saved home details, emergency reminders, and recommended fixes.
          </p>
          <p className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-[var(--text2)]">
            {activationCopy}
          </p>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          {safetyCheckChecklist.map((item) => (
            <Card key={item}>
              <Check className="text-[var(--green)]" size={18} />
              <h3 className="mt-4 font-black">{item}</h3>
            </Card>
          ))}
        </div>
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

      <section className="container pb-12">
        <Card variant="emergency">
          <Badge tone="amber">Safety Check disclaimer</Badge>
          <p className="mt-3 leading-7 text-[var(--text2)]">{safetyCheckDisclaimer}</p>
        </Card>
      </section>

      <section className="container grid gap-4 pb-16 md:grid-cols-3">
        {[
          ["Does Fixit Peace include free repairs?", "No. Repairs, labour, parts, towing, and specialist services are quoted separately unless specifically included."],
          ["Can I start an emergency without membership?", "Yes. Existing emergencies can be started free and handled as pay-as-you-go requests."],
          ["Why the activation period?", "The 72-hour activation period keeps the membership fair and protects every member from misuse after an emergency has already happened."]
        ].map(([question, answer]) => (
          <Card key={question}>
            <h3 className="font-black">{question}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{answer}</p>
          </Card>
        ))}
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
