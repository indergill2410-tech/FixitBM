import { NextResponse, type NextRequest } from "next/server";
import { verifyEmailVerificationToken } from "@/lib/email-verification";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type AccountRole = "customer" | "agency" | "tradie" | "admin" | "super_admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const verified = token ? verifyEmailVerificationToken(token) : null;
  const redirectTo = request.nextUrl.clone();

  redirectTo.pathname = "/login";
  redirectTo.search = "";

  if (!verified) {
    redirectTo.searchParams.set("emailVerified", "invalid");
    return NextResponse.redirect(redirectTo);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    redirectTo.searchParams.set("emailVerified", "failed");
    return NextResponse.redirect(redirectTo);
  }

  const { data: appUser, error: userError } = await supabase
    .from("users")
    .select("id, email, auth_id, role")
    .eq("id", verified.userId)
    .maybeSingle();

  if (userError || !appUser || appUser.email?.toLowerCase() !== verified.email) {
    redirectTo.searchParams.set("emailVerified", "failed");
    return NextResponse.redirect(redirectTo);
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", verified.userId)
    .eq("email", appUser.email);

  if (updateError) {
    redirectTo.pathname = "/login";
    redirectTo.searchParams.set("emailVerified", "failed");
    return NextResponse.redirect(redirectTo);
  }

  if (appUser.auth_id) {
    const { error: authError } = await supabase.auth.admin.updateUserById(appUser.auth_id, { email_confirm: true });
    if (authError) {
      console.error("Failed to confirm email in Supabase Auth", authError.message);
    }
  }

  redirectTo.pathname = roleHomeFor(appUser.role as AccountRole);
  redirectTo.searchParams.set("emailVerified", "success");
  return NextResponse.redirect(redirectTo);
}

function roleHomeFor(role: AccountRole) {
  if (role === "agency") return "/dashboard/agency";
  if (role === "tradie") return "/dashboard/tradie";
  if (role === "admin" || role === "super_admin") return "/admin";
  return "/dashboard/customer";
}
