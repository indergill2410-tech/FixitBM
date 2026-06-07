import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, Clock3, FileText, Home, KeyRound, ShieldCheck, Users } from "lucide-react";
import { PropertySafeOnboardingForm } from "@/components/propertysafe/onboarding-form";
import { Badge, Button, Card, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Book a PropertySafe agency walkthrough | Fixit247",
  description:
    "Book a PropertySafe walkthrough for real estate agencies, property managers, landlords, and owners who want clearer tenant maintenance, owner-visible records, and controlled property access.",
  alternates: { canonical: "/propertysafe/onboarding" },
  openGraph: {
    title: "PropertySafe agency walkthrough",
    description: "A practical onboarding path for rental maintenance, owner confidence, Safety Check history, and controlled property records.",
    url: `${appUrl}/propertysafe/onboarding`,
    type: "website"
  }
};

const outcomes = [
  ["Fewer follow-up loops", "Tenant issues become structured requests with priority, photos, location, and the next action in one place."],
  ["Owner-ready evidence", "Owners see the useful record when the agency chooses, without taking over the workflow."],
  ["Compliance-ready history", "Safety Check notes, repair actions, access context, and follow-up recommendations stay organised where rental obligations apply."],
  ["Cleaner staff handover", "Repair history, Safety Checks, access notes, and recommendations stay attached to the property."],
  ["Better Fixer attendance", "Fixers receive clearer briefs before quoting, visiting, or requesting more detail."]
];

const marketSignals = [
  {
    value: "30.6%",
    label: "of occupied Australian dwellings were rented in the 2021 Census.",
    source: "ABS Census 2021",
    href: "https://www.abs.gov.au/statistics/people/housing/housing-census/2021"
  },
  {
    value: "Urgent",
    label: "repairs need fast notification, clear responsibility, and a reliable record of what happened.",
    source: "NSW Fair Trading",
    href: "https://www.nsw.gov.au/housing-and-construction/rules/urgent-repairs-residential-rental-properties"
  },
  {
    value: "Handover",
    label: "pressure makes clean property records more valuable when staff, owners, or repair partners change.",
    source: "Macquarie Real Estate Benchmarking 2023",
    href: "https://www.macquarie.com.au/assets/bfs/documents/business-banking/bb-real-estate-industry/macquarie-bank-real-estate-benchmarking-report-2023.pdf"
  }
];

const operatingModel = [
  ["Before", "Tenant calls, owner approvals, quote notes, and repair history sit across inboxes, phones, and memory."],
  ["PropertySafe", "The request still moves through Fixit247, while the useful record stays tied to the property."],
  ["After", "Owners get confidence, managers keep control, and Fixers see better context before work starts."]
];

const onboardingSteps = [
  ["Choose the pilot", "Start with a small group of managed properties where maintenance and owner updates already create friction."],
  ["Set permission logic", "Decide what agency users, owners, landlords, and support can see before anything is shared."],
  ["Connect the request path", "Urgent maintenance and routine repair requests keep moving while the property record builds behind them."],
  ["Prepare the owner story", "Turn completed checks, recommendations, and follow-up work into a calmer update for owners."]
];

