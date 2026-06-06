import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";
import { maxVerificationBytes, storagePath, verificationBucket, verificationTypes } from "@/lib/uploads";

const allowedDocumentTypes = new Set(["licence", "insurance", "abn", "id", "police_check"]);

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user || !["tradie", "admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Fixer access required." }, { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Document upload is temporarily unavailable." }, { status: 503 });
  }

  const formData = await request.formData();
  const documentType = String(formData.get("documentType") ?? "");
  const file = formData.get("file");

  if (!allowedDocumentTypes.has(documentType) || !(file instanceof File)) {
    return NextResponse.json({ error: "Choose a valid document type and file." }, { status: 400 });
  }

  if (!verificationTypes.includes(file.type) || file.size > maxVerificationBytes) {
    return NextResponse.json({ error: "Upload a JPG, PNG, WebP, or PDF under 15MB." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Document upload is temporarily unavailable." }, { status: 503 });
  }

  const { data: tradie } = await supabase.from("tradie_profiles").select("id").eq("user_id", user.id).maybeSingle();

  if (!tradie) {
    return NextResponse.json({ error: "Fixer profile not found." }, { status: 404 });
  }

  const path = storagePath(["tradies", tradie.id, documentType], file.name);
  const bytes = await file.arrayBuffer();

  const { error: uploadError } = await supabase.storage.from(verificationBucket).upload(path, bytes, {
    contentType: file.type,
    upsert: false
  });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: document, error: recordError } = await supabase
    .from("verification_documents")
    .insert({
      tradie_id: tradie.id,
      type: documentType,
      status: "pending",
      file_url: path,
      notes: "Uploaded by Fixer"
    })
    .select("id, file_url, status")
    .single();

  if (recordError) {
    return NextResponse.json({ error: recordError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, document });
}
