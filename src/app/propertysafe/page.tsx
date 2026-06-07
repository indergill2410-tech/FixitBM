import type { Metadata } from "next";
import { ArrowRight, Building2, ClipboardCheck, Home, ShieldCheck, Users, Wrench } from "lucide-react";
import { Badge, Button, Card, MobileBottomActionBar, PublicFooter, PublicHeader } from "@/components/ui";
import { appUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "PropertySafe | Property records for owners, landlords, and agencies",
  description:
    "PropertySafe helps homeowners, landlords, property managers, and real estate agencies keep clearer maintenance records, Safety Check history, repair notes, and next fixes for every property.",
  alternates: { canonical: "/propertysafe" },
  openGraph: {
    title: "PropertySafe for owners, landlords, and property teams",
    description: "Clearer maintenance records for owned and managed properties.",
    url: `${appUrl}/propertysafe`,
    type: "website"
  }
};

const agencyBenefits = [
  {
    icon: Home,
    title: "Protect trust",
    copy: "Keep real checks, recommended fixes, and repair history organised before questions become repeated follow-ups."
  },
  {
    icon: ClipboardCheck,
    title: "Manage compliance-ready records",
    copy: "Keep Safety Check history, repair notes, approval context, and follow-up evidence together where rental safety and maintenance obligations apply."
  },
  {
    icon: Users,
    title: "Give managers a cleaner handover",
    copy: "Property managers keep tenant issues, maintenance requests, approval notes, and repair history connected to the same property record."
  },
  {
    icon: Wrench,
    title: "Help Fixers quote faster",
    copy: "Better repair context means fewer back-and-forth questions before quoting, visiting, or asking for more detail."
  },
  {
    icon: ShieldCheck,
    title: "Share with care",
    copy: "Agencies choose when a record is ready, who should see it, and which property it belongs to."
  }
];

const workflow = [
  ["Create the property record", "A home, rental, or investment property gets its own PropertySafe view."],
  ["Attach real checks", "Completed Safety & Readiness Checks and request activity become useful property history."],
  ["Share with the right people", "Owners, landlords, and agency teams see the property history prepared for their role."],
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
            Less follow-up. More confidence. One useful record for every property.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--text2)]">
            PropertySafe helps homeowners, landlords, property managers, and real estate agencies manage their property
            portfolio by turning urgent repairs, tenant maintenance, Safety Check history, and recommended fixes into a
            clear property record.
          </p>
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-[var(--amber2)]">
            Agencies manage the work. Check records stay organised. Fixers get the context.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/propertysafe/onboarding">
              Book an agency walkthrough
              <ArrowRight size={17} />
            </Button>
            <Button href="/agency/login" variant="ghost">
              Agency sign in
            </Button>
            <Button href="/fixit-plus" variant="ghost">
              Protect my property
            </Button>
          </div>
        </div>
        <Card variant="dark">
          <Building2 className="text-[var(--amber)]" />
          <Badge className="mt-4">Careful sharing</Badge>
          <h2 className="mt-4 text-2xl font-black">Requests move. Records remain. Sharing stays deliberate.</h2>
          <p className="mt-3 leading-7 text-white/70">
            Emergency repairs and maintenance still move through Fixit247 requests. PropertySafe keeps the useful record
            around them, then helps the right person see the right property history when it is ready.
          </p>
        </Card>
      </section>

      <section className="container grid gap-4 py-8 md:grid-cols-5">
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
          <h2 className="mt-4 text-3xl font-black tracking-tight">Built for the moment a tenant, owner, or manager needs a clear next step.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            A tenant needs help. An owner wants confidence. A manager needs a clean next step. A Fixer needs the right
            brief. PropertySafe connects those moving parts without opening private records broadly.
          </p>
          <Button href="/propertysafe/onboarding" className="mt-6">Plan agency onboarding</Button>
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
            PropertySafe is built from completed Safety & Readiness Checks and repair activity. It helps agencies manage
            compliance-ready check records without pretending to replace specialist certificates or statutory inspections.
          </p>
        </Card>
        <Card>
          <Wrench className="text-[var(--amber2)]" />
          <h2 className="mt-4 text-xl font-black">Next fixes made clear</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Visible concerns and maintenance recommendations can become quote-ready requests when your team is ready to act.
          </p>
        </Card>
        <Card>
          <Building2 className="text-[var(--blue)]" />
          <h2 className="mt-4 text-xl font-black">Sharing and agency setup</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
            Start with a walkthrough so property sharing, agency contacts, and maintenance preferences are handled properly.
          </p>
        </Card>
      </section>

      <section className="container py-12">
        <Card variant="dark" className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Badge>PropertySafe</Badge>
            <h2 className="mt-4 text-3xl font-black tracking-tight">Give every property a calm repair record.</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/70">
              Built for homeowners, landlords, agencies managing rentals, and property teams that need urgent response
              without losing the long-term maintenance story.
            </p>
          </div>
          <Button href="/propertysafe/onboarding">Book a walkthrough</Button>
        </Card>
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
