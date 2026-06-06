import { NextResponse } from "next/server";
import { getBillingPlan, getCreditAmount } from "@/lib/billing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

type StripeEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: StripeCheckoutSession;
  };
};

type StripeCheckoutSession = {
  id?: string;
  mode?: string;
  payment_status?: string;
  customer?: string | null;
  subscription?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string | undefined> | null;
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        message: "Webhook verification is temporarily unavailable."
      },
      { status: 503 }
    );
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const verified = await verifyStripeSignature(payload, signature, process.env.STRIPE_WEBHOOK_SECRET);
  if (!verified) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid Stripe event payload." }, { status: 400 });
  }

  let reconciled = false;
  if (event.type === "checkout.session.completed") {
    const result = await reconcileCheckoutSession(event.data?.object ?? null, event.id ?? null);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    reconciled = result.reconciled;
  }

  return NextResponse.json({
    received: true,
    eventId: event.id ?? null,
    type: event.type ?? null,
    reconciled,
    message: reconciled ? "Billing event reconciled." : "Billing event accepted."
  });
}

async function reconcileCheckoutSession(session: StripeCheckoutSession | null, eventId: string | null) {
  if (!session?.id) {
    return { ok: true, reconciled: false, message: "No checkout session supplied.", status: 200 };
  }

  if (session.payment_status && !["paid", "no_payment_required"].includes(session.payment_status)) {
    return { ok: true, reconciled: false, message: "Checkout session is not paid.", status: 200 };
  }

  if (!isSupabaseServerConfigured()) {
    return { ok: false, reconciled: false, message: "Billing reconciliation is temporarily unavailable.", status: 503 };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, reconciled: false, message: "Billing reconciliation is temporarily unavailable.", status: 503 };
  }

  const planCode = session.metadata?.plan_code;
  const plan = planCode ? getBillingPlan(planCode) : null;
  const userId = session.metadata?.user_id ?? session.client_reference_id;

  if (!plan || !userId) {
    return { ok: true, reconciled: false, message: "Checkout metadata is not linked to an account.", status: 200 };
  }

  const now = new Date();
  const currentPeriodEnd = plan.interval ? new Date(now.getTime() + 1000 * 60 * 60 * 24 * 30).toISOString() : null;

  if (plan.type === "customer_membership") {
    const activationEffectiveAt = new Date(now.getTime() + 1000 * 60 * 60 * 72).toISOString();
    const { error } = await supabase.from("memberships").upsert(
      {
        customer_id: userId,
        plan: plan.code,
        price_cents: plan.priceCents,
        status: "pending_activation",
        activation_start: now.toISOString(),
        activation_effective_at: activationEffectiveAt,
        current_period_end: currentPeriodEnd
      },
      { onConflict: "customer_id,plan" }
    );

    if (error) return { ok: false, reconciled: false, message: error.message, status: 500 };
    await writeBillingAudit(userId, "checkout_membership_paid", "membership", session.id, {
      eventId,
      planCode: plan.code,
      customer: session.customer ?? null,
      subscription: session.subscription ?? null
    });
    return { ok: true, reconciled: true, message: "Membership reconciled.", status: 200 };
  }

  const { data: tradie, error: tradieError } = await supabase
    .from("tradie_profiles")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (tradieError) return { ok: false, reconciled: false, message: tradieError.message, status: 500 };
  if (!tradie) return { ok: true, reconciled: false, message: "Checkout account is not a Fixer profile.", status: 200 };

  if (plan.type === "tradie_subscription") {
    const { error } = await supabase.from("tradie_subscriptions").upsert(
      {
        tradie_id: tradie.id,
        plan: plan.code,
        status: "active",
        current_period_end: currentPeriodEnd
      },
      { onConflict: "tradie_id" }
    );

    if (error) return { ok: false, reconciled: false, message: error.message, status: 500 };
    await writeBillingAudit(userId, "checkout_fixer_plan_paid", "tradie_subscription", session.id, {
      eventId,
      planCode: plan.code,
      customer: session.customer ?? null,
      subscription: session.subscription ?? null
    });
    return { ok: true, reconciled: true, message: "Fixer plan reconciled.", status: 200 };
  }

  const creditAmount = getCreditAmount(plan.code);
  if (!creditAmount) {
    return { ok: true, reconciled: false, message: "Credit pack has no credit amount.", status: 200 };
  }

  const wallet = await getOrCreateWallet(tradie.id);
  if (!wallet.ok) return wallet;

  const reason = `Credit pack purchase: ${plan.name} (${session.id})`;
  const { data: existingTransaction } = await supabase
    .from("credit_transactions")
    .select("id")
    .eq("wallet_id", wallet.wallet.id)
    .eq("reason", reason)
    .maybeSingle();

  if (existingTransaction) {
    return { ok: true, reconciled: false, message: "Credit pack already reconciled.", status: 200 };
  }

  const { error: walletError } = await supabase
    .from("tradie_credit_wallets")
    .update({
      balance: wallet.wallet.balance + creditAmount,
      lifetime_purchased: wallet.wallet.lifetime_purchased + creditAmount
    })
    .eq("id", wallet.wallet.id);

  if (walletError) return { ok: false, reconciled: false, message: walletError.message, status: 500 };

  const { error: transactionError } = await supabase.from("credit_transactions").insert({
    wallet_id: wallet.wallet.id,
    type: "purchase",
    amount: creditAmount,
    reason,
    created_by: userId
  });

  if (transactionError) return { ok: false, reconciled: false, message: transactionError.message, status: 500 };

  await writeBillingAudit(userId, "checkout_credit_pack_paid", "credit_transaction", wallet.wallet.id, {
    eventId,
    planCode: plan.code,
    creditAmount,
    customer: session.customer ?? null
  });

  return { ok: true, reconciled: true, message: "Credit pack reconciled.", status: 200 };
}

async function getOrCreateWallet(tradieId: string) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false as const, reconciled: false, message: "Billing reconciliation is temporarily unavailable.", status: 503 };
  }

  const { data: wallet, error } = await supabase
    .from("tradie_credit_wallets")
    .select("id, balance, lifetime_purchased")
    .eq("tradie_id", tradieId)
    .maybeSingle();

  if (error) return { ok: false as const, reconciled: false, message: error.message, status: 500 };
  if (wallet) return { ok: true as const, wallet: { id: wallet.id, balance: wallet.balance ?? 0, lifetime_purchased: wallet.lifetime_purchased ?? 0 } };

  const { data: created, error: createError } = await supabase
    .from("tradie_credit_wallets")
    .insert({
      tradie_id: tradieId,
      balance: 0,
      bonus_balance: 111,
      bonus_monthly_amount: 111,
      bonus_months_total: 6,
      bonus_months_granted: 1,
      bonus_next_renewal_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
      bonus_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 183).toISOString(),
      signup_bonus_granted_at: new Date().toISOString(),
      lifetime_purchased: 0
    })
    .select("id, balance, lifetime_purchased")
    .single();

  if (createError || !created) {
    return { ok: false as const, reconciled: false, message: createError?.message ?? "Wallet could not be created.", status: 500 };
  }

  await supabase.from("credit_transactions").insert({
    wallet_id: created.id,
    type: "bonus",
    amount: 111,
    reason: "Signup bonus credits: month 1 of 6"
  });

  return { ok: true as const, wallet: { id: created.id, balance: created.balance ?? 0, lifetime_purchased: created.lifetime_purchased ?? 0 } };
}

async function writeBillingAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    metadata
  });
}

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedPayload = `${timestamp}.${payload}`;
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}
