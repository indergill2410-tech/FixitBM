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
      message: "Stripe customer portal is not configured yet. Add STRIPE_SECRET_KEY and connect Stripe customer IDs."
    });
  }

  return NextResponse.json({
    configured: false,
    message: "Stripe portal route is prepared, but live portal creation is intentionally disabled until Stripe SDK setup."
  });
}
