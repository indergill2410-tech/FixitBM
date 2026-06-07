import { Badge, Button, Card, PublicHeader } from "@/components/ui";
import { getBillingPlan } from "@/lib/billing";

export default async function BillingStatusPage({ searchParams }: { searchParams: Promise<{ status?: string; plan?: string }> }) {
  const { status, plan: planCode } = await searchParams;
  const plan = planCode ? getBillingPlan(planCode) : null;
  const isSuccess = status === "success";
  const isCancelled = status === "cancelled";

  return (
    <main className="premium-shell">
      <PublicHeader />
      <section className="container py-14">
        <Card className="max-w-2xl">
          <Badge>Billing status</Badge>
          <h1 className="mt-4 text-3xl font-black">
            {isSuccess ? "Payment received. Your account is being updated." : isCancelled ? "Checkout was cancelled." : "Billing status"}
          </h1>
          <p className="mt-3 leading-7 text-[var(--text2)]">
            {isSuccess
              ? `${plan?.name ?? "Your selected plan"} is now being connected to your account. If it does not update immediately, support can review the account from your billing reference.`
              : isCancelled
                ? "No payment was taken. You can return to pricing, choose a plan, or start a free request."
                : "Use this page after checkout to confirm the next step for your membership, Fixer plan, or credit pack."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href={isSuccess ? "/dashboard" : "/pricing"}>{isSuccess ? "Go to account" : "View plans"}</Button>
            <Button href="/post-job" variant="ghost">Start a free request</Button>
          </div>
        </Card>
      </section>
    </main>
  );
}
