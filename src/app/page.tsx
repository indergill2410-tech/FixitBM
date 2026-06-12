import { ArrowRight, Building2, CheckCircle2, Hammer, Home, MapPin, ShieldCheck, Zap } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-form";
import { TrackedCTA } from "@/components/customer-dashboard";
import { HeroLanes } from "@/components/hero-lanes";
import { Badge, Button, Card, IconTile, MobileBottomActionBar, PublicFooter, PublicHeader, TrustStrip } from "@/components/ui";
import { homeCategories, roadsideCategories, tradeCategories } from "@/lib/data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

export default function HomePage() {
  const urgentRequestCategories = [
    homeCategories.find((item) => item.label === "Burst pipe"),
    homeCategories.find((item) => item.label === "Electrical fault"),
    homeCategories.find((item) => item.label === "Lockout"),
    roadsideCategories.find((item) => item.label === "Flat tyre"),
    roadsideCategories.find((item) => item.label === "Battery"),
    roadsideCategories.find((item) => item.label === "Fuel emergency")
  ].filter((item): item is (typeof homeCategories)[number] => Boolean(item));

  const plannedRequestCategories = [
    tradeCategories.find((item) => item.label === "Plumbing"),
    tradeCategories.find((item) => item.label === "Roofing"),
    tradeCategories.find((item) => item.label === "Painting"),
    tradeCategories.find((item) => item.label === "Carpentry"),
    tradeCategories.find((item) => item.label === "Landscaping"),
    tradeCategories.find((item) => item.label === "Concreting")
  ].filter((item): item is (typeof tradeCategories)[number] => Boolean(item));

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
            Something just broke? Breathe. Help starts now.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text2)] md:text-lg">
            Tell us what happened — it takes about a minute. A verified local Fixer gets the full picture before they
            call, so you&apos;re not explaining a flood twice.
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
          {[
            ["Tell us what happened", "About a minute, photos optional, no account needed. The calmer version of ringing five numbers from a search page.", Zap],
            ["A verified Fixer responds", "They see your details, location, and photos before they call — so the first conversation is already useful.", ShieldCheck],
            ["Life goes back to normal", "The fix is done, and it stays on your property's record — handy for landlords, insurance, and next time.", Home]
          ].map(([title, copy, Icon], index) => (
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

      <section className="container grid gap-6 py-12 lg:grid-cols-[.9fr_1.1fr]">
        <Card variant="membership">
          <Badge>Fixit Peace</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Peace of mind before panic starts.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Home from $29/month or Complete home + roadside support from $49/month. Membership gives priority access,
            emergency coordination, saved profiles, member support, and 6-monthly Safety & Readiness Checks.
          </p>
          <Button href="/fixit-peace" className="mt-6">
            View memberships
          </Button>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <Home className="text-[var(--amber2)]" />
            <h3 className="mt-4 text-xl font-black">Fixit Peace Home</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">$29/month for home emergency peace of mind.</p>
          </Card>
          <Card variant="emergency">
            <ShieldCheck className="text-[var(--green)]" />
            <h3 className="mt-4 text-xl font-black">Fixit Peace Complete</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">$49/month for home + roadside peace of mind.</p>
          </Card>
        </div>
      </section>

      <section className="container grid gap-6 py-12 lg:grid-cols-[.82fr_1.18fr]">
        <Card variant="membership">
          <Badge>Included with Fixit Peace</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Your home checked every 6 months.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Fixit Peace does not just wait for emergencies. It helps you prepare for them. Members receive a visual Home
            Safety & Readiness Check on signup, then every 6 months while active - helping you spot visible concerns, save
            key home details, and feel ready before the next leak, lockout, fault, storm, or breakdown.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/fixit-peace">Protect my home</Button>
            <Button href="/fixit-peace#safety-check" variant="ghost">See what is checked</Button>
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Spot visible concerns",
            "Save key home details",
            "Prepare before emergencies",
            "Get recommended fixes",
            "Book quotes from Fixers",
            "Track your home protection score"
          ].map((item) => (
            <Card key={item}>
              <CheckCircle2 className="text-[var(--green)]" />
              <h3 className="mt-4 font-black">{item}</h3>
            </Card>
          ))}
        </div>
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
                <IconTile key={item.label} icon={item.icon} label={item.label} />
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
                <IconTile key={item.label} icon={item.icon} label={item.label} />
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

      <section className="container grid gap-4 py-12 md:grid-cols-3">
        {[
          ["Tell us what happened", "A fast guided flow captures urgency, location, photos, and safe contact details."],
          ["We prepare the right request", "Home, roadside, trade, and project requests are organised for suitable Fixers."],
          ["Track, chat, and resolve", "Customers, Fixers, and support get a shared timeline from request to completion."]
        ].map(([title, copy], index) => (
          <Card key={title}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--amber-dim)] text-sm font-black text-[var(--amber2)]">
              {index + 1}
            </span>
            <h3 className="mt-5 text-lg font-black">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--text2)]">{copy}</p>
          </Card>
        ))}
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
