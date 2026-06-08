import { redirect } from "next/navigation";
import { BadgeCheck, BriefcaseBusiness, Building2, Clock3, ShieldCheck, Wrench } from "lucide-react";
import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { TradieRegisterForm } from "@/components/auth-forms";
import { getCurrentAppUser, roleHome } from "@/lib/auth";
import { showFixerRecruitmentUi } from "@/lib/featureFlags";

export const dynamic = "force-dynamic";

export default async function TradieRegisterPage() {
  const user = await getCurrentAppUser();

  if (user) {
    redirect(roleHome(user.role));
  }

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container grid gap-6 py-8 lg:grid-cols-[.42fr_1fr] lg:items-start lg:py-12">
        <aside className="grid gap-4 lg:sticky lg:top-24">
          <Card variant="dark" className="p-6">
            <Badge>Fixer network</Badge>
            <h1 className="mt-5 text-3xl font-black leading-tight tracking-tight md:text-4xl">
              Join the Fixit 247 Fixer network
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/70">
              Create your account now, then complete your dashboard profile so our team can review your trade, service
              area, availability, documents, and work interests.
            </p>
            <div className="mt-5 grid gap-3">
              <Benefit icon={Building2} label="Agency and property maintenance opportunities" />
              <Benefit icon={Clock3} label="Emergency and planned repair requests" />
              <Benefit icon={BriefcaseBusiness} label="Partnership and contract work interest" />
              <Benefit icon={ShieldCheck} label="Profile review for trusted Fixers" />
            </div>
          </Card>
          <Card variant="membership">
            <Badge tone="green">After signup</Badge>
            <h2 className="mt-4 text-xl font-black">You&apos;ll go straight to your Fixer dashboard.</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              Add insurance status, licence details, ABN, service areas, work preferences, and verification documents
              from the dashboard.
            </p>
            <Button href="/become-a-fixer" variant="ghost" className="mt-5 w-full">
              Review how it works
            </Button>
          </Card>
        </aside>
        <Card className="w-full p-6 md:p-8">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <Badge tone="purple">Fixer onboarding</Badge>
              <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">Create your Fixer account</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text2)]">
                {showFixerRecruitmentUi
                  ? "Start with your core account details. No pricing selection is required during current onboarding."
                  : "Build your profile, set your emergency availability, and get 111 bonus lead credits every month for your first 6 months. No commission and no paid subscription required to try leads."}
              </p>
            </div>
            <Wrench className="hidden text-[var(--amber2)] md:block" size={34} />
          </div>
          <TradieRegisterForm />
        </Card>
      </section>
    </main>
  );
}

function Benefit({ icon: Icon, label }: { icon: typeof BadgeCheck; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 p-3">
      <Icon className="shrink-0 text-[var(--amber)]" size={17} />
      <span className="text-sm font-black text-white/85">{label}</span>
    </div>
  );
}
