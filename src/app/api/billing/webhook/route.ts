import { NextResponse } from "next/server";
import { getBillingPlan, getCreditAmount } from "@/lib/billing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

type StripeEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: StripeCheckoutSession | StripeSubscription | StripeInvoice;
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

type StripeSubscription = {
  id?: string;
  status?: string;
  customer?: string | null;
  current_period_start?: number | null;
  current_period_end?: number | null;
  metadata?: Record<string, string | undefined> | null;
};

type StripeInvoice = {
  id?: string;
  customer?: string | null;
  subscription?: string | null;
  status?: string | null;
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

  // Idempotency: Stripe retries deliveries. Claim the event id before doing
  // any work; a conflict means we already processed this exact event.
  if (event.id && isSupabaseServerConfigured()) {
    const dedupeClient = createSupabaseAdminClient();
    if (dedupeClient) {
      const { error: dedupeError } = await dedupeClient
        .from("stripe_webhook_events")
        .insert({ id: event.id, type: event.type ?? "unknown" });

      if (dedupeError?.code === "23505") {
        return NextResponse.json({ received: true, duplicate: true, eventId: event.id });
      }
    }
  }

  let reconciled = false;
  if (event.type === "checkout.session.completed") {
    const result = await reconcileCheckoutSession(event.data?.object as StripeCheckoutSession | null, event.id ?? null);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    reconciled = result.reconciled;
  } else if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    const result = await reconcileSubscriptionEvent(event.data?.object as StripeSubscription | null, event.type, event.id ?? null);
    if (!result.ok) {
      return NextResponse.json({ error: result.message }, { status: result.status });
    }
    reconciled = result.reconciled;
  } else if (event.type === "invoice.payment_succeeded" || event.type === "invoice.payment_failed") {
    const result = await reconcileInvoiceEvent(event.data?.object as StripeInvoice | null, event.type, event.id ?? null);
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

async function reconcileSubscriptionEvent(subscription: StripeSubscription | null, eventType: string, eventId: string | null) {
  if (!subscription?.id) {
    return { ok: true, reconciled: false, message: "No subscription supplied.", status: 200 };
  }

  if (!isSupabaseServerConfigured()) {
    return { ok: false, reconciled: false, message: "Billing reconciliation is temporarily unavailable.", status: 503 };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, reconciled: false, message: "Billing reconciliation is temporarily unavailable.", status: 503 };
  }

  const planCode = subscription.metadata?.plan_code;
  const plan = planCode ? getBillingPlan(planCode) : null;
  const productType = subscription.metadata?.product_type ?? plan?.type ?? null;
  const mappedStatus = eventType === "customer.subscription.deleted" ? "cancelled" : mapStripeSubscriptionStatus(subscription.status);
  const periodStart = stripeTimestamp(subscription.current_period_start);
  const periodEnd = stripeTimestamp(subscription.current_period_end);
  const commonPatch = {
    status: mappedStatus,
    stripe_customer_id: subscription.customer ?? null,
    current_period_start: periodStart,
    current_period_end: periodEnd
  };

  if (productType === "customer_membership") {
    const { data: membership } = await supabase
      .from("memberships")
      .select("id, activation_effective_at")
      .eq("stripe_subscription_id", subscription.id)
      .maybeSingle();
    const membershipStatus = preserveActivationWindow(mappedStatus, membership?.activation_effective_at ?? null);
    const { data: updatedMemberships, error } = await supabase
      .from("memberships")
      .update({
        ...commonPatch,
        status: membershipStatus,
        ...(membershipStatus === "cancelled" ? { cancelled_at: new Date().toISOString() } : {})
      })
      .eq("stripe_subscription_id", subscription.id)
      .select("id");

    if (error) return { ok: false, reconciled: false, message: error.message, status: 500 };
    await writeBillingAudit(subscription.metadata?.user_id ?? null, `stripe_${eventType}`, "membership", subscription.id, {
      eventId,
      stripeStatus: subscription.status ?? null,
      mappedStatus: membershipStatus,
      planCode
    });
    return { ok: true, reconciled: Boolean(updatedMemberships?.length), message: "Membership subscription reconciled.", status: 200 };
  }

  if (productType === "tradie_subscription") {
    const { data: updatedSubscriptions, error } = await supabase
      .from("tradie_subscriptions")
      .update(commonPatch)
      .eq("stripe_subscription_id", subscription.id)
      .select("id");

    if (error) return { ok: false, reconciled: false, message: error.message, status: 500 };
    await writeBillingAudit(subscription.metadata?.user_id ?? null, `stripe_${eventType}`, "tradie_subscription", subscription.id, {
      eventId,
      stripeStatus: subscription.status ?? null,
      mappedStatus,
      planCode
    });
    return { ok: true, reconciled: Boolean(updatedSubscriptions?.length), message: "Fixer subscription reconciled.", status: 200 };
  }

  if (productType === "agency_subscription") {
    const { data: updatedAgencies, error } = await supabase
      .from("agency_subscriptions")
      .update({
        ...commonPatch,
        ...(mappedStatus === "cancelled" ? { cancelled_at: new Date().toISOString() } : {})
      })
      .eq("stripe_subscription_id", subscription.id)
      .select("id");

    if (error) return { ok: false, reconciled: false, message: error.message, status: 500 };
    await writeBillingAudit(subscription.metadata?.user_id ?? null, `stripe_${eventType}`, "agency_subscription", subscription.id, {
      eventId,
      stripeStatus: subscription.status ?? null,
      mappedStatus,
      planCode
    });
    return { ok: true, reconciled: Boolean(updatedAgencies?.length), message: "Agency subscription reconciled.", status: 200 };
  }

  return { ok: true, reconciled: false, message: "Subscription product type was not recognised.", status: 200 };
}

