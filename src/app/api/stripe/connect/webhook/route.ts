import { NextResponse } from "next/server";
import { syncConnectAccount } from "@/lib/connect";

type StripeConnectEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: { id?: string };
  };
};

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (!process.env.STRIPE_CONNECT_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Connect webhook verification is temporarily unavailable." }, { status: 503 });
  }

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const verified = await verifyStripeSignature(payload, signature, process.env.STRIPE_CONNECT_WEBHOOK_SECRET);
  if (!verified) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeConnectEvent;
  try {
    event = JSON.parse(payload) as StripeConnectEvent;
  } catch {
    return NextResponse.json({ error: "Invalid event payload." }, { status: 400 });
  }

  if (event.type === "account.updated") {
    const accountId = event.data?.object?.id;
    if (accountId) {
      try {
        await syncConnectAccount(accountId);
      } catch {
        // Non-fatal — return 200 so Stripe does not retry endlessly
      }
    }
  }

  return NextResponse.json({ received: true, eventId: event.id ?? null, type: event.type ?? null });
}

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) return false;
  const ageSeconds = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(ageSeconds) || ageSeconds > 300) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signedPayload = `${timestamp}.${payload}`;
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expected = Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

  return timingSafeEqual(expected, signature);
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}
