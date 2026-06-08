import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyNewsletterSignup } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const newsletterSchema = z.object({
  email: z.string().email(),
  source: z.string().max(80).optional()
});

export async function POST(request: Request) {
  const limit = rateLimit({
    key: `newsletter:${getClientIp(request)}`,
    limit: 5,
    windowMs: 60 * 60 * 1000
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Too many signup attempts. Please try again later." }, { status: 429 });
  }

  const parsed = newsletterSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Newsletter signup is temporarily unavailable. Please try again shortly." }, { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Newsletter signup is temporarily unavailable." }, { status: 503 });
  }

  const { error } = await supabase.from("newsletter_subscribers").upsert(
    {
      email: parsed.data.email.toLowerCase(),
      source: parsed.data.source ?? "site",
      status: "subscribed"
    },
    { onConflict: "email" }
  );

  if (error) {
    console.error("Fixit247 newsletter signup failed", error.message);
    return NextResponse.json({ error: "We could not save your signup yet. Please try again shortly." }, { status: 500 });
  }

  await notifyNewsletterSignup({ email: parsed.data.email.toLowerCase(), source: parsed.data.source });

  return NextResponse.json({ message: "Thanks. You're on the list." });
}
