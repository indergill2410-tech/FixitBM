import { Badge, Card } from "@/components/ui";
import { CheckoutButton, PortalButton } from "@/components/billing-buttons";
import { agencyPlanCodes, billingPlans, formatMoney, getBillingPlan } from "@/lib/billing";
import type { AgencySubscription } from "@/lib/agency";

const statusTone: Record<string, "green" | "amber" | "red" | "gray"> = {
  active: "green",
  pending_activation: "amber",
  past_due: "red",
  cancelled: "gray",
  inactive: "gray"
};

const agencyPlans = billingPlans.filter((plan) => plan.type === "agency_subscription");

export function AgencyBillingCard({ subscription }: { subscription: AgencySubscription | null }) {
  const activePlan = subscription && subscription.status !== "inactive" ? getBillingPlan(subscription.plan_code) : null;
  const hasActive = subscription?.status === "active" || subscription?.status === "pending_activation";

  return (
    <Card id="billing">
      <Badge tone="green">PropertySafe plan</Badge>
      <h2 className="mt-3 text-2xl font-black">
        {activePlan ? activePlan.name : "Choose your PropertySafe plan"}
      </h2>

      {subscription && activePlan ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Badge tone={statusTone[subscription.status] ?? "gray"}>{subscription.status.replaceAll("_", " ")}</Badge>
          <span className="text-sm text-[var(--text2)]">
            {formatMoney(activePlan.priceCents)}/month
            {subscription.current_period_end
              ? ` · renews ${new Date(subscription.current_period_end).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" })}`
              : ""}
          </span>
        </div>
      ) : (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text2)]">
          Keep Safety Check history, recommendations, and shared owner access connected across your portfolio. Pick the
          tier that fits how many properties you manage.
        </p>
      )}

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {agencyPlans.map((plan) => {
          const isCurrent = activePlan?.code === plan.code;
          return (
            <div
              key={plan.code}
              className={`rounded-2xl border p-4 ${isCurrent ? "border-[var(--green)] bg-[var(--green-light)]" : "border-[var(--border)] bg-[var(--bg)]"}`}
            >
              <p className="text-sm font-black">{plan.name}</p>
              <p className="mt-1 text-2xl font-black">
                {formatMoney(plan.priceCents)}
                <span className="text-sm font-bold text-[var(--text3)]">/mo</span>
              </p>
              <p className="mt-2 text-xs leading-5 text-[var(--text2)]">{plan.description}</p>
              <div className="mt-4">
                {isCurrent ? (
                  <Badge tone="green">Current plan</Badge>
                ) : (
                  <CheckoutButton
                    planCode={plan.code}
                    label={hasActive ? "Switch plan" : "Choose plan"}
                    variant={hasActive ? "ghost" : "primary"}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {hasActive ? (
        <div className="mt-5 max-w-xs">
          <PortalButton />
        </div>
      ) : null}

      <p className="mt-4 text-xs leading-5 text-[var(--text3)]">
        Plans:{" "}
        {agencyPlanCodes
          .map((code) => getBillingPlan(code)?.name)
          .filter(Boolean)
          .join(" · ")}
        . Billing is managed securely by Stripe.
      </p>
    </Card>
  );
}
