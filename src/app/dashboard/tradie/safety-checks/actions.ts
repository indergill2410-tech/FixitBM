"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { syncComplianceReportToCrm } from "@/lib/crm";
import { notifySafetyCheckReportPublished } from "@/lib/email";
import {
  type ComplianceResult,
  frequencyMonthsFor,
  inspectionCategoryMap,
  isComplianceCheck,
  nextDueForCategories
} from "@/lib/inspection-templates";
import { getTradieProfileForUser } from "@/lib/jobs";
import { syncPropertySafeFromSafetyCheckReport } from "@/lib/propertysafe";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type SafetyCheckReportState = {
  ok?: boolean;
  message?: string;
};

const itemStatusSchema = z.enum(["ok", "attention", "recommended", "not_checked", "pass", "fail", "action_required", "na"]);
const recommendationPrioritySchema = z.enum(["low", "medium", "high", "urgent"]);

const reportSchema = z.object({
  safetyCheckId: z.string().uuid(),
  scoreBefore: z.coerce.number().int().min(0).max(100).optional(),
  scoreAfter: z.coerce.number().int().min(0).max(100).optional(),
  summary: z.string().min(12).max(2000),
  inspectorName: z.string().trim().max(120).optional(),
  inspectorLicenceNo: z.string().trim().max(60).optional()
});

type ItemStatus = z.infer<typeof itemStatusSchema>;

type ReportItem = {
  category: string;
  category_key: string;
  label: string;
  status: ItemStatus;
  notes: string | null;
  is_critical: boolean;
};

type ReportRecommendation = {
  title: string;
  category: string | null;
  priority: z.infer<typeof recommendationPrioritySchema>;
  description: string | null;
  estimated_trade_type: string | null;
};

// Statuses that count as a failed / non-compliant item.
const failStatuses = new Set<ItemStatus>(["fail", "attention"]);
// Statuses that count as needing follow-up action.
const actionStatuses = new Set<ItemStatus>(["action_required", "recommended"]);
// Statuses excluded from the assessed total.
const skippedStatuses = new Set<ItemStatus>(["na", "not_checked"]);

function deriveCategoryResult(items: ReportItem[]): ComplianceResult {
  const assessed = items.filter((item) => !skippedStatuses.has(item.status));
  if (!assessed.length) return "not_applicable";
  if (assessed.some((item) => item.is_critical && item.status === "fail")) return "fail";
  if (assessed.some((item) => failStatuses.has(item.status))) return "fail";
  if (assessed.some((item) => actionStatuses.has(item.status))) return "action_required";
  return "pass";
}

