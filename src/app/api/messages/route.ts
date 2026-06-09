import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const messageSchema = z.object({
  jobId: z.string().uuid(),
  body: z.string().trim().min(2).max(1200)
});

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before sending a message." }, { status: 401 });
  }

  const limit = await rateLimit({ key: `messages:${user.id}`, limit: 30, windowMs: 10 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "You are sending messages too quickly. Please wait a moment." }, { status: 429 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Messaging is temporarily unavailable." }, { status: 503 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = messageSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Write a message before sending." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Messaging is temporarily unavailable." }, { status: 503 });
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, customer_id, assigned_tradie_id")
    .eq("id", parsed.data.jobId)
    .maybeSingle();

  const { data: tradie } = await supabase.from("tradie_profiles").select("id").eq("user_id", user.id).maybeSingle();
  const canMessage =
    user.role === "admin" ||
    user.role === "super_admin" ||
    job?.customer_id === user.id ||
    (tradie?.id && job?.assigned_tradie_id === tradie.id);

  if (!job || !canMessage) {
    return NextResponse.json({ error: "You do not have access to message on this job." }, { status: 403 });
  }

  const senderName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();
  const senderLabel = senderName || (user.role === "tradie" ? "Fixer" : user.role === "customer" ? "Customer" : "Fixit247");

  const { data: message, error } = await supabase
    .from("job_messages")
    .insert({
      job_id: parsed.data.jobId,
      sender_user_id: user.id,
      sender_label: senderLabel,
      body: parsed.data.body
    })
    .select("id, sender_label, body, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath(`/dashboard/customer/jobs/${parsed.data.jobId}`);
  revalidatePath(`/dashboard/tradie/jobs/${parsed.data.jobId}`);
  revalidatePath(`/admin/jobs/${parsed.data.jobId}`);

  return NextResponse.json({ ok: true, message });
}
