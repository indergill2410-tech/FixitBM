import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";
import { jobPhotoBucket, jobPhotoTypes, maxJobPhotoBytes, storagePath } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before uploading job photos." }, { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Photo upload is temporarily unavailable." }, { status: 503 });
  }

  const formData = await request.formData();
  const jobId = String(formData.get("jobId") ?? "");
  const file = formData.get("file");

  if (!jobId || !(file instanceof File)) {
    return NextResponse.json({ error: "Choose a job and file." }, { status: 400 });
  }

  if (!jobPhotoTypes.includes(file.type) || file.size > maxJobPhotoBytes) {
    return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image under 10MB." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Photo upload is temporarily unavailable." }, { status: 503 });
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id, customer_id, assigned_tradie_id")
    .eq("id", jobId)
    .maybeSingle();

  const { data: tradie } = await supabase.from("tradie_profiles").select("id").eq("user_id", user.id).maybeSingle();
  const canUpload =
    user.role === "admin" ||
    user.role === "super_admin" ||
    job?.customer_id === user.id ||
    (tradie?.id && job?.assigned_tradie_id === tradie.id);

  if (!job || !canUpload) {
    return NextResponse.json({ error: "You do not have access to upload photos for this job." }, { status: 403 });
  }

  const path = storagePath(["jobs", jobId], file.name);
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(jobPhotoBucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: record, error: recordError } = await supabase
    .from("job_photos")
    .insert({
      job_id: jobId,
      file_url: path,
      file_name: file.name,
      content_type: file.type
    })
    .select("id, file_url")
    .single();

  if (recordError) {
    return NextResponse.json({ error: recordError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, photo: record });
}
