import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { getEmailRuntimeStatus, sendTransactionalEmail } from "@/lib/email";

const emailTestSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const authorized = await isAuthorized(request);
  if (!authorized) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const parsed = emailTestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid recipient email." }, { status: 400 });
  }

  const status = getEmailRuntimeStatus();
  const result = await sendTransactionalEmail({
    to: parsed.data.email,
    subject: "Fixit247 email test",
    category: "email_test",
    eyebrow: "Email test",
    title: "Fixit247 email is connected.",
    intro:
      "This confirms the production app can send through the Resend account. Newsletter, agency, support, request, and Safety Check emails use the same delivery layer.",
    sections: [
      {
        label: "Runtime check",
        lines: [
          `Sender: ${status.fromEmail}`,
          `Support reply-to: ${status.supportEmail}`,
          `Site URL: ${status.appUrl}`
        ]
      }
    ],
    cta: { label: "Open Fixit247", href: status.appUrl },
    idempotencyKey: `email-test-${parsed.data.email.toLowerCase()}-${Date.now()}`
  });

  return NextResponse.json({
    ok: result.ok,
    skipped: result.skipped ?? false,
    error: result.error ?? null,
    providerId: result.providerId ?? null,
    statusCode: result.statusCode ?? null
  });
}

async function isAuthorized(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
  if (process.env.CRON_SECRET && token === process.env.CRON_SECRET) return true;

  const user = await getCurrentAppUser();
  return Boolean(user && ["admin", "super_admin"].includes(user.role));
}
