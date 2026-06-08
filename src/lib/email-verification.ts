import crypto from "crypto";
import { sendTransactionalEmail } from "@/lib/email";
import { appUrl } from "@/lib/seo";

const tokenTtlMs = 1000 * 60 * 60 * 24;

export function createEmailVerificationToken(input: { userId: string; email: string }) {
  const expiresAt = Date.now() + tokenTtlMs;
  const payload = Buffer.from(
    JSON.stringify({
      userId: input.userId,
      email: input.email.toLowerCase(),
      expiresAt
    })
  ).toString("base64url");
  const signature = crypto.createHmac("sha256", verificationSecret()).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

export function verifyEmailVerificationToken(token: string) {
  try {
    const [payload, signature, extra] = token.split(".");
    if (!payload || !signature || extra) return null;

    const expected = crypto.createHmac("sha256", verificationSecret()).update(payload).digest("base64url");
    const isValid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

    if (!isValid) return null;

    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as unknown;
    if (!isVerificationPayload(decoded) || decoded.expiresAt < Date.now()) return null;

    return { userId: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

export async function sendAppEmailVerification(input: { userId: string; email: string; firstName?: string | null }) {
  const token = createEmailVerificationToken({ userId: input.userId, email: input.email });
  const href = `${trimTrailingSlash(appUrl)}/account/verify-email?token=${encodeURIComponent(token)}`;

  return sendTransactionalEmail({
    to: input.email,
    subject: "Verify your Fixit247 email",
    eyebrow: "Email verification",
    title: `Confirm your email${input.firstName ? `, ${input.firstName}` : ""}.`,
    intro: "Confirm this email address so Fixit247 can use it for onboarding, support, and important account updates.",
    sections: [
      {
        label: "Fixer onboarding",
        lines: ["This link expires in 24 hours.", "You can keep completing your Fixer dashboard while this is pending."]
      }
    ],
    cta: { label: "Verify email", href },
    idempotencyKey: `email-verify-${input.userId}-${Math.floor(Date.now() / (1000 * 60 * 5))}`
  });
}

function isVerificationPayload(value: unknown): value is { userId: string; email: string; expiresAt: number } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { userId?: unknown }).userId === "string" &&
    typeof (value as { email?: unknown }).email === "string" &&
    typeof (value as { expiresAt?: unknown }).expiresAt === "number"
  );
}

function verificationSecret() {
  return process.env.EMAIL_VERIFICATION_SECRET || process.env.CRON_SECRET || process.env.SUPABASE_SECRET_KEY || "fixit247-dev-email-verification";
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
