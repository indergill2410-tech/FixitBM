import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const reviewSchema = z.object({
  jobId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(800).optional()
});

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user || user.role !== "customer") {
    return NextResponse.json({ error: "Customer access required." }, { status: 401 });
  }

  const limit = await rateLimit({ key: `reviews:${user.id}`, limit: 10, windowMs: 60 * 60 * 1000 });
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many reviews submitted. Please try again later." }, { status: 429 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Review saving is temporarily unavailable." }, { status: 503 });
  }

  const parsed = reviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a rating before saving." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Review saving is temporarily unavailable." }, { status: 503 });
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, customer_id, assigned_tradie_id, status")
    .eq("id", parsed.data.jobId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!job || !["completed", "closed", "reviewed"].includes(job.status)) {
    return NextResponse.json({ error: "Only completed jobs can be reviewed." }, { status: 403 });
  }

  if (!job.assigned_tradie_id) {
    return NextResponse.json({ error: "This request has no assigned Fixer to review." }, { status: 400 });
  }

  const { data: tradie } = await supabase
    .from("tradie_profiles")
    .select("user_id")
    .eq("id", job.assigned_tradie_id)
    .maybeSingle();

  if (!tradie?.user_id) {
    return NextResponse.json({ error: "Fixer profile could not be found." }, { status: 404 });
  }

  const reviewPayload = {
    job_id: job.id,
    reviewer_id: user.id,
    reviewee_id: tradie.user_id,
    rating: parsed.data.rating,
    comment: parsed.data.comment || null
  };

  const { data: existingReview } = await supabase
    .from("reviews")
    .select("id")
    .eq("job_id", job.id)
    .eq("reviewer_id", user.id)
    .maybeSingle();

  const { error } = existingReview
    ? await supabase.from("reviews").update(reviewPayload).eq("id", existingReview.id)
    : await supabase.from("reviews").insert(reviewPayload);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("jobs").update({ status: "reviewed" }).eq("id", job.id);

  // Recompute and persist the fixer's aggregate rating
  const { data: ratingRows } = await supabase
    .from("reviews")
    .select("rating")
    .eq("reviewee_id", tradie.user_id);
  if (ratingRows && ratingRows.length > 0) {
    const avg = ratingRows.reduce((s, r) => s + r.rating, 0) / ratingRows.length;
    await supabase
      .from("tradie_profiles")
      .update({ rating: Math.round(avg * 10) / 10 })
      .eq("user_id", tradie.user_id);
  }

  revalidatePath(`/dashboard/customer/jobs/${job.id}`);
  revalidatePath("/dashboard/customer/reviews");
  revalidatePath("/dashboard/tradie/reviews");

  return NextResponse.json({ ok: true });
}
