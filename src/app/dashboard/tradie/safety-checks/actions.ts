"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { notifySafetyCheckReportPublished } from "@/lib/email";
import { getTradieProfileForUser } from "@/lib/jobs";
import { syncPropertySafeFromSafetyCheckReport } from "@/lib/propertysafe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type SafetyCheckReportState = {
  ok?: boolean;
  message?: string;
};

const itemStatusSchema = z.enum(["ok", "attention", "recommended", "not_checked"]);
const recommendationPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const reportSchema = z.object({
  safetyCheckId: z.string().uuid(),
  scoreBefore: z.coerce.number().int().min(0).max(100),
  scoreAfter: z.coerce.number().int().min(0).max(100),
  summary: z.string().min(12).max(2000)
});

type ReportItem = {
  category: string;
  label: string;
  status: z.infer<typeof itemStatusSchema>;
  notes: string | null;
};

type ReportRecommendation = {
  title: string;
  category: string | null;
  priority: z.infer<typeof recommendationPrioritySchema>;
  description: string | null;
  estimated_trade_type: string | null;
};

export async function submitSafetyCheckReportAction(
  _state: SafetyCheckReportState,
  formData: FormData
): Promise<SafetyCheckReportState> {
  const user = await requireRole(["tradie", "admin", "super_admin"]);

  if (!isSupabaseServerConfigured()) {
    return { ok: false, message: "Safety Check reporting is temporarily unavailable." };
  }

  const parsed = reportSchema.safeParse({
    safetyCheckId: formData.get("safetyCheckId"),
    scoreBefore: formData.get("scoreBefore"),
    scoreAfter: formData.get("scoreAfter"),
    summary: formData.get("summary")
  });

  if (!parsed.success) {
    return { ok: false, message: "Complete the score and summary before publishing the report." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, message: "Safety Check reporting is temporarily unavailable." };
  }

  const { data: safetyCheck, error: checkError } = await supabase
    .from("safety_checks")
    .select("id, customer_id, membership_id, property_id, assigned_fixer_id, status")
    .eq("id", parsed.data.safetyCheckId)
    .maybeSingle();

  if (checkError || !safetyCheck) {
    return { ok: false, message: "Safety Check not found." };
  }

  if (user.role === "tradie") {
    const profile = await getTradieProfileForUser(user);
    if (!profile || profile.id !== safetyCheck.assigned_fixer_id) {
      return { ok: false, message: "Only the assigned Fixer can publish this report." };
    }
  }

  const items = parseReportItems(formData);
  if (!items.length) {
    return { ok: false, message: "Add at least one checklist item." };
  }

  const recommendations = parseRecommendations(formData);
  const now = new Date().toISOString();
  const nextDue = new Date(Date.now() + 1000 * 60 * 60 * 24 * 183).toISOString();

  const { error: deleteItemsError } = await supabase.from("safety_check_items").delete().eq("safety_check_id", safetyCheck.id);
  if (deleteItemsError) return { ok: false, message: deleteItemsError.message };

  const { error: insertItemsError } = await supabase.from("safety_check_items").insert(
    items.map((item) => ({
      safety_check_id: safetyCheck.id,
      ...item
    }))
  );
  if (insertItemsError) return { ok: false, message: insertItemsError.message };

  const { error: deleteRecommendationsError } = await supabase
    .from("safety_check_recommendations")
    .delete()
    .eq("safety_check_id", safetyCheck.id)
    .eq("status", "recommended");
  if (deleteRecommendationsError) return { ok: false, message: deleteRecommendationsError.message };

  if (recommendations.length) {
    const { error: insertRecommendationsError } = await supabase.from("safety_check_recommendations").insert(
      recommendations.map((recommendation) => ({
        safety_check_id: safetyCheck.id,
        customer_id: safetyCheck.customer_id,
        property_id: safetyCheck.property_id,
        ...recommendation
      }))
    );
    if (insertRecommendationsError) return { ok: false, message: insertRecommendationsError.message };
  }

  const { error: scoreError } = await supabase.from("home_protection_scores").insert({
    customer_id: safetyCheck.customer_id,
    property_id: safetyCheck.property_id,
    score: parsed.data.scoreAfter,
    reason_summary: parsed.data.summary
  });
  if (scoreError) return { ok: false, message: scoreError.message };

  const { error: updateError } = await supabase
    .from("safety_checks")
    .update({
      status: "completed",
      completed_at: now,
      report_published_at: now,
      next_due_at: nextDue,
      score_before: parsed.data.scoreBefore,
      score_after: parsed.data.scoreAfter,
      summary: parsed.data.summary
    })
    .eq("id", safetyCheck.id);

  if (updateError) return { ok: false, message: updateError.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "publish_safety_check_report",
    entity_type: "safety_check",
    entity_id: safetyCheck.id,
    metadata: {
      scoreBefore: parsed.data.scoreBefore,
      scoreAfter: parsed.data.scoreAfter,
      recommendationCount: recommendations.length
    }
  });

  await syncPropertySafeFromSafetyCheckReport({
    safetyCheckId: safetyCheck.id,
    customerId: safetyCheck.customer_id,
    propertyId: safetyCheck.property_id,
    membershipId: safetyCheck.membership_id,
    scoreBefore: parsed.data.scoreBefore,
    scoreAfter: parsed.data.scoreAfter,
    summary: parsed.data.summary,
    items,
    recommendations,
    publishedAt: now,
    nextReviewAt: nextDue
  });

  const { data: customer } = await supabase
    .from("users")
    .select("email")
    .eq("id", safetyCheck.customer_id)
    .maybeSingle();

  await notifySafetyCheckReportPublished({
    safetyCheckId: safetyCheck.id,
    userEmail: customer?.email ?? null,
    scoreAfter: parsed.data.scoreAfter,
    recommendationCount: recommendations.length
  });

  revalidatePath("/admin/safety-checks");
  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/customer/safety-checks");
  revalidatePath(`/dashboard/customer/safety-checks/${safetyCheck.id}`);
  revalidatePath("/dashboard/tradie");
  revalidatePath("/dashboard/tradie/safety-checks");

  return { ok: true, message: "Safety Check report published." };
}

