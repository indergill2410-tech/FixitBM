import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock,
  Droplets,
  Flame,
  KeyRound,
  PlugZap,
  ShieldCheck,
  Thermometer,
  Umbrella,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { Badge, Button, Card, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { CheckoutButton } from "@/components/billing-buttons";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Fixit Peace | 24/7 Home & Roadside Emergency Cover from $29/month",
  description:
    "Membership covers the emergency call-out, the first hour on site, and emergency repair parts — plus priority 24/7 response and an annual home Safety & Readiness Check. From $29/month.",
  alternates: { canonical: "/fixit-peace" },
  openGraph: {
    title: "Fixit Peace | 24/7 Emergency Cover from $29/month",
    description: "Call-out, first hour on site, and emergency repair parts — included.",
    url: `${appUrl}/fixit-peace`,
    type: "website"
  }
};

const trustBar = [
  "Emergency call-out included",
  "First hour on site included",
  "Emergency repair parts included",
  "Priority 24/7 response",
  "Licensed, insured Fixers"
];

const homeFeatures = [
  "Emergency call-out, first hour on site, and emergency repair parts — included",
  "Priority response, 24/7 — members are seen first",
  "Annual Home Safety & Readiness Check (inspection) — $149 value, included",
  "Your home details saved, so a Fixer responds faster when you call",
  "An upfront quote before any larger repair — you approve before work starts",
  "Reminders, emergency history, and recommended fixes in your member account"
];

const completeFeatures = [
  "Everything in Home, plus roadside cover for your car:",
  "Roadside assistance: flat battery, tyre change, vehicle lockout, fuel, and towing coordination",
  "Two Safety Checks a year (home), plus a vehicle readiness check — $298 value",
  "Your vehicle details saved for a faster roadside response",
  "Service reminders: registration, battery age, and tyre wear"
];

const safetyAreas = [
  { icon: Droplets, title: "Water", copy: "Shut-off valve location and access, plus visible leak and pressure concerns." },
  { icon: PlugZap, title: "Electrical", copy: "Switchboard and safety-switch check, and visible electrical hazards." },
  { icon: Flame, title: "Fire", copy: "Smoke alarm placement and battery reminders." },
  { icon: KeyRound, title: "Access", copy: "Lockout and spare-key readiness before you're stuck outside." },
  { icon: Umbrella, title: "Weather", copy: "Roof and gutter condition, ready for the next storm." },
  { icon: Thermometer, title: "Appliances", copy: "Hot water and heating/cooling, checked for visible wear." }
];

const comparison = [
  ["Emergency call-out fee", "$99–$180", "Included"],
  ["First hour on site", "$120–$220", "Included"],
  ["Emergency repair parts", "$20–$75", "Included"],
  ["Response priority", "Standard queue", "Seen first, 24/7"],
  ["Fixer has your home details", "No — starts from scratch", "Yes — saved profile"],
  ["Annual Safety Check (inspection)", "Not offered", "Included ($149 value)"]
] as [string, string, string][];

const faqs: [string, string][] = [
  [
    "What exactly is included in an emergency?",
    "The emergency call-out, the first hour of work on site, and emergency repair parts — all included, 24/7, with no after-hours surcharge. Most common emergencies (a burst pipe, a tripped circuit, a lockout, a blocked toilet) are resolved within this. If a larger repair is needed, you get an upfront quote and approve it before any further work."
  ],
  [
    "How many emergencies are covered?",
    "Up to 4 emergency call-outs per year for your home, under a fair-use policy — comfortably more than almost anyone needs. Complete members get a further 4 roadside call-outs per year. The limit simply prevents misuse, which is what keeps the price at $29 rather than $99."
  ],
  [
    "What counts as an emergency?",
    "Anything that can't safely wait: burst or leaking pipes, loss of power, an electrical fault, a lockout, a toilet that won't stop, storm damage, broken glass, no hot water — plus roadside breakdowns on Complete. A dripping tap or a planned renovation isn't an emergency, but you can post those as a standard job anytime, free."
  ],
  [
    "What if the repair is bigger than the included hour?",
    "The Fixer gives you a clear, upfront quote on site before doing anything further. Approve it and they continue; decline and they make the area safe at no extra cost. You're never charged for work you didn't approve."
  ],
  [
    "Why is there a 3-day activation period?",
    "Your cover starts 3 days (72 hours) after you join — the standard insurers use. It keeps membership fair by ensuring people join before an emergency, not during one, which is what keeps the price low. Already mid-emergency? You don't need to join — get help now and pay as you go."
  ],
  [
    "Can I cover a rental or investment property?",
    "Each membership covers one property. Landlords and property managers who need rental compliance inspections and tenant emergency support should use PropertySafe, which is built for that."
  ],
  [
    "How does the 12-month membership work?",
    "Fixit Peace is a 12-month membership, managed from your account. Your cover and your price are set for the full term; full cancellation and renewal terms are in the membership Terms."
  ],
  [
    "Are your Fixers licensed and insured?",
    "Yes. Every Fixer is verified for the relevant licence and insurance before work is assigned. Regulated gas and electrical work is always performed and certified by an appropriately licensed tradesperson."
  ]
];

