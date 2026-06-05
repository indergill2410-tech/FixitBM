import { ArrowRight, Clock, MapPin, Radar, ShieldCheck, Zap } from "lucide-react";
import { FixitSymbol, fixitSymbolSet } from "@/components/brand";
import { Badge, Button, Card, IconTile, MobileBottomActionBar, PublicHeader, TrustStrip } from "@/components/ui";
import { homeCategories, roadsideCategories } from "@/lib/data";

export default function HomePage() {
  return (
    <main className="premium-shell pb-24">
      <PublicHeader />
      <section className="container grid min-h-[calc(100vh-64px)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_.95fr]">
        <div>
          <Badge>Early access now open</Badge>
          <h1 className="mt-5 max-w-3xl text-[42px] font-black leading-[1.04] tracking-tight md:text-[64px]">
            Emergency help for your home and road, 24/7.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--text2)] md:text-lg">
            Post a job free, get matched with verified local tradies, or protect your household with Fixit Plus
            peace-of-mind memberships.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button href="/post-job">
              Get Emergency Help Now
              <ArrowRight size={17} />
            </Button>
            <Button href="/post-job" variant="ghost">
              Post a Job Free
            </Button>
            <Button href="/fixit-plus" variant="dark">
              Join Fixit Plus
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
                  <p className="font-black">Home emergency</p>
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
                <h3 className="mt-4 font-black">Verified tradies</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--text2)]">Now onboarding verified providers across Australia.</p>
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
          <Badge tone="gray">Fixit symbols</Badge>
          <h2 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">A calm system for urgent moments.</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--text2)]">
            Simple service marks for the core Fixit247 experience: repairs, road help, protection, urgency, and tradie credits.
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
          ["We match the right help", "Home and roadside requests are prepared for the relevant local providers."],
          ["Track, chat, and resolve", "Customers, tradies, and ops get a shared timeline from request to completion."]
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
        <Card variant="membership">
          <Badge>Fixit Plus</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">Peace of mind for your home and road.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Home from $29/month or Complete home + roadside support from $49/month. Benefits apply after a
            72-hour activation period.
          </p>
          <Button href="/fixit-plus" className="mt-6">
            View memberships
          </Button>
        </Card>
        <Card>
          <Badge tone="purple">For tradies</Badge>
          <h2 className="mt-4 text-3xl font-black tracking-tight">No commission. Keep 100% of the job value.</h2>
          <p className="mt-4 leading-7 text-[var(--text2)]">
            Fixit247 monetises tradies through subscriptions, lead credits, featured visibility, verification upgrades,
            emergency priority access, and business tools.
          </p>
          <Button href="/for-tradies" variant="ghost" className="mt-6">
            See tradie plans
          </Button>
        </Card>
      </section>
      <MobileBottomActionBar />
    </main>
  );
}
