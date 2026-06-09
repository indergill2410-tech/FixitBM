import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Fixer — Get Local Trade Jobs Without Commission",
  description:
    "Join Fixit247 as a verified tradie. Receive emergency, repair, and project leads in your area without giving away commission on completed work.",
  alternates: {
    canonical: "/become-a-fixer"
  }
};

import {
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Hammer,
  Home,
  KeyRound,
  MapPin,
  Paintbrush,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap
} from "lucide-react";
import { Badge, Button, Card, PublicFooter, PublicHeader } from "@/components/ui";
import { tradiePlans } from "@/lib/data";
import { showFixerRecruitmentUi, showFixerSubscriptionUi } from "@/lib/featureFlags";

const signupHref = "/register/fixer";

const benefits = [
  {
    icon: BriefcaseBusiness,
    title: "More Job Opportunities",
    copy: "Get access to repair, maintenance, and property service opportunities as Fixit 247 continues expanding its customer and agency network."
  },
  {
    icon: Building2,
    title: "Agency & Property Work",
    copy: "Position your business for real estate agency maintenance jobs, rental repairs, landlord requests, property manager work, and ongoing property care."
  },
  {
    icon: Zap,
    title: "Emergency & Planned Jobs",
    copy: "Receive opportunities across urgent callouts, after-hours repairs, scheduled maintenance, end-of-lease repairs, and larger planned works."
  },
  {
    icon: BadgeCheck,
    title: "Grow Your Trade Business",
    copy: "Build visibility, increase job flow, and become part of a trusted network designed to support reliable trades."
  }
];

const fixerCategories = [
  "Plumbers",
  "Electricians",
  "Locksmiths",
  "Handymen",
  "Painters",
  "Carpenters",
  "Roof and gutter repairers",
  "Heating and cooling technicians",
  "Gardeners and landscapers",
  "Cleaners and end-of-lease repair teams",
  "General property maintenance providers"
];

const workTypes = [
  "Emergency repairs",
  "Planned maintenance",
  "Rental property repairs",
  "End-of-lease repairs",
  "Pre-lease maintenance",
  "Property upgrades",
  "Small handyman jobs",
  "Larger renovation and improvement work",
  "Real estate agency maintenance requests",
  "Landlord and homeowner jobs",
  "Partnership and contract-based work"
];

const steps = [
  "Create your Fixer account",
  "Complete your Fixer profile in the dashboard",
  "Add your trade, service areas, availability, ABN, licence details, and insurance status",
  "Our team reviews your profile",
  "Approved Fixers can receive suitable job opportunities from homeowners, landlords, property managers, real estate agencies, and partnership channels",
  "Manage your profile, job readiness, and future opportunities from your Fixer dashboard"
];

