import Link from "next/link";
import { ArrowRight, Building2, CheckCircle2, Hammer, Home, MapPin, ShieldCheck, Zap } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { TrackedCTA } from "@/components/customer-dashboard";
import { HeroLanes } from "@/components/hero-lanes";
import { Badge, Button, Card, IconTile, MobileBottomActionBar, PublicFooter, PublicHeader, TrustStrip } from "@/components/ui";
import { homeCategories, roadsideCategories, tradeCategories } from "@/lib/data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

// Deep-links a homepage category tile into the request wizard with the lane
// and category preselected, so a tap lands on the details step ready to go.
function requestHref(lane: string, category: string) {
  return `/post-job?lane=${lane}&category=${encodeURIComponent(category)}`;
}

export default function HomePage() {
  // Resolved against the source lists so a renamed or removed label in
  // lib/data.ts drops the tile instead of crashing the homepage.
  const urgentRequestCategories = [
    { label: "Burst pipe", lane: "emergency_home" },
    { label: "Electrical fault", lane: "emergency_home" },
    { label: "Lockout", lane: "emergency_home" },
    { label: "Flat tyre", lane: "emergency_road" },
    { label: "Battery", lane: "emergency_road" },
    { label: "Fuel emergency", lane: "emergency_road" }
  ]
    .map(({ label, lane }) => {
      const list = lane === "emergency_home" ? homeCategories : roadsideCategories;
      const match = list.find((item) => item.label === label);
      return match ? { ...match, lane } : null;
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const plannedRequestCategories = ["Plumbing", "Roofing", "Painting", "Carpentry", "Landscaping", "Concreting"]
    .map((label) => tradeCategories.find((item) => item.label === label))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]) }}
      />
      <section className="container grid min-h-[calc(100vh-64px)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Badge>24/7 · Verified Fixers across Australia</Badge>
          <h1 className="mt-5 max-w-3xl text-[42px] font-black leading-[1.04] tracking-tight md:text-[64px]">
            From a leaky tap to full home renovations.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text2)] md:text-lg">
            Our verified, licensed Fixers can do the lot — emergency repairs, roadside help, and planned trade work.
            Homeowners, renters, landlords, and property managers across Australia start here. Post it free in about a
            minute.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <TrackedCTA
              cta={{ label: "Get help now — it's free", href: "/post-job", event: "hero_get_help" }}
              className="min-h-13 px-7 text-base"
            />
            <TrackedCTA
              cta={{ label: "Cover my home from $29/mo", href: "/fixit-peace", event: "hero_join_peace" }}
              variant="ghost"
            />
          </div>
          <p className="mt-4 text-sm font-semibold text-[var(--text2)]">
            No account · No call centre queue · Free to post
          </p>
          <div className="mt-8">
            <TrustStrip />
          </div>
        </div>
        <Card variant="elevated" className="relative overflow-hidden p-4 md:p-6">
          <HeroLanes />
        </Card>
      </section>

      <section className="container py-12">
        <Card variant="dark" className="overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
            <div>
              <ShieldCheck className="text-[var(--amber)]" />
              <Badge className="mt-4">Trust &amp; safety</Badge>
              <h2 className="mt-4 max-w-xl text-3xl font-black tracking-tight md:text-4xl">
                You&apos;re opening your door to someone. We take that seriously.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-white/72">
                Every Fixer on Fixit247 goes through verification before work is dispatched to them — the same network
                that performs rental safety inspections to minimum standards.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["ABN-checked businesses", "Real, registered businesses — not anonymous gig profiles."],
                ["Licence on file for licensed trades", "Gas, electrical, and other licensed work requires the licence before it can be assigned."],
                ["Insurance declared & documented", "Public liability status is captured and reviewed during verification."],
                ["Reviewed after every job", "Real customers rate the work, and strong profiles get matched first."]
              ].map(([title, copy]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/8 p-4">
                  <CheckCircle2 size={18} className="text-[var(--green)]" />
                  <p className="mt-3 font-black text-white/90">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-white/65">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="container py-12">
        <div className="mx-auto max-w-2xl text-center">
          <Badge>How it works</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">From panic to handled, in three steps.</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {([
            ["Tell us what happened", "About a minute, photos optional, no account needed. The calmer version of ringing five numbers from a search page.", Zap],
            ["A verified Fixer responds", "They see your details, location, and photos before they call — so the first conversation is already useful.", ShieldCheck],
            ["Life goes back to normal", "The fix is done, and it stays on your property's record — handy for landlords, insurance, and next time.", Home]
          ] as const).map(([title, copy, Icon], index) => (
            <Card key={String(title)}>
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--amber-dim)] text-sm font-black text-[var(--amber2)]">
                  {index + 1}
                </span>
                <Icon size={20} className="text-[var(--amber2)]" />
              </div>
              <h3 className="mt-5 text-lg font-black">{String(title)}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{String(copy)}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container grid gap-6 py-12 lg:grid-cols-[.9fr_1.1fr]">
        <Card variant="dark">
          <Building2 className="text-[var(--amber)]" />
          <Badge className="mt-4">PropertySafe for agencies</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Agencies manage the repair. Records stay clear.</h2>
          <p className="mt-4 leading-7 text-white/70">
            PropertySafe helps rental teams and property owners move urgent issues and routine maintenance through
            one request path, then keep useful history attached to the right property with careful sharing.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/propertysafe">Explore PropertySafe</Button>
            <Button href="/propertysafe/onboarding">Book a walkthrough</Button>
          </div>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {[
            ["Tenant issues become clearer requests", "Burst pipes, lockouts, faults, leaks, and urgent maintenance start with the details your team needs."],
            ["Property history stays organised", "Investment property checks and next fixes can be prepared for the right person at the right time."],
            ["Fixers get better briefs", "Routine repairs and larger work can be prepared with location, photos, priority, and trade context."],
            ["Next steps are easier to explain", "Maintenance recommendations and quote opportunities become easier to review and act on."]
          ].map(([title, copy]) => (
            <Card key={title}>
              <CheckCircle2 className="text-[var(--green)]" />
              <h3 className="mt-4 font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{copy}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-12">
        <Card variant="membership" className="overflow-hidden p-6 md:p-8">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
            <div>
              <Badge>Fixit Peace</Badge>
              <h2 className="mt-4 max-w-xl text-3xl font-black tracking-tight md:text-4xl">
                The cheapest emergency is the one that never happens.
              </h2>
              <p className="mt-4 max-w-xl leading-7 text-[var(--text2)]">
                Members get their home visually checked every 6 months — so the worn hose, the tired smoke alarm, the
                slow leak get caught while they&apos;re still small. And when something does break, there&apos;s no
                frantic searching: your details are saved, your request gets priority, and help is one calm tap away.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {[
                  "Safety & Readiness Check every 6 months",
                  "Priority access when things break",
                  "Saved home details — no 2am scrambling",
                  "Recommended fixes before they grow"
                ].map((item) => (
                  <p key={item} className="flex items-start gap-2 text-sm font-semibold text-[var(--text2)]">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[var(--green)]" />
                    {item}
                  </p>
                ))}
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <TrackedCTA cta={{ label: "Protect my home — $29/mo", href: "/fixit-peace", event: "peace_section_protect" }} />
                <TrackedCTA cta={{ label: "See what's checked", href: "/fixit-peace#safety-check", event: "peace_section_learn" }} variant="ghost" />
              </div>
            </div>
            <div className="grid gap-4">
              <Link href="/fixit-peace" className="focus-ring rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-[var(--shadow-md)]">
                <div className="flex items-start justify-between gap-3">
                  <Home className="text-[var(--amber2)]" />
                  <p className="text-xl font-black">$29<span className="text-sm font-bold text-[var(--text3)]">/mo</span></p>
                </div>
                <h3 className="mt-3 text-xl font-black">Fixit Peace Home</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  For the night the pipe bursts. Priority home help, 6-monthly checks, and your home profile ready
                  before you need it.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[var(--amber2)]">
                  Choose Home <ArrowRight size={15} />
                </span>
              </Link>
              <Link href="/fixit-peace" className="focus-ring relative rounded-2xl border border-amber-200 bg-[var(--amber-light)] p-5 shadow-[var(--shadow)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]">
                <Badge tone="green" className="absolute right-4 top-4">Most peace of mind</Badge>
                <div className="flex items-start justify-between gap-3">
                  <ShieldCheck className="text-[var(--green)]" />
                  <p className="mt-8 text-xl font-black md:mt-0">$49<span className="text-sm font-bold text-[var(--text3)]">/mo</span></p>
                </div>
                <h3 className="mt-3 text-xl font-black">Fixit Peace Complete</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
                  Everything in Home, plus the road: flat tyres, dead batteries, lockouts far from home. Covered in
                  both places life breaks down.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-black text-[var(--amber2)]">
                  Choose Complete <ArrowRight size={15} />
                </span>
              </Link>
            </div>
          </div>
        </Card>
      </section>

      <section className="container py-12">
        <div className="mb-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <Badge tone="gray">Any repair, one request</Badge>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
              Urgent or planned, Fixit247 gets the right help moving.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)] md:text-base">
              From burst pipes, lockouts, flat tyres, and electrical faults to painting, roofing, landscaping, and
              bigger property work, start once and we shape the request for the right Fixer.
            </p>
          </div>
          <Button href="/post-job">
            Start any request
            <ArrowRight size={17} />
          </Button>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-[var(--red)]">Need help now</h3>
              <p className="mt-1 text-sm text-[var(--text2)]">Fast starters for home and roadside emergencies.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {urgentRequestCategories.map((item) => (
                <IconTile key={item.label} icon={item.icon} label={item.label} href={requestHref(item.lane, item.label)} />
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3">
              <h3 className="text-sm font-black uppercase tracking-wide text-[var(--amber2)]">Planning work</h3>
              <p className="mt-1 text-sm text-[var(--text2)]">Repairs, maintenance, installs, and project requests.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {plannedRequestCategories.map((item) => (
                <IconTile key={item.label} icon={item.icon} label={item.label} href={requestHref("standard_trade_job", item.label)} />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/post-job" variant="ghost">
            Tell us what needs fixing
          </Button>
          <Button href="/all-trade-jobs" variant="ghost">
            Browse every trade
          </Button>
        </div>
      </section>

      <section className="container grid gap-6 py-12 lg:grid-cols-[.9fr_1.1fr]">
        <Card>
          <Badge tone="purple">Powered by verified Fixers</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Local help behind the scenes.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Fixers are verified tradies and service providers who can respond to emergency, repair, maintenance,
            installation, and project opportunities without giving away commission.
          </p>
          <Button href="/become-a-fixer" variant="ghost" className="mt-6">
            Become a Fixer
          </Button>
        </Card>
        <Card variant="dark">
          <Hammer className="text-[var(--amber)]" />
          <h2 className="mt-4 text-3xl font-black tracking-tight">From burst pipes to full property upgrades.</h2>
          <p className="mt-4 leading-7 text-white/70">Emergency-first. Ready for every trade job your property needs.</p>
          <Button href="/post-job" className="mt-6">Start a request</Button>
        </Card>
      </section>
      <section className="container py-12">
        <Card variant="membership" className="max-w-3xl">
          <Badge>Home emergency newsletter</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Get calm checklists before something goes wrong.</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            Practical home emergency tips, roadside preparation, maintenance reminders, and Fixit Peace updates for Australian
            households.
          </p>
          <div className="mt-6">
            <NewsletterForm source="homepage" />
          </div>
        </Card>
      </section>
      <PublicFooter />
      <MobileBottomActionBar />
    </main>
  );
}
