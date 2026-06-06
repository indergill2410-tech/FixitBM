import { ArrowRight, CheckCircle2, Clock, Hammer, Home, MapPin, Radar, ShieldCheck, Zap } from "lucide-react";
import { FixitSymbol, fixitSymbolSet } from "@/components/brand";
import { NewsletterForm } from "@/components/newsletter-form";
import { Badge, Button, Card, IconTile, MobileBottomActionBar, PublicHeader, TrustStrip } from "@/components/ui";
import { homeCategories, roadsideCategories, tradeCategories } from "@/lib/data";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";
import { safetyCheckDisclaimer } from "@/lib/safety-checks";

export default function HomePage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([organizationJsonLd(), websiteJsonLd()]) }}
      />
      <section className="container grid min-h-[calc(100vh-64px)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Badge>Early access now open</Badge>
          <h1 className="mt-5 max-w-3xl text-[42px] font-black leading-[1.04] tracking-tight md:text-[64px]">
            Emergency help for your home and road, 24/7.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text2)] md:text-lg">
            When something breaks, leaks, locks, sparks, stalls, or leaves you stranded, Fixit247 helps you get support
            fast, and Fixit Plus gives your household peace of mind before the next emergency.
          </p>
          <p className="mt-3 text-sm font-black uppercase tracking-wide text-[var(--amber2)]">
            Emergency help when things go wrong. Safety checks before they do.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/post-job">
              Get Help Now
              <ArrowRight size={17} />
            </Button>
            <Button href="/fixit-plus" variant="dark">
              Join Fixit Plus
            </Button>
            <Button href="/post-job" variant="ghost">
              Post a Request Free
            </Button>
          </div>
          <div className="mt-8">
            <TrustStrip />
          </div>
        </div>
        <Card variant="elevated" className="relative overflow-hidden p-4 md:p-6">
          <div className="grid gap-4">
            <Card variant="emergency">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--amber)] text-white">
                  <Zap size={21} />
                </span>
                <div>
                  <p className="font-black">Emergency request</p>
                  <p className="text-sm text-[var(--text2)]">Burst pipe, lockout, roof leak, urgent repair.</p>
                </div>
                <Badge tone="red" className="ml-auto">
                  Priority
                </Badge>
              </div>
            </Card>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <MapPin className="text-[var(--amber2)]" />
                <h3 className="mt-4 font-black">Roadside support</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Flat tyre, battery, fuel, towing coordination.</p>
              </Card>
              <Card>
                <ShieldCheck className="text-[var(--green)]" />
                <h3 className="mt-4 font-black">Verified Fixers</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Verified tradies and service providers behind the scenes.</p>
              </Card>
            </div>
            <Card variant="dark">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Badge tone="amber">Live dispatch status</Badge>
                  <h3 className="mt-4 text-xl font-black">Matching the right help</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">Built for calm tracking, chat, quotes, and resolution.</p>
                </div>
                <Radar className="text-[var(--amber)]" />
              </div>
            </Card>
          </div>
        </Card>
      </section>

      <section className="container grid gap-6 py-12 lg:grid-cols-[.9fr_1.1fr]">
        <Card variant="membership">
          <Badge>Fixit Plus</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Peace of mind before panic starts.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Home from $29/month or Complete home + roadside support from $49/month. Membership gives priority access,
            emergency coordination, saved profiles, member support, and 6-monthly Safety & Readiness Checks.
          </p>
          <Button href="/fixit-plus" className="mt-6">
            View memberships
          </Button>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <Home className="text-[var(--amber2)]" />
            <h3 className="mt-4 text-xl font-black">Fixit Plus Home</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">$29/month for home emergency peace of mind.</p>
          </Card>
          <Card variant="emergency">
            <ShieldCheck className="text-[var(--green)]" />
            <h3 className="mt-4 text-xl font-black">Fixit Plus Complete</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">$49/month for home + roadside peace of mind.</p>
          </Card>
        </div>
      </section>

      <section className="container grid gap-6 py-12 lg:grid-cols-[.82fr_1.18fr]">
        <Card variant="membership">
          <Badge>Included with Fixit Plus</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Your home checked every 6 months.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Fixit Plus does not just wait for emergencies. It helps you prepare for them. Members receive a visual Home
            Safety & Readiness Check on signup, then every 6 months while active - helping you spot visible risks, save
            key home details, and feel ready before the next leak, lockout, fault, storm, or breakdown.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/fixit-plus">Protect My Home</Button>
            <Button href="/fixit-plus#safety-check" variant="ghost">See What&apos;s Checked</Button>
          </div>
        </Card>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            "Spot visible risks",
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
        <p className="lg:col-span-2 rounded-2xl border border-[var(--border)] bg-white p-4 text-xs leading-6 text-[var(--text3)]">
          {safetyCheckDisclaimer}
        </p>
      </section>

      <section className="container py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <Badge tone="gray">Emergency categories</Badge>
            <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">One place when things break.</h2>
          </div>
          <Button href="/post-job" variant="ghost" className="hidden md:inline-flex">
            Start a request
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {[...homeCategories.slice(0, 6), ...roadsideCategories].map((item) => (
            <IconTile key={item.label} icon={item.icon} label={item.label} />
          ))}
        </div>
      </section>

      <section className="container py-12">
        <div className="mb-6 max-w-2xl">
          <Badge tone="gray">All trade jobs</Badge>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">Not an emergency? Fixit247 can still help.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            From small repairs and maintenance to installations, painting, roofing, landscaping, and larger property
            projects, you can start any trade request in one place.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
          {tradeCategories.slice(0, 15).map((item) => (
            <IconTile key={item.label} icon={item.icon} label={item.label} />
          ))}
        </div>
        <Button href="/all-trade-jobs" variant="ghost" className="mt-6">
          Start a Trade Request
        </Button>
      </section>

      <section className="container py-12">
        <div className="mb-6 max-w-2xl">
          <Badge tone="gray">Fixit symbols</Badge>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">A calm system for urgent moments.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            Simple service marks for the core Fixit247 experience: repairs, road help, protection, urgency, and Fixer credits.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
          {fixitSymbolSet.map((symbol) => (
            <FixitSymbol key={symbol.name} name={symbol.name} label={symbol.label} tone={symbol.tone} />
          ))}
        </div>
      </section>

      <section className="container grid gap-4 py-12 md:grid-cols-3">
        {[
          ["Tell us what happened", "A fast guided flow captures urgency, location, photos, and safe contact details."],
          ["We prepare the right request", "Home, roadside, trade, and project requests are organised for suitable Fixers."],
          ["Track, chat, and resolve", "Customers, Fixers, and ops get a shared timeline from request to completion."]
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
          <Button href="/post-job" className="mt-6">Start a Request</Button>
        </Card>
      </section>
      <section className="container py-12">
        <Card variant="membership" className="max-w-3xl">
          <Badge>Home emergency newsletter</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Get calm checklists before something goes wrong.</h2>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            Practical home emergency tips, roadside preparation, maintenance reminders, and Fixit Plus updates for Australian
            households.
          </p>
          <div className="mt-6">
            <NewsletterForm source="homepage" />
          </div>
        </Card>
      </section>
      <MobileBottomActionBar />
    </main>
  );
}
