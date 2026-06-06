import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { getBillingPlan, getCreditAmount, isStripeConfigured, stripeRequest } from "@/lib/billing";
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

  const roleError = checkoutRoleError(user.role, plan.type);
  if (roleError) {
    return NextResponse.json({ error: roleError }, { status: 403 });
  }

  if (isSupabaseServerConfigured()) {
    await recordPendingPlan(user.id, plan.code);
  }

  if (!isStripeConfigured(plan)) {
    return NextResponse.json({
      message: `Checkout for ${plan.name} is temporarily unavailable. Please try again shortly.`
    });
  }

  const origin = new URL(request.url).origin;
  const priceId = process.env[plan.stripePriceEnv];
  const successUrl = `${origin}/billing/status?status=success&plan=${encodeURIComponent(plan.code)}`;
  const cancelUrl = `${origin}/billing/status?status=cancelled&plan=${encodeURIComponent(plan.code)}`;
  const body = new URLSearchParams({
    mode: plan.type === "credit_pack" ? "payment" : "subscription",
    "line_items[0][price]": priceId ?? "",
    "line_items[0][quantity]": "1",
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: user.id,
    "metadata[user_id]": user.id,
    "metadata[plan_code]": plan.code,
    "metadata[product_type]": plan.type,
    "metadata[credit_amount]": String(getCreditAmount(plan.code))
  });

  if (user.email) {
    body.set("customer_email", user.email);
  }

  if (plan.type !== "credit_pack") {
    body.set("subscription_data[metadata][user_id]", user.id);
    body.set("subscription_data[metadata][plan_code]", plan.code);
    body.set("subscription_data[metadata][product_type]", plan.type);
  }

  try {
    const session = await stripeRequest<{ id: string; url: string }>("/checkout/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to start checkout." },
      { status: 502 }
    );
  }
}

function checkoutRoleError(role: string, productType: string) {
  if (productType === "customer_membership" && role !== "customer") {
    return "Fixit Plus memberships must be purchased from a customer account.";
  }

  if ((productType === "tradie_subscription" || productType === "credit_pack") && role !== "tradie") {
    return "Fixer plans and lead credits must be purchased from a Fixer account.";
  }

  return null;
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
