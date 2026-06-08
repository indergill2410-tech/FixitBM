import { NextResponse, type NextRequest } from "next/server";
import { verifyEmailVerificationToken } from "@/lib/email-verification";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  const verified = token ? verifyEmailVerificationToken(token) : null;
  const redirectTo = request.nextUrl.clone();

  redirectTo.pathname = "/dashboard/tradie";
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

  const { error } = await supabase
    .from("users")
    .update({ email_verified_at: new Date().toISOString() })
    .eq("id", verified.userId)
    .eq("email", verified.email);

  redirectTo.searchParams.set("emailVerified", error ? "failed" : "success");
  return NextResponse.redirect(redirectTo);
}