export default function BecomeAFixerPage() {
  if (showFixerSubscriptionUi || !showFixerRecruitmentUi) {
    return <SubscriptionBecomeAFixerPage />;
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid gap-10 py-12 lg:grid-cols-[1fr_.42fr] lg:items-center lg:py-16">
        <div>
          <Badge tone="green">Fixer recruitment</Badge>
          <h1 className="mt-5 max-w-4xl text-[40px] font-black leading-tight tracking-tight md:text-[62px]">
            Become a Fixer with Fixit 247
          </h1>
          <p className="mt-5 max-w-3xl text-xl font-black leading-8 text-[var(--text)]">
            We&apos;re expanding our trusted Fixer network to meet growing demand for emergency repairs, planned
            maintenance, agency work, property jobs, and contract opportunities.
          </p>
          <p className="mt-5 max-w-3xl text-base leading-8 text-[var(--text2)] md:text-lg">
            Fixit 247 connects trusted trades and service providers with job opportunities from homeowners, landlords,
            property managers, real estate agencies, and business partnerships. We are onboarding more reliable Fixers to
            help us deliver fast, professional support across emergency repairs, planned maintenance, rental property
            jobs, end-of-lease repairs, and property improvement work.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href={signupHref} className="min-h-12 px-6">
              Create Your Fixer Account
              <BriefcaseBusiness size={17} />
            </Button>
            <Button href="#how-it-works" variant="ghost" className="min-h-12 px-6">
              See How It Works
            </Button>
          </div>
          <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-[var(--text2)]">
            Join the Fixit 247 Fixer network and position your trade business for more job opportunities, agency work,
            and ongoing property maintenance demand.
          </p>
        </div>
        <Card variant="dark" className="p-6">
          <ShieldCheck className="text-[var(--amber)]" size={30} />
          <h2 className="mt-5 text-2xl font-black">Trusted trade network</h2>
          <div className="mt-5 grid gap-3">
            {[
              ["Emergency coverage", PhoneCall],
              ["Agency maintenance", Building2],
              ["Rental repairs", Home],
              ["Planned works", CalendarCheck]
            ].map(([label, Icon]) => (
              <div key={label as string} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 p-3">
                <Icon className="text-[var(--amber)]" size={17} />
                <span className="text-sm font-black text-white/85">{label as string}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="container pb-12">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {benefits.map(({ icon: Icon, title, copy }) => (
            <Card key={title}>
              <Icon className="text-[var(--amber2)]" size={24} />
              <h2 className="mt-4 text-xl font-black">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container grid gap-6 pb-12 lg:grid-cols-[.44fr_1fr]">
        <div>
          <Badge tone="blue">Who we&apos;re looking for</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">We&apos;re Hiring and Onboarding More Trusted Fixers</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Fixit 247 is looking for reliable, professional, and responsive trades who want more job opportunities and
            long-term partnership potential.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {fixerCategories.map((category, index) => (
            <IconRow key={category} icon={[Wrench, Zap, KeyRound, Hammer, Paintbrush, BriefcaseBusiness][index % 6]} label={category} />
          ))}
        </div>
      </section>

      <section className="container grid gap-6 pb-12 lg:grid-cols-[1fr_.4fr]">
        <Card>
          <Badge tone="green">What Fixers can help with</Badge>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {workTypes.map((type) => (
              <div key={type} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3">
                <CheckCircle2 className="shrink-0 text-[var(--green)]" size={17} />
                <span className="text-sm font-bold text-[var(--text2)]">{type}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card variant="membership">
          <MapPin className="text-[var(--amber2)]" size={26} />
          <h2 className="mt-4 text-2xl font-black">Local work, broader channels.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            Fixers can support homeowners, landlords, managed properties, and partner channels from one professional
            profile.
          </p>
        </Card>
      </section>

      <section id="how-it-works" className="container pb-12">
        <Card variant="dark" className="p-6 md:p-8">
          <Badge>How it works</Badge>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--amber)] text-sm font-black text-[var(--text)]">
                  {index + 1}
                </span>
                <p className="mt-4 text-sm font-black leading-6 text-white/85">{step}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="container grid gap-6 pb-12 lg:grid-cols-[.8fr_.32fr] lg:items-stretch">
        <Card>
          <Badge tone="green">Growing demand</Badge>
          <p className="mt-5 text-xl font-black leading-8 md:text-2xl">
            Fixit 247 is growing its network of trusted Fixers to support increasing demand across emergency repairs,
            planned maintenance, rental property work, agency partnerships, and property service contracts.
          </p>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            We are looking for reliable trades who want to grow their business, improve job flow, and become part of a
            professional property maintenance network.
          </p>
        </Card>
        <Card variant="membership">
          <ClipboardCheck className="text-[var(--amber2)]" size={28} />
          <h2 className="mt-4 text-xl font-black">Profile review matters.</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Complete your dashboard profile so the team can review service fit, readiness, and work preferences.
          </p>
        </Card>
      </section>

      <section className="container pb-16">
        <Card variant="dark" className="p-7 text-center md:p-10">
          <Sparkles className="mx-auto text-[var(--amber)]" size={30} />
          <h2 className="mt-5 text-3xl font-black tracking-tight md:text-4xl">Ready to Grow Your Trade Business?</h2>
          <p className="mx-auto mt-4 max-w-3xl leading-7 text-white/72">
            Create your Fixer account today and join the trusted network helping Fixit 247 support homeowners, landlords,
            property managers, and real estate agencies with emergency repairs, planned maintenance, and property service
            work.
          </p>
          <Button href={signupHref} className="mt-7 min-h-12 px-6">
            Create Your Fixer Account
          </Button>
        </Card>
      </section>
      <PublicFooter />
    </main>
  );
}

function IconRow({ icon: Icon, label }: { icon: typeof Wrench; label: string }) {
  return (
    <div className="flex min-h-16 items-center gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-[var(--shadow)]">
      <Icon className="shrink-0 text-[var(--amber2)]" size={20} />
      <span className="text-sm font-black">{label}</span>
    </div>
  );
}

function SubscriptionBecomeAFixerPage() {
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
