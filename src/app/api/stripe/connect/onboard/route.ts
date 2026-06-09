import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { createConnectAccount, createOnboardingLink, getConnectAccount } from "@/lib/connect";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  let user;
  try {
    user = await requireRole(["tradie"]);
  } catch {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Database is temporarily unavailable." }, { status: 503 });
  }

  const { data: tradie } = await supabase
    .from("tradie_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!tradie) {
    return NextResponse.json({ error: "Fixer profile not found." }, { status: 404 });
  }

  const { data: userData } = await supabase
    .from("users")
    .select("email")
    .eq("id", user.id)
    .maybeSingle();

  const email = userData?.email ?? user.email ?? "";

  const existing = await getConnectAccount(tradie.id);
  const accountId = existing?.stripe_account_id ?? (await createConnectAccount(tradie.id, email)).accountId;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://fixit247.com.au";
  const returnUrl = `${baseUrl}/dashboard/tradie/payouts`;
  const refreshUrl = `${baseUrl}/dashboard/tradie/payouts`;

  try {
    const url = await createOnboardingLink(accountId, returnUrl, refreshUrl);
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create onboarding link.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
