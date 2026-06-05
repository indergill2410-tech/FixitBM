"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type ClaimGuestJobState = {
  ok?: boolean;
  message?: string;
};

const claimSchema = z.object({
  reference: z.string().min(4),
  phone: z.string().min(8)
});

export async function claimGuestJobAction(
  _state: ClaimGuestJobState,
  formData: FormData
): Promise<ClaimGuestJobState> {
  const user = await requireRole(["customer", "admin", "super_admin"]);

  if (!isSupabaseServerConfigured()) {
    return {
      ok: false,
      message: "Supabase server key is not configured yet. Add SUPABASE_SECRET_KEY to claim guest jobs."
    };
  }

  const parsed = claimSchema.safeParse({
    reference: formData.get("reference"),
    phone: formData.get("phone")
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter the job reference and the phone number used when posting." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured." };
  }

  const normalizedReference = parsed.data.reference.trim().toUpperCase();
  const normalizedPhone = parsed.data.phone.replace(/\s+/g, "");

  const { data: job, error: findError } = await supabase
    .from("jobs")
    .select("id, public_reference, guest_phone, customer_id")
    .eq("public_reference", normalizedReference)
    .maybeSingle();

  if (findError || !job) {
    return { ok: false, message: "No guest job was found for that reference." };
  }

  if (job.customer_id) {
    return { ok: false, message: "That job has already been claimed by an account." };
  }

  if (String(job.guest_phone ?? "").replace(/\s+/g, "") !== normalizedPhone) {
    return { ok: false, message: "The phone number does not match the guest request." };
  }

  const { error: updateError } = await supabase.from("jobs").update({ customer_id: user.id }).eq("id", job.id);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  await supabase.from("job_status_events").insert({
    job_id: job.id,
    status: "received",
    title: "Guest request claimed",
    note: "Customer account linked to original guest request.",
    created_by: user.id
  });

  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/customer/jobs");

  return { ok: true, message: `Job ${normalizedReference} is now linked to your account.` };
}