export default function FixitPeacePage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />

      {/* HERO */}
      <section className="container py-14">
        <Badge>Fixit Peace Membership</Badge>
        <h1 className="mt-5 max-w-4xl text-[40px] font-black leading-[1.05] tracking-tight md:text-[64px]">
          We turn up, fix it, and you don&rsquo;t get a bill for it.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Your Fixit Peace membership covers the emergency call-out, the first hour on site, and emergency repair parts
          — 24/7, with priority response and an annual home Safety &amp; Readiness Check. Most emergency repairs are
          done in 30 minutes to an hour. From $29/month.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <CheckoutButton planCode="home" label="Protect my home — $29/mo" />
          <Button href="#plans" variant="ghost">
            Compare plans
            <ArrowRight size={16} />
          </Button>
        </div>
        <p className="mt-4 text-sm font-semibold text-[var(--text3)]">12-month membership · Cover starts 3 days after you join.</p>

        {/* TRUST BAR */}
        <div className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)] sm:grid-cols-2 lg:grid-cols-5">
          {trustBar.map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm font-semibold text-[var(--text2)]">
              <Check size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* PLAN CARDS */}
      <section id="plans" className="container grid gap-5 pb-12 md:grid-cols-2">
        <Card className="relative">
          <Badge tone="gray">Home</Badge>
          <h2 className="mt-4 text-2xl font-black">Fixit Peace Home</h2>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-5xl font-black tracking-tight">$29</span>
            <span className="pb-2 text-sm font-semibold text-[var(--text2)]">/month</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--amber2)]">Or $290/year — 2 months free</p>
          <p className="mt-3 text-[var(--text2)]">Every home emergency, covered.</p>
          <div className="mt-5 grid gap-3">
            {homeFeatures.map((feature) => (
              <div key={feature} className="flex gap-3 text-sm text-[var(--text2)]">
                <Check size={17} className="mt-0.5 shrink-0 text-[var(--green)]" />
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-7">
            <CheckoutButton planCode="home" label="Protect my home" variant="ghost" />
          </div>
        </Card>

        <Card variant="membership" className="relative">
          <Badge tone="amber">🏆 Best value</Badge>
          <h2 className="mt-4 text-2xl font-black">Fixit Peace Complete</h2>
          <div className="mt-3 flex items-end gap-1">
            <span className="text-5xl font-black tracking-tight">$49</span>
            <span className="pb-2 text-sm font-semibold text-[var(--text2)]">/month</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-[var(--amber2)]">Or $490/year — 2 months free</p>
          <p className="mt-3 text-[var(--text2)]">Covered at home and on the road.</p>
          <div className="mt-5 grid gap-3">
            {completeFeatures.map((feature) => (
              <div key={feature} className="flex gap-3 text-sm text-[var(--text2)]">
                <Check size={17} className="mt-0.5 shrink-0 text-[var(--green)]" />
                {feature}
              </div>
            ))}
          </div>
          <div className="mt-7">
            <CheckoutButton planCode="complete" label="Protect home + road" />
          </div>
        </Card>
        <p className="text-xs leading-5 text-[var(--text3)] md:col-span-2">
          Covers up to 4 home emergency call-outs a year under a fair-use policy — see exactly what&rsquo;s included
          below. Cover is expanding across Australia; confirm your area when you join.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="container pb-12">
        <Card variant="dark" className="p-6 md:p-8">
          <Badge>How it works</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">What happens when you call.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/72">
            Three steps, no surprises:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["1. Request help, 24/7", "Tap “Help now” any hour. Your saved home details mean a Fixer responds faster — no twenty questions while you panic."],
              ["2. A Fixer attends and repairs it", "Burst pipe, power fault, lockout, blocked toilet — most are fixed on the spot. The call-out, the first hour on site, and emergency repair parts are all included, and most repairs take 30 minutes to an hour."],
              ["3. Larger job? Upfront quote first", "If a bigger repair is needed, you get a clear quote before any further work. Approve it, or we make the area safe and you decide later — you're never charged for work you didn't approve."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="font-black text-white/90">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-white/72">
            Fair use: up to 4 home emergency call-outs per year (plus 4 roadside on Complete) — well beyond what almost
            anyone needs. The limit prevents misuse, which is what keeps membership at $29/month rather than $99.
          </p>
        </Card>
      </section>

      {/* SAFETY CHECK */}
      <section id="safety-check" className="container pb-12">
        <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <Card variant="membership">
            <Badge tone="green">Included with every plan</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              An annual Safety &amp; Readiness Check, included.
            </h2>
            <p className="mt-4 leading-7 text-[var(--text2)]">
              Once a year, a Fixer carries out a Home Safety &amp; Readiness Check — a visual inspection of the systems
              most likely to fail — so small issues are caught before they become an emergency.{" "}
              <strong className="text-[var(--text)]">$149 value, included free.</strong>
            </p>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-[var(--text2)]">
              <strong>Complete members</strong> get the inspection twice a year, plus a vehicle readiness check —
              battery, tyres, and fluids.
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--text2)]">
              You receive a written summary, reminders when anything is due, and recommended fixes ranked by priority —
              which you can action with any Fixer, no obligation.
            </p>
          </Card>
          <div className="grid gap-3 sm:grid-cols-2">
            {safetyAreas.map((area) => {
              const Icon = area.icon;
              return (
                <Card key={area.title}>
                  <Icon className="text-[var(--amber2)]" size={20} />
                  <h3 className="mt-3 font-black">{area.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[var(--text2)]">{area.copy}</p>
                </Card>
              );
            })}
          </div>
        </div>
        <p className="mt-5 text-xs leading-5 text-[var(--text3)]">
          The Safety &amp; Readiness Check is a visual inspection, not a compliance certificate. Regulated gas and
          electrical compliance work is always performed and certified by an appropriately licensed tradesperson. For
          rental compliance inspections, see{" "}
          <Link href="/propertysafe" className="font-bold text-[var(--amber2)] hover:underline">
            PropertySafe
          </Link>
          .
        </p>
      </section>

      {/* COMPARISON TABLE */}
      <section className="container pb-12">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">One emergency vs a year of membership.</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="p-4 font-black"> </th>
                <th className="p-4 font-black text-[var(--text2)]">Not a member</th>
                <th className="p-4 font-black text-[var(--amber2)]">Fixit Peace member</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(([label, payg, member]) => (
                <tr key={label} className="border-b border-[var(--border)] last:border-0">
                  <td className="p-4 font-semibold">{label}</td>
                  <td className="p-4 text-[var(--text2)]">{payg}</td>
                  <td className="p-4 font-black text-[var(--green)]">{member}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-lg font-black">
          A single after-hours emergency can cost more than a full year of membership.
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--text3)]">
          Non-member figures are typical after-hours trade rates and vary by region and trade.
        </p>
      </section>

      {/* WHEN COVER STARTS */}
      <section className="container pb-12">
        <Card variant="emergency">
          <Clock className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-2xl font-black tracking-tight">Cover starts 3 days after you join.</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--text2)]">
            There&rsquo;s a 72-hour activation period — the same standard insurers use. It keeps membership fair by
            ensuring people join before an emergency, not during one, which is what keeps the price at $29/month.
          </p>
          <p className="mt-4 max-w-3xl font-bold leading-7 text-[var(--text)]">
            Already mid-emergency? You don&rsquo;t need to join to get help. Post your request now and pay as you go —
            then join afterwards so the next one&rsquo;s covered.
          </p>
          <Button href="/post-job" variant="ghost" className="mt-5">
            Get help now — no membership needed
          </Button>
        </Card>
      </section>

      {/* ANY TRADE JOB */}
      <section className="container pb-12">
        <Card>
          <Wrench className="text-[var(--purple)]" />
          <h2 className="mt-4 text-2xl font-black tracking-tight">
            Membership covers emergencies. Everything else stays free to post.
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--text2)]">
            Renovations, a new fence, a bathroom upgrade — post any standard trade job on Fixit247 free, whether you
            are a member or not. Fixit Peace is your emergency safety net, and your saved home profile makes every job
            start faster.
          </p>
        </Card>
      </section>

      {/* 12-MONTH MEMBERSHIP */}
      <section className="container pb-12">
        <Card variant="dark" className="p-6 md:p-8">
          <BadgeCheck className="text-[var(--amber)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            A full year of cover, in one membership.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/72">
            Fixit Peace is a 12-month membership. You&rsquo;re covered for home emergencies every day of the year, your
            monthly price is held for the full term, and your annual Safety &amp; Readiness Check is built in.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["12 months of 24/7 emergency cover", "Your price held for the full term", "Annual Safety & Readiness Check included"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/8 p-3 text-sm font-black text-white/85">
                <Check size={16} className="text-[var(--green)]" />
                {item}
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* FAQ */}
      <section className="container pb-12">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">Common questions</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {faqs.map(([question, answer]) => (
            <Card key={question}>
              <h3 className="font-black">{question}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{answer}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="container pb-16">
        <Card variant="membership" className="text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight md:text-4xl">
            The next emergency is already covered.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[var(--text2)]">
            Call-out, first hour on site, and emergency repair parts — included, 24/7, from $29/month. Join today and
            your cover starts in 3 days.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <CheckoutButton planCode="home" label="Protect my home — $29/mo" />
            <CheckoutButton planCode="complete" label="Protect home + road — $49/mo" variant="ghost" />
          </div>
          <p className="mt-4 text-xs font-semibold text-[var(--text3)]">
            12-month membership · Annual Safety &amp; Readiness Check included · Licensed &amp; insured Fixers
          </p>
        </Card>
      </section>

      <PublicFooter />
      <MobileBottomActionBar href="/fixit-peace#plans" label="Protect my home — $29/mo" icon={ShieldCheck} />
    </main>
  );
}