function deriveOverallResult(categoryResults: ComplianceResult[]): ComplianceResult {
  if (categoryResults.some((result) => result === "fail")) return "fail";
  if (categoryResults.some((result) => result === "action_required")) return "action_required";
  if (categoryResults.length && categoryResults.every((result) => result === "not_applicable")) return "not_applicable";
  return "pass";
}

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
    scoreBefore: formData.get("scoreBefore") || undefined,
    scoreAfter: formData.get("scoreAfter") || undefined,
    summary: formData.get("summary"),
    inspectorName: formData.get("inspectorName") || undefined,
    inspectorLicenceNo: formData.get("inspectorLicenceNo") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Complete the summary before publishing the report." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, message: "Safety Check reporting is temporarily unavailable." };
  }

  const { data: safetyCheck, error: checkError } = await supabase
    .from("safety_checks")
    .select("id, customer_id, membership_id, property_id, assigned_fixer_id, status, check_type, requested_categories")
    .eq("id", parsed.data.safetyCheckId)
    .maybeSingle();

  if (checkError || !safetyCheck) {
    return { ok: false, message: "Safety Check not found." };
  }

  let inspectorVerified = user.role === "admin" || user.role === "super_admin";
  if (user.role === "tradie") {
    const profile = await getTradieProfileForUser(user);
    if (!profile || profile.id !== safetyCheck.assigned_fixer_id) {
      return { ok: false, message: "Only the assigned Fixer can publish this report." };
    }
    inspectorVerified = profile.verification_status === "verified";
  }

  const items = parseReportItems(formData);
  if (!items.length) {
    return { ok: false, message: "Add at least one checklist item." };
  }

  const categoryKeys = Array.from(new Set(items.map((item) => item.category_key)));
  const compliance = isComplianceCheck(safetyCheck.check_type, safetyCheck.requested_categories);

  // Regulated categories require a licensed, verified inspector + licence number.
  const regulatedCategories = categoryKeys.filter((key) => inspectionCategoryMap[key]?.requiresLicence);
  if (compliance && regulatedCategories.length) {
    if (!parsed.data.inspectorLicenceNo) {
      const trades = regulatedCategories.map((key) => inspectionCategoryMap[key]?.licenceTrade).filter(Boolean).join(", ");
      return { ok: false, message: `A licence number is required to certify regulated work (${trades}).` };
    }
    if (!inspectorVerified) {
      return { ok: false, message: "Your Fixer profile must be verified before certifying gas or electrical work." };
    }
  }

  // Per-category and overall compliance verdicts.
  const itemsByCategory = new Map<string, ReportItem[]>();
  for (const item of items) {
    const list = itemsByCategory.get(item.category_key) ?? [];
    list.push(item);
    itemsByCategory.set(item.category_key, list);
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const categoryResults: Record<string, { label: string; result: ComplianceResult; next_due_at: string | null; items_total: number; items_failed: number }> = {};
  const overallInputs: ComplianceResult[] = [];

  for (const [key, categoryItems] of itemsByCategory.entries()) {
    const result = deriveCategoryResult(categoryItems);
    overallInputs.push(result);
    const months = frequencyMonthsFor(key);
    const nextDue = months ? (() => { const d = new Date(now); d.setMonth(d.getMonth() + months); return d.toISOString(); })() : null;
    categoryResults[key] = {
      label: inspectionCategoryMap[key]?.label ?? key,
      result,
      next_due_at: nextDue,
      items_total: categoryItems.length,
      items_failed: categoryItems.filter((item) => failStatuses.has(item.status)).length
    };
  }

  const overallResult: ComplianceResult = deriveOverallResult(overallInputs);

  // Score: use provided values, otherwise derive from the pass ratio.
  const assessed = items.filter((item) => !skippedStatuses.has(item.status));
  const passed = assessed.filter((item) => item.status === "pass" || item.status === "ok").length;
  const derivedScore = assessed.length ? Math.round((passed / assessed.length) * 100) : 60;
  const scoreAfter = parsed.data.scoreAfter ?? derivedScore;
  const scoreBefore = parsed.data.scoreBefore ?? scoreAfter;

  const recommendations = parseRecommendations(formData);
  const nextDue = nextDueForCategories(categoryKeys, now).toISOString();

  const certificateNumber = compliance
    ? `FX-CC-${now.getFullYear()}-${safetyCheck.id.replace(/-/g, "").slice(0, 8).toUpperCase()}`
    : null;

  const { error: deleteItemsError } = await supabase.from("safety_check_items").delete().eq("safety_check_id", safetyCheck.id);
  if (deleteItemsError) return { ok: false, message: deleteItemsError.message };

  const { error: insertItemsError } = await supabase.from("safety_check_items").insert(
    items.map((item) => ({
      safety_check_id: safetyCheck.id,
      category: item.category,
      category_key: item.category_key,
      label: item.label,
      status: item.status,
      notes: item.notes,
      is_critical: item.is_critical
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
    score: scoreAfter,
    reason_summary: parsed.data.summary
  });
  if (scoreError) return { ok: false, message: scoreError.message };

  const { error: updateError } = await supabase
    .from("safety_checks")
    .update({
      status: "completed",
      completed_at: nowIso,
      report_published_at: nowIso,
      next_due_at: nextDue,
      score_before: scoreBefore,
      score_after: scoreAfter,
      summary: parsed.data.summary,
      compliance_result: compliance ? overallResult : null,
      category_results: categoryResults,
      inspector_name: parsed.data.inspectorName ?? null,
      inspector_licence_no: parsed.data.inspectorLicenceNo ?? null,
      certificate_number: certificateNumber,
      certificate_issued_at: certificateNumber ? nowIso : null
    })
    .eq("id", safetyCheck.id);

  if (updateError) return { ok: false, message: updateError.message };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: certificateNumber ? "issue_compliance_certificate" : "publish_safety_check_report",
    entity_type: "safety_check",
    entity_id: safetyCheck.id,
    metadata: {
      scoreBefore,
      scoreAfter,
      complianceResult: compliance ? overallResult : null,
      certificateNumber,
      recommendationCount: recommendations.length
    }
  });

  await syncPropertySafeFromSafetyCheckReport({
    safetyCheckId: safetyCheck.id,
    customerId: safetyCheck.customer_id,
    propertyId: safetyCheck.property_id,
    membershipId: safetyCheck.membership_id,
    scoreBefore,
    scoreAfter,
    summary: parsed.data.summary,
    assessmentType: compliance ? "rental_compliance" : "six_month",
    complianceResult: compliance ? overallResult : null,
    certificateNumber,
    items: items.map((item) => ({ category: item.category, label: item.label, status: item.status, notes: item.notes })),
    recommendations,
    publishedAt: nowIso,
    nextReviewAt: nextDue
  });

  const { data: customer } = await supabase
    .from("users")
    .select("email, first_name, last_name")
    .eq("id", safetyCheck.customer_id)
    .maybeSingle();

  if (compliance) {
    const { data: property } = safetyCheck.property_id
      ? await supabase
          .from("saved_properties")
          .select("label, address, suburb, postcode, state")
          .eq("id", safetyCheck.property_id)
          .maybeSingle()
      : { data: null };

    const propertyAddress = property
      ? [property.address, property.suburb, property.postcode, property.state].filter(Boolean).join(", ")
      : null;

    await syncComplianceReportToCrm({
      ownerUserId: safetyCheck.customer_id,
      safetyCheckId: safetyCheck.id,
      propertyLabel: property?.label || propertyAddress || "Property",
      propertyAddress,
      certificateNumber,
      overallResult,
      categories: Object.entries(categoryResults).map(([key, value]) => ({
        key,
        label: value.label,
        result: value.result,
        nextDue: value.next_due_at
      })),
      publishedAt: nowIso
    });
  }

  await notifySafetyCheckReportPublished({
    safetyCheckId: safetyCheck.id,
    userEmail: customer?.email ?? null,
    scoreAfter,
    recommendationCount: recommendations.length
  });

  revalidatePath("/admin/safety-checks");
  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/customer/safety-checks");
  revalidatePath(`/dashboard/customer/safety-checks/${safetyCheck.id}`);
  revalidatePath("/dashboard/tradie");
  revalidatePath("/dashboard/tradie/safety-checks");

  return {
    ok: true,
    message: certificateNumber
      ? `Compliance report published. Certificate ${certificateNumber} issued (${overallResult.replace("_", " ")}).`
      : "Safety Check report published."
  };
}

function parseReportItems(formData: FormData): ReportItem[] {
  const labels = formData.getAll("itemLabel").map(String);
  const categories = formData.getAll("itemCategoryLabel").map(String);
  const categoryKeys = formData.getAll("itemCategory").map(String);
  const statuses = formData.getAll("itemStatus").map(String);
  const notes = formData.getAll("itemNotes").map(String);
  const criticals = formData.getAll("itemCritical").map(String);

  return labels
    .map((label, index) => {
      const status = itemStatusSchema.safeParse(statuses[index] || "not_checked");
      if (!label.trim() || !status.success) return null;

      return {
        label: label.trim(),
        category: categories[index]?.trim() || "Readiness",
        category_key: categoryKeys[index]?.trim() || "general_readiness",
        status: status.data,
        notes: notes[index]?.trim() || null,
        is_critical: criticals[index] === "1"
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
