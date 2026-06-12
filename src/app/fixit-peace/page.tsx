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
    "Emergency callouts with the first hour of labour and minor parts included, priority 24/7 response, and a professional Safety Check every year. From $29/month.",
  alternates: { canonical: "/fixit-peace" },
  openGraph: {
    title: "Fixit Peace | 24/7 Emergency Cover from $29/month",
    description: "The emergency is covered before it happens.",
    url: `${appUrl}/fixit-peace`,
    type: "website"
  }
};

const trustBar = [
  "First hour of labour included",
  "Minor parts included",
  "Upfront quotes — no surprise bills",
  "Licensed, insured Fixers",
  "24/7, every day of the year"
];

const homeFeatures = [
  "Emergency callouts included — first hour of labour and minor parts covered, 24/7 *",
  "Priority response — members jump the queue, day or night",
  "Annual Home Safety & Readiness Check — valued at $149",
  "Saved home profile — Fixers arrive already briefed, no 20 questions at 2 AM",
  "Upfront quotes on bigger jobs — you approve before any extra work starts",
  "Reminders, emergency history, and recommended fixes in your member account"
];

const completeFeatures = [
  "Everything in Home, plus:",
  "Roadside emergencies included — flat battery, tyre change, vehicle lockout, fuel emergency, towing coordination *",
  "6-monthly Safety Checks — home and vehicle, valued at $298/year",
  "Saved vehicle profile — faster roadside response with your details ready",
  "Roadside reminders: rego, battery age, tyre wear"
];

const safetyAreas = [
  { icon: Droplets, title: "Water", copy: "Shutoff valve access, visible leak and pressure concerns." },
  { icon: PlugZap, title: "Electrical", copy: "Visible hazards, switchboard awareness, safety switch check." },
  { icon: Flame, title: "Fire", copy: "Smoke alarm placement and battery reminders." },
  { icon: KeyRound, title: "Access", copy: "Lockout readiness and key safety." },
  { icon: Umbrella, title: "Weather", copy: "Roof, gutter, and storm readiness." },
  { icon: Thermometer, title: "Appliances", copy: "Hot water, HVAC, and visible wear concerns." }
];

const comparison: [string, string, string][] = [
  ["After-hours callout fee", "$99–$180", "$0 — included"],
  ["First hour of emergency labour", "$120–$220", "$0 — included"],
  ["Minor parts (washers, fuses, fittings)", "$20–$75", "$0 — included"],
  ["Response priority", "Standard queue", "Front of the queue"],
  ["Fixer arrives knowing your home", "No", "Yes — saved profile"],
  ["Annual Safety Check ($149 value)", "—", "Included"]
];

