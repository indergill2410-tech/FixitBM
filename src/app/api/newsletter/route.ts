import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const newsletterSchema = z.object({
  email: z.string().email(),
  source: z.string().max(80).optional()
});

export async function POST(request: Request) {
  const parsed = newsletterSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({
      configured: false,
      message: "Thanks. Newsletter storage will activate when Supabase server keys are configured."
    });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Newsletter storage is not configured." }, { status: 503 });
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
    return NextResponse.json({
      configured: false,
      message: "Thanks. You're on the list."
    });
  }

  return NextResponse.json({ message: "Thanks. You're on the list." });
}
