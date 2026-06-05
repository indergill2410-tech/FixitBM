import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const allowedTransitions = {
  tradie_accepted: ["en_route"],
  en_route: ["on_site"],
  on_site: ["work_in_progress"],
  quote_provided: ["work_in_progress"],
  work_in_progress: ["completed"]
} as const;

const statusSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum(["en_route", "on_site", "work_in_progress", "completed"])
});

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user || user.role !== "tradie") {
    return NextResponse.json({ error: "Tradie access required." }, { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase server key is not configured." }, { status: 503 });
  }

  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a valid job status." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const { data: tradie } = await supabase.from("tradie_profiles").select("id").eq("user_id", user.id).maybeSingle();
  if (!tradie) return NextResponse.json({ error: "Tradie profile not found." }, { status: 404 });

  const { data: job } = await supabase
    .from("jobs")
    .select("id, status, assigned_tradie_id")
    .eq("id", parsed.data.jobId)
    .eq("assigned_tradie_id", tradie.id)
    .maybeSingle();

  if (!job) {
    return NextResponse.json({ error: "This job is not assigned to your trade profile." }, { status: 403 });
  }

  const nextAllowed = allowedTransitions[job.status as keyof typeof allowedTransitions] ?? [];
  if (!nextAllowed.includes(parsed.data.status as never)) {
    return NextResponse.json({ error: "This status change is not available for the current job stage." }, { status: 400 });
  }

  const { error } = await supabase.from("jobs").update({ status: parsed.data.status }).eq("id", job.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const title = `Tradie marked ${parsed.data.status.replaceAll("_", " ")}`;
  await supabase.from("job_status_events").insert({
    job_id: job.id,
    status: parsed.data.status,
    title,
    note: "Updated by assigned tradie.",
    created_by: user.id
  });

  await supabase.from("job_messages").insert({
    job_id: job.id,
    sender_user_id: user.id,
    sender_label: user.first_name || "Tradie",
    body: title
  });

  revalidatePath(`/dashboard/tradie/jobs/${job.id}`);
  revalidatePath(`/dashboard/customer/jobs/${job.id}`);
  revalidatePath("/dashboard/tradie");
  revalidatePath("/dashboard/tradie/jobs");
  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${job.id}`);

  return NextResponse.json({ ok: true });
}