export default function PropertySafeOnboardingPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container grid gap-10 py-14 lg:grid-cols-[.95fr_.8fr] lg:items-center">
        <div>
          <Badge>PropertySafe for agencies</Badge>
          <h1 className="mt-5 max-w-4xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
            Turn maintenance pressure into owner confidence.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
            A practical walkthrough for agencies managing rentals: capture tenant issues cleanly, keep owners informed,
            and keep safety, repair, and follow-up evidence in a property record your team controls.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Agency controlled", "Owner confidence", "Tomorrow-ready pilot"].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-3 text-sm font-black shadow-[var(--shadow)]">
                <ShieldCheck size={16} className="text-[var(--green)]" />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="#walkthrough">
              Book the walkthrough
              <ArrowRight size={17} />
            </Button>
            <Button href="/register/customer?intent=agency" variant="ghost">
              Create agency account
            </Button>
          </div>
        </div>
        <Card variant="dark">
          <Building2 className="text-[var(--amber)]" />
          <Badge className="mt-4">Business case</Badge>
          <h2 className="mt-4 text-2xl font-black">Every repair is either a chase, or a record.</h2>
          <p className="mt-3 leading-7 text-white/70">
            PropertySafe keeps requests moving while the useful facts stay attached to the property: what happened, who
            can see it, what was checked, and what should happen next.
          </p>
        </Card>
      </section>

      <section className="container grid gap-6 py-10 lg:grid-cols-[.8fr_1.2fr]">
        <Card variant="membership">
          <FileText className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight">Property managers need fewer loose threads, not another inbox.</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            The opportunity is not a prettier maintenance form. It is a controlled record that supports owner confidence,
            staff handover, rental safety evidence, urgent triage, and quote-ready next steps.
          </p>
          <div className="mt-5 grid gap-3">
            {outcomes.map(([title, copy]) => (
              <div key={title} className="rounded-xl border border-[var(--border)] bg-white p-4">
                <p className="font-black">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text2)]">{copy}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Badge>Source-backed signals</Badge>
          <h2 className="mt-4 text-2xl font-black">Why agencies should make the record visible now.</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {marketSignals.map((signal) => (
              <div key={signal.value} className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
                <p className="text-3xl font-black tracking-tight text-[var(--amber2)]">{signal.value}</p>
                <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{signal.label}</p>
                <a
                  className="mt-4 inline-flex text-xs font-black uppercase tracking-wide text-[var(--text3)] hover:text-[var(--amber2)]"
                  href={signal.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {signal.source}
                </a>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="container py-10">
        <Card variant="dark">
          <div className="grid gap-6 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
            <div>
              <KeyRound className="text-[var(--amber)]" />
              <Badge className="mt-4">Operating model</Badge>
              <h2 className="mt-4 text-3xl font-black tracking-tight">Requests move. Records remain. Access stays controlled.</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {operatingModel.map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <p className="text-sm font-black uppercase tracking-wide text-[var(--amber)]">{title}</p>
                  <p className="mt-3 text-sm leading-6 text-white/72">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="container grid gap-4 py-10 md:grid-cols-4">
        {onboardingSteps.map(([title, copy], index) => (
          <Card key={title}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--amber-dim)] text-sm font-black text-[var(--amber2)]">
              {index + 1}
            </span>
            <h2 className="mt-5 text-lg font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{copy}</p>
          </Card>
        ))}
      </section>

      <section id="walkthrough" className="container grid gap-8 py-12 lg:grid-cols-[.86fr_1fr] lg:items-start">
        <div className="grid gap-5">
          <Card variant="dark">
            <Badge>Best first call</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Bring one real property. Leave with the first rollout shape.</h2>
            <p className="mt-4 leading-7 text-white/70">
              Share the portfolio size, your most common maintenance friction, and how owners should be updated.
              Fixit247 can then prepare the first agency workspace around real access rules, not generic promises.
            </p>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              [Users, "Agency teams", "Principals, managers, ops, and support users."],
              [Home, "Owners", "Controlled access to the right property record."],
              [Clock3, "Follow-up", "Maintenance requests and next fixes kept visible."]
            ].map(([Icon, title, copy]) => (
              <Card key={String(title)}>
                <Icon className="text-[var(--amber2)]" />
                <h3 className="mt-4 font-black">{String(title)}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{String(copy)}</p>
              </Card>
            ))}
          </div>
          <Card>
            <CheckCircle2 className="text-[var(--green)]" />
            <h2 className="mt-4 text-xl font-black">Want the workspace ready first?</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Create an agency account now, then request the walkthrough with the same email so onboarding can connect the
              conversation to your account.
            </p>
            <Button href="/register/customer?intent=agency" variant="ghost" className="mt-5">
              Create agency account
            </Button>
          </Card>
        </div>
        <PropertySafeOnboardingForm />
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
