import type { ReactNode } from "react";
import { Check, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, DashboardHeader } from "@/components/ui";
import { CheckoutButton, PortalButton } from "@/components/billing-buttons";
import { requireRole } from "@/lib/auth";
import { activationCopy, getHomeProtectionSummary, safetyCheckDisclaimer } from "@/lib/safety-checks";

export default async function CustomerMembershipPage() {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  const protection = await getHomeProtectionSummary(user);
  const membership = protection.membership;
  const isActive = membership?.status === "active";
  const isComplete = isActive && membership?.plan === "complete";

  return (
    <main className="premium-shell min-h-screen">
      <section className="container py-8">
        <DashboardHeader title="Membership" role="Customer" />
        <div className="grid gap-5">
          <Card variant="membership">
            <Badge>{isActive ? "Fixit Peace active" : membership ? "Activation pending" : "Fixit Peace"}</Badge>
            <h1 className="mt-4 text-3xl font-black">
              {isComplete
                ? "Your home + road protection is active."
                : isActive
                  ? "Your home protection is active."
                  : "Peace of mind before panic starts."}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              {isActive
                ? "Manage emergency support, saved home details, and your 6-monthly Safety & Readiness Check."
                : "Join Fixit Peace to unlock emergency support, saved home details, and your first Safety & Readiness Check included."}
            </p>
            <p className="mt-4 rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-6 text-[var(--text2)]">
              {activationCopy}
            </p>
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <PlanCard
              title="Fixit Peace Home"
              price="$29"
              copy="Peace of mind for home emergencies."
              features={["24/7 emergency request support", "Priority home emergency coordination", "Saved home profile", "6-monthly Safety Check included", "Home Protection Score", "Recommended Fixes after each check"]}
              action={<CheckoutButton planCode="home" label="Protect my home" variant="ghost" />}
            />
            <PlanCard
              title="Fixit Peace Complete"
              price="$49"
              copy="Peace of mind at home and on the road."
              recommended
              features={["Everything in Home", "Home + Road Readiness Check every 6 months", "Saved vehicle profile", "Vehicle readiness reminders", "Roadside preparedness checklist", "Home + road account"]}
              action={<CheckoutButton planCode="complete" label="Protect home + road" />}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[.55fr_.45fr]">
            <Card>
              <ShieldCheck className="text-[var(--amber2)]" />
              <h2 className="mt-4 text-xl font-black">Safety Check eligibility</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text2)]">
              {isActive
                ? "Your Safety Check booking area is available. After your first completed check, your report area shows findings and recommended fixes."
                : membership
                    ? "Safety Check booking unlocks once your membership is active."
                    : "Safety Checks are included with Fixit Peace. Free users can still use the digital safety checklist and start requests free."}
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button href={isActive ? "/dashboard/customer/safety-checks/book" : "/fixit-peace"}>
                  {isActive ? "Book my Safety Check" : "Unlock my Safety Check"}
                </Button>
                <Button href="/dashboard/customer/safety-checks" variant="ghost">View my report</Button>
              </div>
            </Card>
            <Card variant="emergency">
              <Badge>Disclaimer</Badge>
              <p className="mt-3 text-sm leading-7 text-[var(--text2)]">{safetyCheckDisclaimer}</p>
            </Card>
          </div>

          <div className="max-w-sm">
            <PortalButton />
          </div>
        </div>
      </section>
    </main>
  );
}

function PlanCard({
  title,
  price,
  copy,
  features,
  action,
  recommended = false
}: {
  title: string;
  price: string;
  copy: string;
  features: string[];
  action: ReactNode;
  recommended?: boolean;
}) {
  return (
    <Card variant={recommended ? "membership" : "default"}>
      <Badge tone={recommended ? "amber" : "gray"}>{recommended ? "Best value" : "Home"}</Badge>
      <h2 className="mt-4 text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--text2)]">{copy}</p>
      <p className="mt-5 text-5xl font-black">{price}<span className="text-sm text-[var(--text2)]">/month</span></p>
      <div className="mt-6 grid gap-3">
        {features.map((feature) => (
          <div key={feature} className="flex gap-3 text-sm text-[var(--text2)]">
            <Check size={17} className="mt-0.5 shrink-0 text-[var(--green)]" />
            {feature}
          </div>
        ))}
      </div>
      <div className="mt-7">{action}</div>
    </Card>
  );
}
