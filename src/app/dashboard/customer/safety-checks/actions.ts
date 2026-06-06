"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { getCustomerMembershipSummary } from "@/lib/safety-checks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type SafetyCheckBookingState = {
  ok?: boolean;
  message?: string;
  safetyCheckId?: string;
};

const bookingSchema = z.object({
  propertyId: z.string().uuid(),
  preferredWindow: z.string().min(3).max(160),
  concerns: z.string().max(1000).optional()
});

const recommendationSchema = z.object({
  recommendationId: z.string().uuid()
});

export async function bookSafetyCheckAction(
  _state: SafetyCheckBookingState,
  formData: FormData
): Promise<SafetyCheckBookingState> {
  const user = await requireRole(["customer", "admin", "super_admin"]);

  if (!isSupabaseServerConfigured()) {
    return { ok: false, message: "Safety Check booking is temporarily unavailable. Please try again shortly." };
  }

  const parsed = bookingSchema.safeParse({
    propertyId: formData.get("propertyId"),
    preferredWindow: formData.get("preferredWindow"),
    concerns: formData.get("concerns") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose a property and preferred booking window." };
  }

  const membership = await getCustomerMembershipSummary(user);
  if (membership?.status !== "active") {
    return { ok: false, message: "Safety Check booking unlocks once Fixit Plus is active." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, message: "Safety Check booking is temporarily unavailable. Please try again shortly." };
  }

  const { data: property } = await supabase
    .from("saved_properties")
    .select("id")
    .eq("id", parsed.data.propertyId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (!property) {
    return { ok: false, message: "Choose one of your saved properties." };
  }

  const { data: existing } = await supabase
    .from("safety_checks")
    .select("id")
    .eq("customer_id", user.id)
    .in("status", ["booked", "assigned"])
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      ok: true,
      message: "You already have an active Safety Check booking.",
      safetyCheckId: existing.id
    };
  }

  const { data: activeMembership } = await supabase
    .from("memberships")
    .select("id, plan")
    .eq("customer_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: safetyCheck, error } = await supabase
    .from("safety_checks")
    .insert({
      customer_id: user.id,
      membership_id: activeMembership?.id ?? null,
      property_id: property.id,
      status: "booked",
      check_type: activeMembership?.plan === "complete" ? "home_and_road" : "home",
      preferred_window: parsed.data.preferredWindow,
      customer_notes: parsed.data.concerns || null,
      next_due_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 183).toISOString()
    })
    .select("id")
    .single();

  if (error || !safetyCheck) {
    return { ok: false, message: "We could not book your Safety Check yet. Please try again." };
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "book_safety_check",
    entity_type: "safety_check",
    entity_id: safetyCheck.id,
    metadata: {
      propertyId: property.id,
      preferredWindow: parsed.data.preferredWindow
    }
  });

  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/customer/safety-checks");
  revalidatePath("/dashboard/customer/safety-checks/book");
  revalidatePath("/admin/safety-checks");

  return {
    ok: true,
    message: "Safety Check booking requested. Fixit247 support can now assign a Fixer.",
    safetyCheckId: safetyCheck.id
  };
}

export async function convertRecommendationToRequestAction(formData: FormData) {
  const user = await requireRole(["customer", "admin", "super_admin"]);

  if (!isSupabaseServerConfigured()) {
    throw new Error("Request saving is temporarily unavailable.");
  }

  const parsed = recommendationSchema.safeParse({
    recommendationId: formData.get("recommendationId")
  });

  if (!parsed.success) {
    throw new Error("Choose a recommended fix before starting a request.");
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Request saving is temporarily unavailable.");
  }

  const { data: recommendation, error: recommendationError } = await supabase
    .from("safety_check_recommendations")
    .select("id, safety_check_id, customer_id, property_id, title, category, priority, description, estimated_trade_type, status, linked_job_id")
    .eq("id", parsed.data.recommendationId)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (recommendationError || !recommendation) {
    throw new Error("Recommended fix not found.");
  }

  if (recommendation.linked_job_id) {
    redirect(`/dashboard/customer/jobs/${recommendation.linked_job_id}`);
  }

  const { data: property } = recommendation.property_id
    ? await supabase
        .from("saved_properties")
        .select("id, address, suburb, postcode, state")
        .eq("id", recommendation.property_id)
        .eq("customer_id", user.id)
        .maybeSingle()
    : { data: null };

  const isUrgent = recommendation.priority === "urgent" || recommendation.priority === "high";
  const category = recommendation.category || recommendation.estimated_trade_type || "Recommended fix";
  const description = [
    "Request lane: standard trade job",
    "Source: Safety Check recommendation",
    `Priority: ${recommendation.priority}`,
    "",
    recommendation.description || "Recommended during a Fixit247 Safety Check."
  ].join("\n");

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .insert({
      customer_id: user.id,
      type: "scheduled",
      category,
      urgency: isUrgent ? "today" : "flexible",
      title: recommendation.title,
      description,
      address: property?.address ?? null,
      suburb: property?.suburb ?? null,
      postcode: property?.postcode ?? null,
      state: property?.state ?? null,
      preferred_contact_method: "in_app",
      consent_to_contact: true,
      status: "received",
      credit_cost: 50
    })
    .select("id, public_reference")
    .single();

  if (jobError || !job) {
    throw new Error("We could not start that request yet. Please try again.");
  }

  await supabase.from("job_status_events").insert({
    job_id: job.id,
    status: "received",
    title: "Safety Check recommendation converted",
    note: "Customer started a trade request from a Safety Check recommendation.",
    created_by: user.id
  });

  await supabase
    .from("safety_check_recommendations")
    .update({
      status: "converted_to_request",
      linked_job_id: job.id
    })
    .eq("id", recommendation.id);

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "convert_safety_check_recommendation",
    entity_type: "job",
    entity_id: job.id,
    metadata: {
      recommendationId: recommendation.id,
      safetyCheckId: recommendation.safety_check_id,
      reference: job.public_reference
    }
  });

  revalidatePath("/dashboard/customer");
  revalidatePath("/dashboard/customer/jobs");
  revalidatePath(`/dashboard/customer/jobs/${job.id}`);
  revalidatePath("/dashboard/customer/safety-checks");
  if (recommendation.safety_check_id) {
    revalidatePath(`/dashboard/customer/safety-checks/${recommendation.safety_check_id}`);
  }
  revalidatePath("/admin/requests");

  redirect(`/dashboard/customer/jobs/${job.id}`);
}