const faqs: [string, string][] = [
  [
    "What exactly is included in an emergency callout?",
    "The callout itself, the first hour of labour, and minor parts (up to $75) — 24/7, with no after-hours surcharge. Most common emergencies are resolved entirely within this. Bigger repairs are quoted upfront for your approval first."
  ],
  [
    "How many included callouts do I get?",
    "Up to 4 genuine emergency callouts per year per property, under our fair use policy. Roadside callouts for Complete members are counted separately (up to 4 per year)."
  ],
  [
    "What counts as an emergency?",
    "Something that can’t safely wait: burst or leaking pipes, loss of power, electrical faults, lockouts, blocked toilets, storm damage, broken glass, no hot water, roadside breakdowns (Complete). A dripping tap or a planned renovation isn’t an emergency — but you can post those as standard jobs anytime, free."
  ],
  [
    "What if my repair needs more than the included hour or parts?",
    "The Fixer gives you an upfront quote on the spot before doing anything further. Approve it and they continue; decline and they make the area safe at no extra cost. You are never billed for work you didn’t approve."
  ],
  [
    "Why is there a 72-hour activation period?",
    "It keeps membership fair — people join before emergencies, not during them — which is exactly what keeps the price at $29. If you have an emergency right now, start it free as a pay-as-you-go request."
  ],
  [
    "Can I cover an investment property or rental?",
    "Each membership covers one property. For landlords and property managers who need rental compliance checks and tenant emergency support, see PropertySafe — built specifically for that."
  ],
  [
    "Can I cancel anytime?",
    "Yes. Monthly plans cancel anytime from your account, effective at the end of the billing period. No lock-in, no exit fees."
  ],
  [
    "Is my Fixer licensed and insured?",
    "Yes. Emergency work is performed by Fixers verified for the relevant licence and insurance. Regulated gas and electrical work is always performed and certified by appropriately licensed tradespeople."
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
          The 2 AM emergency, already paid for.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
          Fixit Peace members get emergency callouts with the{" "}
          <strong className="text-[var(--text)]">first hour of labour and minor parts included</strong> — plus priority
          24/7 response and a professional Home Safety Check every year. When something bursts, trips, or locks you out,
          it starts with a plan instead of a panic.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <CheckoutButton planCode="home" label="Protect my home — $29/mo" />
          <Button href="#plans" variant="ghost">
            Compare plans
            <ArrowRight size={16} />
          </Button>
        </div>
        <p className="mt-4 text-sm font-semibold text-[var(--text3)]">Cancel anytime. Benefits activate after 72 hours.</p>

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
          <p className="mt-3 text-[var(--text2)]">Peace of mind for every home emergency.</p>
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
          * Fair use applies. See “How included emergencies work” below. Coverage is expanding across Australia —
          confirm your area when you join.
        </p>
      </section>

      {/* HOW INCLUDED EMERGENCIES WORK */}
      <section className="container pb-12">
        <Card variant="dark" className="p-6 md:p-8">
          <Badge>No surprises</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">No surprise bills. Ever.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/72">
            Here’s exactly how a member emergency works — no fine-print games:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["1. You call or tap “Help now.”", "Any hour, any day. Your saved home profile means we already know your property, access details, and history. The Fixer arrives briefed."],
              ["2. First hour of labour and minor parts are included.", "Most common emergencies — a burst tap, a tripped circuit, a lockout, a blocked toilet — are fixed on the spot, fully covered by your membership (parts up to $75)."],
              ["3. Bigger job? Upfront quote first.", "Major repairs, replacements, and specialist work are quoted before anything happens. Approve it, or we make the area safe and you decide later. You’re never billed for work you didn’t agree to."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="font-black text-white/90">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-white/72">
            <strong className="text-[var(--amber)]">Fair use:</strong> Membership covers up to 4 included emergency
            callouts per year, per property. Genuine emergencies only — and that’s almost everyone. It’s what keeps the
            price at $29 instead of $99.
          </p>
        </Card>
      </section>

      {/* SAFETY CHECK */}
      <section id="safety-check" className="container pb-12">
        <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <Card variant="membership">
            <Badge tone="green">Included with every plan</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              Most cover waits for things to break. We show up before they do.
            </h2>
            <p className="mt-4 leading-7 text-[var(--text2)]">
              Every Fixit Peace plan includes a professional Safety &amp; Readiness Check —{" "}
              <strong className="text-[var(--text)]">valued at $149</strong> — where a Fixer walks your property and gets
              it emergency-ready.
            </p>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-[var(--text2)]">
              <strong>Complete members</strong> get this every 6 months — plus a vehicle readiness check: battery,
              tyres, fluids, and the things that strand you.
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--text2)]">
              You’ll get a written summary, reminders for anything due, and recommended fixes ranked by urgency — fix
              them with any Fixer you like, no obligation.
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
          Safety Checks are visual readiness inspections. Regulated gas and electrical compliance work must be performed
          and certified by appropriately licensed tradespeople and is quoted separately. For rental compliance
          inspections, see{" "}
          <Link href="/propertysafe" className="font-bold text-[var(--amber2)] hover:underline">
            PropertySafe
          </Link>
          .
        </p>
      </section>

      {/* COMPARISON TABLE */}
      <section className="container pb-12">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">What a single bad night costs without Fixit Peace</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow)]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg)]">
                <th className="p-4 font-black"> </th>
                <th className="p-4 font-black text-[var(--text2)]">Pay-as-you-go</th>
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
          One emergency can cost more than a full year of membership. That’s the entire point.
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--text3)]">
          Pay-as-you-go ranges are typical after-hours trade rates and vary by region and trade.
        </p>
      </section>

      {/* FAIR-USE ACTIVATION */}
      <section className="container pb-12">
        <Card variant="emergency">
          <Clock className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-2xl font-black tracking-tight">Why benefits start after 72 hours</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--text2)]">
            Included benefits activate 72 hours after you join. It’s the same standard the big providers use — it keeps
            membership fair and the price low for everyone, by making sure people join before the emergency, not during
            one.
          </p>
          <p className="mt-4 max-w-3xl font-bold leading-7 text-[var(--text)]">
            Already mid-emergency right now? You don’t need a membership to get help. Start your request free and pay as
            you go — then join afterwards so the next one’s covered.
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
            Membership is for emergencies. Everything else stays free to post.
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--text2)]">
            Renovation? New fence? Bathroom redo? Post any standard trade job on Fixit247 free, membership or not. Fixit
            Peace is purely your emergency safety net — and members’ saved profiles make every job start smoother.
          </p>
        </Card>
      </section>

      {/* FOUNDING MEMBER */}
      <section className="container pb-12">
        <Card variant="dark" className="p-6 md:p-8">
          <BadgeCheck className="text-[var(--amber)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Lock in founding member pricing — for life.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/72">
            Fixit Peace is new, and early members are the reason it’ll work. Join now and your rate is locked at
            $29/month for as long as you stay a member — even when pricing rises for new members later.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Price locked for life", "Cancel anytime", "Direct line to the team building this"].map((item) => (
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
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">Questions, answered.</h2>
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
            The next emergency is a matter of when.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[var(--text2)]">
            Join today, and in 72 hours every burst pipe, dead battery, and midnight lockout starts with: “It’s
            covered.”
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <CheckoutButton planCode="home" label="Protect my home — $29/mo" />
            <CheckoutButton planCode="complete" label="Protect home + road — $49/mo" variant="ghost" />
          </div>
          <p className="mt-4 text-xs font-semibold text-[var(--text3)]">
            Cancel anytime · Founding member price locked for life · Licensed &amp; insured Fixers
          </p>
        </Card>
      </section>

      <PublicFooter />
      <MobileBottomActionBar href="/fixit-peace#plans" label="Protect my home — $29/mo" icon={ShieldCheck} />
    </main>
  );
}
