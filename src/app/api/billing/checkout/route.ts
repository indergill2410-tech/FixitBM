import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { getBillingPlan, isStripeConfigured } from "@/lib/billing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const checkoutSchema = z.object({
  planCode: z.string().min(2)
});

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid plan." }, { status: 400 });
  }

  const plan = getBillingPlan(parsed.data.planCode);

  if (!plan) {
    return NextResponse.json({ error: "Unknown billing plan." }, { status: 404 });
  }

  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before starting checkout." }, { status: 401 });
  }

  if (isSupabaseServerConfigured()) {
    await recordPendingPlan(user.id, plan.code);
  }

  if (!isStripeConfigured(plan)) {
    return NextResponse.json({
      configured: false,
      message: `${plan.name} is ready, but Stripe is not configured yet. Add STRIPE_SECRET_KEY and ${plan.stripePriceEnv}.`
    });
  }

  return NextResponse.json({
    configured: false,
    message:
      "Stripe price IDs are configured, but live checkout creation is intentionally disabled until the Stripe SDK integration is enabled."
  });
}

async function recordPendingPlan(userId: string, planCode: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  if (planCode === "home" || planCode === "complete") {
    await supabase.from("memberships").upsert(
      {
        customer_id: userId,
        plan: planCode,
        price_cents: planCode === "home" ? 2900 : 4900,
        status: "inactive"
      },
      { onConflict: "customer_id,plan" }
    );
  }
}
