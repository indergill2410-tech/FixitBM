import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";
import { maxSafetyCheckPhotoBytes, safetyCheckPhotoBucket, safetyCheckPhotoTypes, storagePath } from "@/lib/uploads";

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in before uploading inspection photos." }, { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Photo upload is temporarily unavailable." }, { status: 503 });
  }

  const formData = await request.formData();
  const safetyCheckId = String(formData.get("safetyCheckId") ?? "");
  const categoryKey = String(formData.get("categoryKey") ?? "").slice(0, 60) || null;
  const caption = String(formData.get("caption") ?? "").slice(0, 160) || null;
  const file = formData.get("file");

  if (!safetyCheckId || !(file instanceof File)) {
    return NextResponse.json({ error: "Choose a Safety Check and a file." }, { status: 400 });
  }

  if (!safetyCheckPhotoTypes.includes(file.type) || file.size > maxSafetyCheckPhotoBytes) {
    return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image under 10MB." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Photo upload is temporarily unavailable." }, { status: 503 });
  }

  const { data: check } = await supabase
    .from("safety_checks")
    .select("id, customer_id, assigned_fixer_id")
    .eq("id", safetyCheckId)
    .maybeSingle();

  const { data: tradie } = await supabase.from("tradie_profiles").select("id").eq("user_id", user.id).maybeSingle();
  const canUpload =
    user.role === "admin" ||
    user.role === "super_admin" ||
    (tradie?.id && check?.assigned_fixer_id === tradie.id);

  if (!check || !canUpload) {
    return NextResponse.json({ error: "Only the assigned Fixer can add photos for this check." }, { status: 403 });
  }

  const path = storagePath(["safety-checks", safetyCheckId], file.name);
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(safetyCheckPhotoBucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: record, error: recordError } = await supabase
    .from("safety_check_photos")
    .insert({
      safety_check_id: safetyCheckId,
      file_url: path,
      file_name: file.name,
      content_type: file.type,
      category_key: categoryKey,
      caption
    })
    .select("id, file_url, caption, category_key")
    .single();

  if (recordError) {
    return NextResponse.json({ error: recordError.message }, { status: 500 });
  }

  const { data: signed } = await supabase.storage.from(safetyCheckPhotoBucket).createSignedUrl(path, 60 * 60);

  return NextResponse.json({ ok: true, photo: { ...record, signed_url: signed?.signedUrl ?? null } });
}