async function reconcileInvoiceEvent(invoice: StripeInvoice | null, eventType: string, eventId: string | null) {
  if (!invoice?.subscription) {
    return { ok: true, reconciled: false, message: "Invoice has no subscription.", status: 200 };
  }

  if (!isSupabaseServerConfigured()) {
    return { ok: false, reconciled: false, message: "Billing reconciliation is temporarily unavailable.", status: 503 };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, reconciled: false, message: "Billing reconciliation is temporarily unavailable.", status: 503 };
  }

  const mappedStatus = eventType === "invoice.payment_succeeded" ? "active" : "past_due";
  const patch = {
    status: mappedStatus,
    stripe_customer_id: invoice.customer ?? null
  };
  const { data: membership } = await supabase
    .from("memberships")
    .select("id, activation_effective_at")
    .eq("stripe_subscription_id", invoice.subscription)
    .maybeSingle();
  const membershipStatus = preserveActivationWindow(mappedStatus, membership?.activation_effective_at ?? null);
  const [membershipResult, subscriptionResult, agencyResult] = await Promise.all([
    supabase
      .from("memberships")
      .update({ ...patch, status: membershipStatus })
      .eq("stripe_subscription_id", invoice.subscription)
      .select("id"),
    supabase.from("tradie_subscriptions").update(patch).eq("stripe_subscription_id", invoice.subscription).select("id"),
    supabase.from("agency_subscriptions").update(patch).eq("stripe_subscription_id", invoice.subscription).select("id")
  ]);

  if (membershipResult.error) return { ok: false, reconciled: false, message: membershipResult.error.message, status: 500 };
  if (subscriptionResult.error) return { ok: false, reconciled: false, message: subscriptionResult.error.message, status: 500 };
  if (agencyResult.error) return { ok: false, reconciled: false, message: agencyResult.error.message, status: 500 };

  await writeBillingAudit(null, `stripe_${eventType}`, "subscription_payment", invoice.subscription, {
    eventId,
    invoiceId: invoice.id ?? null,
    mappedStatus
  });

  return {
    ok: true,
    reconciled: Boolean((membershipResult.data?.length ?? 0) + (subscriptionResult.data?.length ?? 0) + (agencyResult.data?.length ?? 0)),
    message: "Invoice subscription state reconciled.",
    status: 200
  };
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
        stripe_customer_id: session.customer ?? null,
        stripe_subscription_id: session.subscription ?? null,
        current_period_start: now.toISOString(),
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

  if (plan.type === "agency_subscription") {
    const { data: agency } = await supabase
      .from("agency_profiles")
      .select("id")
      .eq("owner_user_id", userId)
      .maybeSingle();
    if (!agency) return { ok: true, reconciled: false, message: "Checkout account does not own an agency.", status: 200 };

    const { error } = await supabase.from("agency_subscriptions").upsert(
      {
        agency_id: agency.id,
        user_id: userId,
        plan_code: plan.code,
        price_cents: plan.priceCents,
        status: "active",
        stripe_customer_id: session.customer ?? null,
        stripe_subscription_id: session.subscription ?? null,
        current_period_start: now.toISOString(),
        current_period_end: currentPeriodEnd
      },
      { onConflict: "agency_id" }
    );

    if (error) return { ok: false, reconciled: false, message: error.message, status: 500 };
    await writeBillingAudit(userId, "checkout_agency_plan_paid", "agency_subscription", session.id, {
      eventId,
      planCode: plan.code,
      customer: session.customer ?? null,
      subscription: session.subscription ?? null
    });
    return { ok: true, reconciled: true, message: "Agency plan reconciled.", status: 200 };
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
        stripe_customer_id: session.customer ?? null,
        stripe_subscription_id: session.subscription ?? null,
        current_period_start: now.toISOString(),
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
  actorId: string | null,
  action: string,
  entityType: string,
  entityId: string,
  metadata: Record<string, unknown>
) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  await supabase.from("audit_logs").insert({
    actor_id: actorId,
    action: "update",
    entity_type: entityType,
    entity_id: null,
    metadata: {
      ...metadata,
      billing_action: action,
      external_entity_id: entityId
    }
  });
}

function mapStripeSubscriptionStatus(status?: string | null) {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid" || status === "incomplete") return "past_due";
  if (status === "canceled" || status === "cancelled" || status === "incomplete_expired") return "cancelled";
  return "inactive";
}

function preserveActivationWindow(status: string, activationEffectiveAt?: string | null) {
  if (status !== "active" || !activationEffectiveAt) return status;
  return new Date(activationEffectiveAt).getTime() > Date.now() ? "pending_activation" : "active";
}

function stripeTimestamp(timestamp?: number | null) {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
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
