import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";

export async function POST() {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before opening the billing portal." }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      configured: false,
      message: "Billing management is temporarily unavailable."
    });
  }

  return NextResponse.json({
    configured: false,
    message: "Billing management is temporarily unavailable."
  });
}
