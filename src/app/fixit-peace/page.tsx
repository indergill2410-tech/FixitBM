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
    "When something breaks, we turn up, fix it, and you don't get a bill for it. Priority 24/7 help and a yearly home once-over. From $29/month.",
  alternates: { canonical: "/fixit-peace" },
  openGraph: {
    title: "Fixit Peace | 24/7 Emergency Cover from $29/month",
    description: "When it breaks, it's already covered.",
    url: `${appUrl}/fixit-peace`,
    type: "website"
  }
};

const trustBar = [
  "No charge to turn up",
  "No bill for the fix",
  "No 2 AM price-gouging",
  "Real, insured local Fixers",
  "Day or night, all year"
];

const homeFeatures = [
  "We turn up and fix it — and you don't get a bill for it",
  "Members get help first, day or night",
  "A yearly once-over that catches trouble early — worth $149, yours free",
  "We already know your home, so help starts the second you call",
  "Anything bigger? You see the price first and decide — never a surprise",
  "Reminders and a simple record of everything, in your account"
];

const completeFeatures = [
  "Everything in Home, plus your car:",
  "Stuck on the road? Flat battery, dead tyre, locked out, out of fuel, need a tow — handled",
  "Two home check-ups a year instead of one, plus a car once-over — worth $298",
  "We keep your car details ready, so roadside help moves faster",
  "Nudges before the stuff that strands you — rego, tired battery, worn tyres"
];

const safetyAreas = [
  { icon: Droplets, title: "Water", copy: "Where to shut it off fast, and the drips that turn into floods." },
  { icon: PlugZap, title: "Power", copy: "The hidden hazards and the trip-switch that keeps you safe." },
  { icon: Flame, title: "Fire", copy: "Smoke alarms in the right spots, with fresh batteries." },
  { icon: KeyRound, title: "Getting in", copy: "Spare-key and lockout planning before you're stuck on the doorstep." },
  { icon: Umbrella, title: "Storms", copy: "Roof and gutters ready before the next big downpour." },
  { icon: Thermometer, title: "Comfort", copy: "Hot water and heating/cooling, checked before they quit on you." }
];

const comparison = [
  ["Someone turns up at 2 AM", "$99–$180 just to knock", "On us"],
  ["Getting it fixed", "$120–$220 an hour", "On us"],
  ["The little bits and pieces", "$20–$75 on top", "On us"],
  ["How fast you're seen", "Wait your turn", "Straight to the front"],
  ["They already know your home", "Twenty questions while you panic", "We've got your details"],
  ["Yearly home once-over", "Never happens", "Yours free ($149 value)"]
] as [string, string, string][];

