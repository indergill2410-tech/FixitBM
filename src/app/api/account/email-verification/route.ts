import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { sendAppEmailVerification } from "@/lib/email-verification";
import { rateLimit } from "@/lib/rate-limit";

export async function POST() {
  const user = await getCurrentAppUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Sign in to verify your email." }, { status: 401 });
  }

  if (user.email_verified_at) {
    return NextResponse.json({ ok: true, message: "Email is already verified." });
  }

  const limit = await rateLimit({ key: `verify-email:${user.id}`, limit: 3, windowMs: 15 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Verification email already sent. Please check your inbox and try again in 15 minutes." },
      { status: 429 }
    );
  }

  const result = await sendAppEmailVerification({
    userId: user.id,
    email: user.email,
    firstName: user.first_name
  });

  if (!result.ok && !result.skipped) {
    return NextResponse.json({ error: result.error || "Verification email could not be sent." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: "Verification email sent. Check your inbox." });
}