function parseReportItems(formData: FormData): ReportItem[] {
  const labels = formData.getAll("itemLabel").map(String);
  const categories = formData.getAll("itemCategory").map(String);
  const statuses = formData.getAll("itemStatus").map(String);
  const notes = formData.getAll("itemNotes").map(String);

  return labels
    .map((label, index) => {
      const status = itemStatusSchema.safeParse(statuses[index] || "not_checked");
      if (!label.trim() || !status.success) return null;

      return {
        label: label.trim(),
        category: categories[index]?.trim() || "Readiness",
        status: status.data,
        notes: notes[index]?.trim() || null
      };
    })
    .filter((item): item is ReportItem => Boolean(item));
}

function parseRecommendations(formData: FormData): ReportRecommendation[] {
  const titles = formData.getAll("recommendationTitle").map(String);
  const categories = formData.getAll("recommendationCategory").map(String);
  const priorities = formData.getAll("recommendationPriority").map(String);
  const descriptions = formData.getAll("recommendationDescription").map(String);
  const tradeTypes = formData.getAll("recommendationTradeType").map(String);

  return titles
    .map((title, index) => {
      const priority = recommendationPrioritySchema.safeParse(priorities[index] || "medium");
      if (!title.trim() || !priority.success) return null;

      return {
        title: title.trim(),
        category: categories[index]?.trim() || null,
        priority: priority.data,
        description: descriptions[index]?.trim() || null,
        estimated_trade_type: tradeTypes[index]?.trim() || null
      };
    })
    .filter((recommendation): recommendation is ReportRecommendation => Boolean(recommendation));
}
