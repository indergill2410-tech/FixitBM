import crypto from "crypto";
import { sendTransactionalEmail } from "@/lib/email";
import { appUrl } from "@/lib/seo";

const tokenTtlMs = 1000 * 60 * 60 * 24;

export function createEmailVerificationToken(input: { userId: string; email: string }) {
  const expiresAt = Date.now() + tokenTtlMs;
  const payload = `${input.userId}.${input.email.toLowerCase()}.${expiresAt}`;
  const signature = crypto.createHmac("sha256", verificationSecret()).update(payload).digest("base64url");
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifyEmailVerificationToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, email, expiresAtValue, signature] = decoded.split(".");

    if (!userId || !email || !expiresAtValue || !signature) return null;
    const expiresAt = Number(expiresAtValue);
    if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;

    const payload = `${userId}.${email}.${expiresAt}`;
    const expected = crypto.createHmac("sha256", verificationSecret()).update(payload).digest("base64url");
    const isValid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

    return isValid ? { userId, email } : null;
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
    idempotencyKey: `email-verify-${input.userId}-${Date.now()}`
  });
}

function verificationSecret() {
  return process.env.EMAIL_VERIFICATION_SECRET || process.env.CRON_SECRET || process.env.SUPABASE_SECRET_KEY || "fixit247-dev-email-verification";
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}
