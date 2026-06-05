"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type AdminActionState = {
  ok?: boolean;
  message?: string;
};

const statusSchema = z.object({
  jobId: z.string().uuid(),
  status: z.enum([
    "received",
    "matching",
    "tradie_accepted",
    "en_route",
    "on_site",
    "quote_provided",
    "work_in_progress",
    "completed",
    "reviewed",
    "closed",
    "cancelled",
    "disputed"
  ]),
  note: z.string().optional()
});

const assignSchema = z.object({
  jobId: z.string().uuid(),
  tradieId: z.string().uuid()
});

const verificationSchema = z.object({
  documentId: z.string().uuid(),
  status: z.enum(["approved", "rejected"]),
  notes: z.string().optional()
});

const refundSchema = z.object({
  leadClaimId: z.string().uuid(),
  reason: z.string().min(3)
});

function configError(): AdminActionState {
  return { ok: false, message: "Supabase server key is not configured." };
}

async function getAdminClient() {
  const user = await requireRole(["admin", "super_admin"]);

  if (!isSupabaseServerConfigured()) {
    return { user, supabase: null };
  }

  return { user, supabase: createSupabaseAdminClient() };
}

export async function updateJobStatusAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { user, supabase } = await getAdminClient();
  if (!supabase) return configError();

  const parsed = statusSchema.safeParse({
    jobId: formData.get("jobId"),
    status: formData.get("status"),
    note: formData.get("note") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose a valid job status." };
  }

  const { error } = await supabase.from("jobs").update({ status: parsed.data.status }).eq("id", parsed.data.jobId);

  if (error) return { ok: false, message: error.message };

  await supabase.from("job_status_events").insert({
    job_id: parsed.data.jobId,
    status: parsed.data.status,
    title: `Status changed to ${parsed.data.status.replaceAll("_", " ")}`,
    note: parsed.data.note || "Updated by admin command centre.",
    created_by: user.id
  });

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "change_status",
    entity_type: "job",
    entity_id: parsed.data.jobId,
    metadata: { status: parsed.data.status }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${parsed.data.jobId}`);

  return { ok: true, message: "Job status updated." };
}

export async function assignTradieAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { user, supabase } = await getAdminClient();
  if (!supabase) return configError();

  const parsed = assignSchema.safeParse({
    jobId: formData.get("jobId"),
    tradieId: formData.get("tradieId")
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid Fixer ID." };
  }

  const { error } = await supabase
    .from("jobs")
    .update({ assigned_tradie_id: parsed.data.tradieId, status: "tradie_accepted" })
    .eq("id", parsed.data.jobId);

  if (error) return { ok: false, message: error.message };

  await supabase.from("job_status_events").insert({
    job_id: parsed.data.jobId,
    status: "tradie_accepted",
    title: "Fixer assigned",
    note: "Assigned by admin command centre.",
    created_by: user.id
  });

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "assign_tradie",
    entity_type: "job",
    entity_id: parsed.data.jobId,
    metadata: { tradieId: parsed.data.tradieId }
  });

  revalidatePath("/admin");
  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${parsed.data.jobId}`);

  return { ok: true, message: "Fixer assigned." };
}

export async function reviewVerificationAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { user, supabase } = await getAdminClient();
  if (!supabase) return configError();

  const parsed = verificationSchema.safeParse({
    documentId: formData.get("documentId"),
    status: formData.get("status"),
    notes: formData.get("notes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose a valid verification decision." };
  }

  const { data: document, error: fetchError } = await supabase
    .from("verification_documents")
    .select("id, tradie_id")
    .eq("id", parsed.data.documentId)
    .single();

  if (fetchError || !document) return { ok: false, message: fetchError?.message ?? "Document not found." };

  const { error } = await supabase
    .from("verification_documents")
    .update({
      status: parsed.data.status,
      notes: parsed.data.notes || null,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq("id", parsed.data.documentId);

  if (error) return { ok: false, message: error.message };

  await supabase
    .from("tradie_profiles")
    .update({ verification_status: parsed.data.status })
    .eq("id", document.tradie_id);

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: parsed.data.status === "approved" ? "approve_verification" : "reject_verification",
    entity_type: "verification_document",
    entity_id: parsed.data.documentId,
    metadata: { notes: parsed.data.notes ?? null }
  });

  revalidatePath("/admin/tradies/verification");

  return { ok: true, message: `Verification ${parsed.data.status}.` };
}

export async function refundLeadCreditsAction(
  _state: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const { user, supabase } = await getAdminClient();
  if (!supabase) return configError();

  const parsed = refundSchema.safeParse({
    leadClaimId: formData.get("leadClaimId"),
    reason: formData.get("reason")
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid lead claim and refund reason." };
  }

  const { data: claim, error: claimError } = await supabase
    .from("lead_claims")
    .select("id, job_id, tradie_id, credits_spent, status")
    .eq("id", parsed.data.leadClaimId)
    .single();

  if (claimError || !claim) return { ok: false, message: claimError?.message ?? "Lead claim not found." };
  if (claim.status === "refunded") return { ok: false, message: "Lead claim already refunded." };

  const { data: wallet, error: walletError } = await supabase
    .from("tradie_credit_wallets")
    .select("id, balance")
    .eq("tradie_id", claim.tradie_id)
    .single();

  if (walletError || !wallet) return { ok: false, message: walletError?.message ?? "Wallet not found." };

  await supabase
    .from("tradie_credit_wallets")
    .update({ balance: wallet.balance + claim.credits_spent })
    .eq("id", wallet.id);

  await supabase.from("credit_transactions").insert({
    wallet_id: wallet.id,
    type: "refund",
    amount: claim.credits_spent,
    reason: parsed.data.reason,
    job_id: claim.job_id,
    created_by: user.id
  });

  await supabase
    .from("lead_claims")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
      admin_notes: parsed.data.reason
    })
    .eq("id", claim.id);

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "refund_credits",
    entity_type: "lead_claim",
    entity_id: claim.id,
    metadata: { amount: claim.credits_spent, reason: parsed.data.reason }
  });

  revalidatePath("/admin/credits");
  revalidatePath("/admin/disputes");

  return { ok: true, message: "Lead credits refunded." };
}
