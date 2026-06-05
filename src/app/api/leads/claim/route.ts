import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const jobId = String(formData.get("jobId") ?? "");
  const user = await getCurrentAppUser();
  const redirectUrl = new URL("/dashboard/tradie/leads", request.url);

  if (!jobId || !user || user.role !== "tradie") {
    redirectUrl.searchParams.set("claim", "denied");
    return NextResponse.redirect(redirectUrl);
  }

  if (!isSupabaseServerConfigured()) {
    redirectUrl.searchParams.set("claim", "config");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    redirectUrl.searchParams.set("claim", "config");
    return NextResponse.redirect(redirectUrl);
  }

  const { data: tradie } = await supabase.from("tradie_profiles").select("id").eq("user_id", user.id).maybeSingle();
  if (!tradie) {
    redirectUrl.searchParams.set("claim", "profile");
    return NextResponse.redirect(redirectUrl);
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, credit_cost, status, lead_claim_limit")
    .eq("id", jobId)
    .is("assigned_tradie_id", null)
    .maybeSingle();

  if (!job || !["received", "matching"].includes(job.status)) {
    redirectUrl.searchParams.set("claim", "unavailable");
    return NextResponse.redirect(redirectUrl);
  }

  const { count: claimCount } = await supabase
    .from("lead_claims")
    .select("id", { count: "exact", head: true })
    .eq("job_id", jobId)
    .in("status", ["claimed", "accepted"]);

  if ((claimCount ?? 0) >= job.lead_claim_limit) {
    redirectUrl.searchParams.set("claim", "full");
    return NextResponse.redirect(redirectUrl);
  }

  const { data: wallet } = await supabase
    .from("tradie_credit_wallets")
    .select("id, balance, bonus_balance, bonus_expires_at, lifetime_used")
    .eq("tradie_id", tradie.id)
    .maybeSingle();

  const bonusIsValid = wallet?.bonus_expires_at ? new Date(wallet.bonus_expires_at).getTime() > Date.now() : false;
  const availableBonus = bonusIsValid ? wallet?.bonus_balance ?? 0 : 0;
  const availableCredits = (wallet?.balance ?? 0) + availableBonus;

  if (!wallet || availableCredits < job.credit_cost) {
    redirectUrl.searchParams.set("claim", "credits");
    return NextResponse.redirect(redirectUrl);
  }

  const paidSpend = Math.min(wallet.balance, job.credit_cost);
  const bonusSpend = job.credit_cost - paidSpend;

  const { error: claimError } = await supabase.from("lead_claims").upsert(
    {
      job_id: jobId,
      tradie_id: tradie.id,
      status: "claimed",
      match_score: 88,
      credit_cost: job.credit_cost,
      credits_spent: job.credit_cost
    },
    { onConflict: "job_id,tradie_id" }
  );

  if (claimError) {
    redirectUrl.searchParams.set("claim", "error");
    return NextResponse.redirect(redirectUrl);
  }

  await supabase
    .from("tradie_credit_wallets")
    .update({
      balance: wallet.balance - paidSpend,
      bonus_balance: Math.max(0, wallet.bonus_balance - bonusSpend),
      lifetime_used: wallet.lifetime_used + job.credit_cost
    })
    .eq("id", wallet.id);

  await supabase.from("credit_transactions").insert({
    wallet_id: wallet.id,
    type: "spend",
    amount: -job.credit_cost,
    reason: `Lead claimed (${paidSpend} paid credits, ${bonusSpend} bonus credits)`,
    job_id: jobId,
    created_by: user.id
  });

  await supabase.from("jobs").update({ status: "matching" }).eq("id", jobId);

  revalidatePath("/dashboard/tradie/leads");
  redirectUrl.searchParams.set("claim", "success");
  return NextResponse.redirect(redirectUrl);
}
