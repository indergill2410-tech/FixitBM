import type { Metadata } from "next";
import { ArrowRight, Building2, ClipboardCheck, Home, ShieldCheck, Users, Wrench } from "lucide-react";
import { Badge, Button, Card, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "PropertySafe | Property records for owners, landlords, and agencies",
  description:
    "PropertySafe helps homeowners, landlords, property managers, and real estate agencies keep clearer repair records, Safety Check history, and next fixes for every property.",
  alternates: { canonical: "/propertysafe" },
  openGraph: {
    title: "PropertySafe for owners, landlords, and property teams",
    description: "Clear repair records, real Safety Check history, and calmer maintenance follow-up for owned and managed properties.",
    url: `${appUrl}/propertysafe`,
    type: "website"
  }
};

const agencyBenefits = [
  {
    icon: Home,
    title: "Owner confidence",
    copy: "Homeowners and landlords can see real checks, recommended fixes, and repair history for the property they own."
  },
  {
    icon: Users,
    title: "Agency clarity",
    copy: "Property managers can keep tenant issues, maintenance requests, and owner updates connected to one property record."
  },
  {
    icon: Wrench,
    title: "Better Fixer briefs",
    copy: "Send clearer repair context so Fixers can respond with fewer back-and-forth questions."
  },
  {
    icon: ShieldCheck,
    title: "Safer visibility",
    copy: "Owners only see records they are allowed to see. Agencies keep control of managed workflows and access."
  }
];

const workflow = [
  ["Create the property record", "A home, rental, or investment property gets its own PropertySafe view."],
  ["Attach real checks", "Completed Safety & Readiness Checks and request activity become useful property history."],
  ["Share the right access", "Owners, landlords, and agency teams see only the records linked to their property role."],
  ["Turn findings into action", "Recommended fixes can become clearer requests or quote-ready follow-up work."]
];

export default function PropertySafePage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container grid gap-10 py-14 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <div>
          <Badge>PropertySafe for owners and agencies</Badge>
          <h1 className="mt-5 max-w-4xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
            Less chasing. Clearer repairs. A better record for every property.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
            PropertySafe helps homeowners, landlords, property managers, and real estate agencies turn tenant issues,
            maintenance requests, Safety Check history, and recommended fixes into one clearer property record.
          </p>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[var(--amber2)]">
            Owners see the record. Agencies manage the workflow. Fixers get the context.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact">
              Book an agency walkthrough
              <ArrowRight size={17} />
            </Button>
            <Button href="/fixit-plus" variant="ghost">
              Protect my property
            </Button>
          </div>
        </div>
        <Card variant="dark">
          <Building2 className="text-[var(--amber)]" />
          <Badge className="mt-4">Shared access</Badge>
          <h2 className="mt-4 text-2xl font-black">Agency managed. Owner visible. Permission controlled.</h2>
          <p className="mt-3 leading-7 text-white/70">
            Emergency repairs and maintenance still move through Fixit247 requests. PropertySafe keeps the useful
            record around them, then lets the right owner or agency user view the right property history.
          </p>
        </Card>
      </section>

      <section className="container grid gap-4 py-8 md:grid-cols-4">
        {agencyBenefits.map((item) => (
          <Card key={item.title}>
            <item.icon className="text-[var(--amber2)]" />
            <h2 className="mt-4 text-lg font-black">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{item.copy}</p>
          </Card>
        ))}
      </section>

      <section className="container grid gap-6 py-12 lg:grid-cols-[.82fr_1.18fr]">
        <Card variant="membership">
          <Home className="text-[var(--amber2)]" />
          <Badge className="mt-4">For owned and managed property</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Designed for the moment a tenant, owner, or manager needs clarity.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            A tenant needs help. An owner wants to protect an investment. A manager needs a clean next step. A Fixer needs
            the right brief. PropertySafe connects those moving parts without turning the record into a public free-for-all.
          </p>
          <Button href="/contact" className="mt-6">Plan agency onboarding</Button>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          {workflow.map(([title, copy], index) => (
            <Card key={title}>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--amber-dim)] text-sm font-black text-[var(--amber2)]">
                {index + 1}
              </span>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container grid gap-6 py-12 lg:grid-cols-3">
        <Card>
          <ClipboardCheck className="text-[var(--green)]" />
          <h2 className="mt-4 text-xl font-black">Real check history</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            PropertySafe is built from completed Safety & Readiness Checks. If a check has not happened, it does not
            pretend one has.
          </p>
        </Card>
        <Card>
          <Wrench className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-xl font-black">Next fixes made visible</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Visible issues and maintenance recommendations can become quote-ready requests when your team is ready to act.
          </p>
        </Card>
        <Card>
          <Building2 className="text-[var(--blue)]" />
          <h2 className="mt-4 text-xl font-black">Owner and agency setup</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Start with a walkthrough so property permissions, owner visibility, agency contacts, and maintenance rules are handled properly.
          </p>
        </Card>
      </section>

      <section className="container py-12">
        <Card variant="dark" className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge>PropertySafe</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Give every property a calm, shared repair record.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/70">
              Built for homeowners, landlords, agencies managing rentals, and property teams that need urgent response
              without losing the long-term maintenance story.
            </p>
          </div>
          <Button href="/contact">Book a walkthrough</Button>
        </Card>
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
