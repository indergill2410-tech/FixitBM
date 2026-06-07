import type { Metadata } from "next";
import { ArrowRight, Building2, CheckCircle2, ClipboardCheck, FileClock, Home, ShieldCheck, Users, Wrench } from "lucide-react";
import { Badge, Button, Card, MobileBottomActionBar, PublicHeader } from "@/components/ui";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "PropertySafe | Property maintenance support for managers and agencies",
  description:
    "PropertySafe helps property managers and real estate agencies structure urgent repairs, maintenance requests, Safety Check history, and recommended fixes across managed properties.",
  alternates: { canonical: "/propertysafe" },
  openGraph: {
    title: "PropertySafe for property managers and real estate agencies",
    description: "A calmer maintenance and readiness layer for rentals, agencies, and managed portfolios.",
    url: `${appUrl}/propertysafe`,
    type: "website"
  }
};

const agencyBenefits = [
  {
    icon: Users,
    title: "Tenant issue triage",
    copy: "Urgent leaks, lockouts, faults, storm issues, and maintenance requests can start through one guided path."
  },
  {
    icon: FileClock,
    title: "Property history",
    copy: "Completed Safety Checks, recommendations, and request activity can build a clearer record for each property."
  },
  {
    icon: Wrench,
    title: "Quote-ready maintenance",
    copy: "Routine repairs and larger work can be prepared with location, photos, priority, and trade context."
  },
  {
    icon: ShieldCheck,
    title: "Portfolio readiness",
    copy: "PropertySafe helps agencies see what needs attention before repeat emergencies become expensive."
  }
];

const workflow = [
  ["Map the property", "Saved property details give each request a clean starting point."],
  ["Start the right request", "Emergency, routine maintenance, or larger project work is captured through the same calm flow."],
  ["Build the record", "Completed Safety Checks and recommended fixes become PropertySafe history for that property."],
  ["Act on next steps", "Agencies can review recommended fixes, quote opportunities, and request status with less guesswork."]
];

export default function PropertySafePage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container grid gap-10 py-14 lg:grid-cols-[1fr_.9fr] lg:items-center">
        <div>
          <Badge>PropertySafe for agencies</Badge>
          <h1 className="mt-5 max-w-4xl text-[40px] font-black leading-tight tracking-tight md:text-[58px]">
            One calm maintenance layer for rentals, agencies, and managed properties.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
            PropertySafe gives property managers and real estate agencies a clearer way to handle urgent tenant issues,
            routine maintenance, Safety Check history, and recommended fixes across the properties they manage.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/contact">
              Talk to PropertySafe onboarding
              <ArrowRight size={17} />
            </Button>
            <Button href="/post-job" variant="ghost">
              Start a maintenance request
            </Button>
          </div>
        </div>
        <Card variant="dark">
          <Building2 className="text-[var(--amber)]" />
          <Badge className="mt-4">Business logic</Badge>
          <h2 className="mt-4 text-2xl font-black">PropertySafe does not replace requests. It connects them.</h2>
          <p className="mt-3 leading-7 text-white/70">
            Emergency and maintenance work still runs through Fixit247 requests. PropertySafe sits above that as the
            property record: saved details, completed checks, recommendations, and follow-up work.
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
          <Badge className="mt-4">For managed portfolios</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Useful for property managers before, during, and after repairs.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            A single repair can be handled as a request. A managed property needs memory. PropertySafe is designed to
            make recurring maintenance, Safety Check outcomes, and recommended next steps easier to track property by
            property.
          </p>
          <Button href="/contact" className="mt-6">Discuss agency onboarding</Button>
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
          <h2 className="mt-4 text-xl font-black">Safety Check history</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            PropertySafe is built from real completed Safety & Readiness Checks. No fake scores, no placeholder reports.
          </p>
        </Card>
        <Card>
          <Wrench className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-xl font-black">Recommended fixes</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Visible issues and maintenance recommendations can become quote-ready requests when the agency is ready to act.
          </p>
        </Card>
        <Card>
          <Building2 className="text-[var(--blue)]" />
          <h2 className="mt-4 text-xl font-black">Agency onboarding</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Start with a conversation so property permissions, contact paths, and maintenance rules are set up cleanly.
          </p>
        </Card>
      </section>

      <section className="container py-12">
        <Card variant="dark" className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge>PropertySafe</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Give every property a clearer maintenance memory.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/70">
              Ideal for agencies managing rentals, landlords with multiple homes, and property teams that need urgent
              response plus better long-term records.
            </p>
          </div>
          <Button href="/contact">Talk to onboarding</Button>
        </Card>
      </section>
      <MobileBottomActionBar />
    </main>
  );
}
