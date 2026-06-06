import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { stripeRequest } from "@/lib/billing";

type StripeCustomerList = {
  data?: Array<{ id: string }>;
};

type StripeCustomer = {
  id: string;
};

type StripePortalSession = {
  url: string;
};

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before opening the billing portal." }, { status: 401 });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({
      message: "Billing management is temporarily unavailable."
    });
  }

  if (!user.email) {
    return NextResponse.json({ error: "Add an email address before opening billing management." }, { status: 400 });
  }

  const origin = new URL(request.url).origin;

  try {
    const customer = await findOrCreateStripeCustomer(user.id, user.email);
    const body = new URLSearchParams({
      customer: customer.id,
      return_url: `${origin}/dashboard`
    });

    const session = await stripeRequest<StripePortalSession>("/billing_portal/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Billing management is temporarily unavailable." },
      { status: 502 }
    );
  }
}

async function findOrCreateStripeCustomer(userId: string, email: string) {
  const list = await stripeRequest<StripeCustomerList>(`/customers?email=${encodeURIComponent(email)}&limit=1`);
  const existing = list.data?.[0];
  if (existing) return existing;

  const body = new URLSearchParams({
    email,
    "metadata[user_id]": userId
  });

  return stripeRequest<StripeCustomer>("/customers", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });
}
