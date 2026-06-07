import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, Clock3, Home, LineChart, ShieldCheck, Users } from "lucide-react";
import { PropertySafeOnboardingForm } from "@/components/propertysafe/onboarding-form";
import { Badge, Button, Card, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Book a PropertySafe agency walkthrough | Fixit247",
  description:
    "Book a PropertySafe walkthrough for real estate agencies, property managers, landlords, and owners who want clearer maintenance records and owner visibility.",
  alternates: { canonical: "/propertysafe/onboarding" },
  openGraph: {
    title: "PropertySafe agency walkthrough",
    description: "A calm onboarding path for rental maintenance, owner visibility, Safety Check history, and repair records.",
    url: `${appUrl}/propertysafe/onboarding`,
    type: "website"
  }
};

const outcomes = [
  ["Fewer loose calls", "Tenant issues become structured requests with location, priority, notes, and follow-up context."],
  ["Cleaner owner updates", "Owners can see the right property record without taking over the agency workflow."],
  ["Useful repair memory", "Completed Safety Checks, recommendations, and urgent requests stay tied to the property."],
  ["Better Fixer briefs", "Fixers receive clearer information before quoting, attending, or requesting more detail."]
];

const graphBars = [
  ["Tenant calls", "Before", 88],
  ["Owner follow-up", "Before", 74],
  ["Missing history", "Before", 66],
  ["Clear records", "After", 92],
  ["Actionable next steps", "After", 84],
  ["Owner confidence", "After", 78]
];

const onboardingSteps = [
  ["Map the portfolio", "We identify agency users, owners, property groups, and the first properties to bring into PropertySafe."],
  ["Set access rules", "Owner visibility, manager control, and team permissions are prepared before records are shared."],
  ["Connect requests", "Urgent maintenance and routine repair requests keep moving through Fixit247 while records build behind them."],
  ["Review next fixes", "Safety Check findings and repair recommendations become clearer follow-up work, not scattered notes."]
];

export default function PropertySafeOnboardingPage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container grid gap-10 py-14 lg:grid-cols-[.95fr_.8fr] lg:items-center">
        <div>
          <Badge>PropertySafe agency onboarding</Badge>
          <h1 className="mt-5 max-w-4xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
            Give every managed property a calmer maintenance record.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
            A focused walkthrough for property managers, agency principals, landlords, and owners who want urgent tenant
            issues, Safety Check history, repair notes, and owner visibility handled with less chasing.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Agency controlled", "Owner visible", "Request connected"].map((item) => (
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
          <Badge className="mt-4">Tomorrow-ready path</Badge>
          <h2 className="mt-4 text-2xl font-black">Start with one agency, one workflow, and a clean record model.</h2>
          <p className="mt-3 leading-7 text-white/70">
            PropertySafe does not replace your maintenance process. It gives each property a memory so owners, managers,
            support, and Fixers can see the right context at the right time.
          </p>
        </Card>
      </section>

      <section className="container grid gap-6 py-10 lg:grid-cols-[.8fr_1.2fr]">
        <Card variant="membership">
          <LineChart className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight">What the walkthrough clarifies.</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            We look at where maintenance gets messy today, then prepare a practical PropertySafe rollout that protects
            agency control while giving owners clearer confidence.
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
          <Badge>Portfolio clarity model</Badge>
          <h2 className="mt-4 text-2xl font-black">From scattered maintenance to visible next steps.</h2>
          <div className="mt-6 grid gap-4">
            {graphBars.map(([label, phase, value]) => (
              <div key={`${label}-${phase}`}>
                <div className="flex items-center justify-between gap-3 text-sm font-black">
                  <span>{label}</span>
                  <span className={phase === "After" ? "text-[var(--green)]" : "text-[var(--text3)]"}>{phase}</span>
                </div>
                <div className="mt-2 h-3 overflow-hidden rounded-full bg-[var(--bg2)]">
                  <div
                    className={phase === "After" ? "h-full rounded-full bg-[var(--green)]" : "h-full rounded-full bg-[var(--amber)]"}
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-[var(--text3)]">
            Illustrative onboarding model. Real setup is based on your portfolio and access rules.
          </p>
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
            <h2 className="mt-4 text-3xl font-black tracking-tight">A useful walkthrough is specific, not sales-heavy.</h2>
            <p className="mt-4 leading-7 text-white/70">
              Share the portfolio size, main friction point, and the kind of owner visibility you want. Fixit247 can then
              prepare the cleanest onboarding path instead of asking you to explain everything twice.
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
