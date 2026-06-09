import { stripeRequest } from "@/lib/billing";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type FixerPayoutAccount = {
  id: string;
  tradie_id: string;
  stripe_account_id: string;
  status: string;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  onboarding_complete: boolean;
};

type StripeAccount = {
  id: string;
  payouts_enabled: boolean;
  charges_enabled: boolean;
  details_submitted: boolean;
  requirements?: { disabled_reason?: string | null };
};

type StripeAccountLink = {
  url: string;
};

type StripeTransfer = {
  id: string;
};

export async function createConnectAccount(tradieId: string, email: string): Promise<{ accountId: string }> {
  const body = new URLSearchParams({
    type: "express",
    country: "AU",
    email,
    "metadata[tradie_id]": tradieId
  });

  const account = await stripeRequest<StripeAccount>("/accounts", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    await supabase.from("fixer_payout_accounts").upsert(
      {
        tradie_id: tradieId,
        stripe_account_id: account.id,
        status: "pending",
        payouts_enabled: false,
        charges_enabled: false,
        onboarding_complete: false,
        country: "AU",
        updated_at: new Date().toISOString()
      },
      { onConflict: "tradie_id" }
    );
  }

  return { accountId: account.id };
}

export async function createOnboardingLink(accountId: string, returnUrl: string, refreshUrl: string): Promise<string> {
  const body = new URLSearchParams({
    account: accountId,
    type: "account_onboarding",
    return_url: returnUrl,
    refresh_url: refreshUrl
  });

  const link = await stripeRequest<StripeAccountLink>("/account_links", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString()
  });

  return link.url;
}

export async function getConnectAccount(tradieId: string): Promise<FixerPayoutAccount | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("fixer_payout_accounts")
    .select("id, tradie_id, stripe_account_id, status, payouts_enabled, charges_enabled, onboarding_complete")
    .eq("tradie_id", tradieId)
    .maybeSingle();

  return data ?? null;
}

export async function syncConnectAccount(stripeAccountId: string): Promise<void> {
  const account = await stripeRequest<StripeAccount>(`/accounts/${stripeAccountId}`);

  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const disabledReason = account.requirements?.disabled_reason ?? null;
  let status = "pending";
  if (account.payouts_enabled && account.charges_enabled) {
    status = "active";
  } else if (disabledReason === "rejected.other" || disabledReason === "rejected.fraud") {
    status = "disabled";
  } else if (disabledReason) {
    status = "restricted";
  }

  await supabase
    .from("fixer_payout_accounts")
    .update({
      status,
      payouts_enabled: account.payouts_enabled,
      charges_enabled: account.charges_enabled,
      onboarding_complete: account.details_submitted,
      updated_at: new Date().toISOString()
    })
    .eq("stripe_account_id", stripeAccountId);
}

export async function createTransfer(
  jobId: string,
  tradieId: string,
  amountCents: number,
  note: string,
  adminUserId: string
): Promise<{ transferId: string }> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) throw new Error("Database is unavailable.");

  const { data: account } = await supabase
    .from("fixer_payout_accounts")
    .select("stripe_account_id")
    .eq("tradie_id", tradieId)
    .maybeSingle();

  if (!account) throw new Error("Fixer does not have a Connect account.");

  const idempotencyKey = `transfer-${jobId}-${tradieId}`;

  const body = new URLSearchParams({
    amount: String(amountCents),
    currency: "aud",
    destination: account.stripe_account_id,
    "metadata[job_id]": jobId,
    "metadata[tradie_id]": tradieId,
    "metadata[note]": note
  });

  const transfer = await stripeRequest<StripeTransfer>("/transfers", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": idempotencyKey
    },
    body: body.toString()
  });

  await supabase.from("fixer_payouts").insert({
    job_id: jobId,
    tradie_id: tradieId,
    stripe_account_id: account.stripe_account_id,
    stripe_transfer_id: transfer.id,
    amount_cents: amountCents,
    currency: "aud",
    status: "paid",
    note: note || null,
    created_by: adminUserId
  });

  return { transferId: transfer.id };
}
