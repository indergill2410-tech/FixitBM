import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");

  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
  }

  return renewBonusCredits(null);
}

export async function POST() {
  const user = await getCurrentAppUser();

  if (!user || !["admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  return renewBonusCredits(user.id);
}

async function renewBonusCredits(actorId: string | null) {
  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase server key is not configured." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const now = new Date().toISOString();
  const { data: wallets, error } = await supabase
    .from("tradie_credit_wallets")
    .select("id, bonus_balance, bonus_monthly_amount, bonus_months_total, bonus_months_granted, bonus_next_renewal_at")
    .lte("bonus_next_renewal_at", now)
    .lt("bonus_months_granted", 6);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let renewed = 0;

  for (const wallet of wallets ?? []) {
    const monthlyAmount = wallet.bonus_monthly_amount ?? 111;
    const monthsGranted = (wallet.bonus_months_granted ?? 0) + 1;
    const nextRenewal =
      monthsGranted < (wallet.bonus_months_total ?? 6)
        ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString()
        : null;

    const { error: updateError } = await supabase
      .from("tradie_credit_wallets")
      .update({
        bonus_balance: (wallet.bonus_balance ?? 0) + monthlyAmount,
        bonus_months_granted: monthsGranted,
        bonus_next_renewal_at: nextRenewal
      })
      .eq("id", wallet.id);

    if (!updateError) {
      renewed += 1;
      await supabase.from("credit_transactions").insert({
        wallet_id: wallet.id,
        type: "bonus",
        amount: monthlyAmount,
        reason: `Monthly signup bonus credits: month ${monthsGranted} of ${wallet.bonus_months_total ?? 6}`,
        created_by: actorId
      });
    }
  }

  return NextResponse.json({ renewed });
}