const faqs: [string, string][] = [
  [
    "So what does “covered” actually mean?",
    "We come out, and we fix the emergency — and you pay nothing for that. The trip out, the time to sort it, the small bits and pieces: all on us. If it turns out to be a much bigger job, you'll see the price and decide before anyone lifts a tool."
  ],
  [
    "Is there a limit?",
    "It covers the real emergencies life throws at you — up to four a year for your home (and four more on the road if you're on Complete). That's well beyond what almost anyone ever needs. The limit just stops the rare person abusing it, which is how we keep it $29 and not $99."
  ],
  [
    "What counts as an emergency?",
    "Anything that can't safely wait: water going everywhere, no power, a fault that worries you, locked out, a toilet that won't stop, storm damage, broken glass, no hot water — and breakdowns on the road if you're on Complete. A dripping tap or a planned reno isn't an emergency, but you can always post those as a normal job, free."
  ],
  [
    "What if it's a big job?",
    "You'll get a clear price up front, before anything happens. Say yes and we get on with it. Say no and we'll make it safe and leave the decision with you. You will never be charged for work you didn't agree to. Simple as that."
  ],
  [
    "Why do I wait 3 days to be covered?",
    "Your cover switches on three days after you join. It's the same rule the big insurers use — it keeps things fair so people join before the emergency, not halfway through one. That's exactly what keeps it $29. Already in the middle of one? You don't need to join — just get help now and pay as you go."
  ],
  [
    "Can I cover a rental or investment property?",
    "One membership looks after one home. If you're a landlord or manage rentals and need compliance checks and tenant emergency support, PropertySafe is built for exactly that."
  ],
  [
    "Can I cancel whenever I want?",
    "Yep. Cancel anytime from your account — it just runs to the end of the month you've paid for. No lock-in, no exit fee, no awkward phone call."
  ],
  [
    "Are your Fixers the real deal?",
    "Every Fixer is checked for the right licence and insurance before we send them your way. Anything to do with gas or electrical safety is always handled and signed off by a properly licensed tradesperson."
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
          It&rsquo;s 2 AM and the water&rsquo;s everywhere. You&rsquo;re not Googling plumbers or bracing for a
          rip-off price — you&rsquo;re already covered. Fixit Peace members get a real, insured local Fixer out fast,
          the emergency sorted, and nothing to pay for it. From $29 a month.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <CheckoutButton planCode="home" label="Protect my home — $29/mo" />
          <Button href="#plans" variant="ghost">
            Compare plans
            <ArrowRight size={16} />
          </Button>
        </div>
        <p className="mt-4 text-sm font-semibold text-[var(--text3)]">Cancel anytime. Your cover switches on in 3 days.</p>

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
          <p className="mt-3 text-[var(--text2)]">Whatever goes wrong at home, it&rsquo;s handled.</p>
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
          <p className="mt-3 text-[var(--text2)]">Covered at home and stranded on the road.</p>
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
          Covers the real emergencies life throws at you — see exactly how it works below. We&rsquo;re bringing
          cover to more of Australia every month; just confirm your area when you join.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="container pb-12">
        <Card variant="dark" className="p-6 md:p-8">
          <Badge>No nasty surprises</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Here&rsquo;s exactly what happens when you call.</h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/72">
            No fine print, no games. Three steps, that&rsquo;s it:
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              ["1. You tap “Help now.”", "Any hour, any day. We already know your home and how to get in — so help starts the second you call, not after twenty questions."],
              ["2. We turn up and fix it.", "The burst tap, the dead power, the lockout, the blocked loo — sorted on the spot. The visit, the time it takes, the small bits and pieces: all on us."],
              ["3. Something bigger? You see the price first.", "If it&rsquo;s a major job, you get a clear price before anyone lifts a tool. Say yes, or we make it safe and you decide later. You never pay for work you didn&rsquo;t agree to."]
            ].map(([title, copy]) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="font-black text-white/90">{title}</p>
                <p className="mt-2 text-sm leading-6 text-white/65">{copy}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 rounded-2xl border border-white/10 bg-white/8 p-4 text-sm leading-6 text-white/72">
            It covers the real emergencies life throws at you — well beyond what almost anyone ever needs. There&rsquo;s
            a sensible limit so no one can take the mickey, and that&rsquo;s exactly what keeps it $29 a month, not $99.
          </p>
        </Card>
      </section>

      {/* SAFETY CHECK */}
      <section id="safety-check" className="container pb-12">
        <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
          <Card variant="membership">
            <Badge tone="green">Free with every plan</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">
              Most cover waits for things to break. We catch them first.
            </h2>
            <p className="mt-4 leading-7 text-[var(--text2)]">
              Once a year, a Fixer walks your home and gets it ready for trouble — the kind of once-over that turns a
              future 2 AM disaster into a quiet ten-minute fix today.{" "}
              <strong className="text-[var(--text)]">Worth $149. Yours free.</strong>
            </p>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-[var(--text2)]">
              <strong>On Complete?</strong> You get it twice a year — plus a quick look over the car: battery, tyres,
              and the things that leave you stranded.
            </p>
            <p className="mt-4 text-sm leading-6 text-[var(--text2)]">
              You get it all written up in plain English, a nudge when anything&rsquo;s due, and a short list of what to
              sort first — fix it with any Fixer you like, no pressure.
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
          This once-over is a visual safety check, not a compliance certificate. Anything to do with gas or electrical
          safety is always handled and signed off by a properly licensed tradesperson. Landlords and rentals — that&rsquo;s{" "}
          <Link href="/propertysafe" className="font-bold text-[var(--amber2)] hover:underline">
            PropertySafe
          </Link>
          .
        </p>
      </section>

      {/* COMPARISON TABLE */}
      <section className="container pb-12">
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">What one bad night costs the person who didn&rsquo;t join.</h2>
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
          One bad night can cost more than a whole year of cover. That&rsquo;s the entire point.
        </p>
        <p className="mt-2 text-xs leading-5 text-[var(--text3)]">
          Non-member costs are typical after-hours trade prices and vary by area and trade.
        </p>
      </section>

      {/* WHEN COVER STARTS */}
      <section className="container pb-12">
        <Card variant="emergency">
          <Clock className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-2xl font-black tracking-tight">Your cover switches on in 3 days. Here&rsquo;s why.</h2>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--text2)]">
            Cover kicks in three days after you join — the same rule the big insurers use. It keeps things fair, so
            people join before the emergency, not halfway through one. That&rsquo;s exactly what keeps it $29.
            You can&rsquo;t buy an umbrella once it&rsquo;s already pouring — so the cheapest day to start is today.
          </p>
          <p className="mt-4 max-w-3xl font-bold leading-7 text-[var(--text)]">
            In the middle of one right now? You don&rsquo;t need to join to get help. Get someone out today and pay as
            you go — then join after, so the next one&rsquo;s already covered.
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
            This is for the emergencies. Everything else is still free to post.
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-[var(--text2)]">
            Planning a reno, a new fence, a fresh bathroom? Post it on Fixit247 free, member or not. Fixit Peace is
            just your safety net for when things go wrong — and because we already know your home, every job starts
            quicker.
          </p>
        </Card>
      </section>

      {/* FOUNDING MEMBER */}
      <section className="container pb-12">
        <Card variant="dark" className="p-6 md:p-8">
          <BadgeCheck className="text-[var(--amber)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
            Get in early. Keep $29 for life.
          </h2>
          <p className="mt-3 max-w-2xl leading-7 text-white/72">
            Fixit Peace is brand new, and the people who join now are the reason it&rsquo;ll work. So here&rsquo;s the
            deal: join today and your price stays $29 a month for as long as you&rsquo;re a member — even when it goes
            up for everyone who joins later.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Your price, locked for life", "Cancel anytime", "A direct line to the team building this"].map((item) => (
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
        <h2 className="text-3xl font-black tracking-tight md:text-4xl">The bits you&rsquo;re wondering about.</h2>
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
            Picture the next time something breaks.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl leading-7 text-[var(--text2)]">
            Now picture already knowing it&rsquo;s handled. Join today, and in three days every burst pipe, dead
            battery, and midnight lockout starts with two words: &ldquo;it&rsquo;s covered.&rdquo;
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
