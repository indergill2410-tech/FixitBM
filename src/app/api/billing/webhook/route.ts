import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        configured: false,
        message: "Stripe webhook secret is not configured yet."
      },
      { status: 503 }
    );
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  return NextResponse.json({
    received: true,
    message:
      "Webhook endpoint is prepared. Event signature verification and subscription updates will be enabled when the Stripe SDK is installed."
  });
}
