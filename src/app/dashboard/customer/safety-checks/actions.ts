"use server";

import { revalidatePath } from "next/cache";
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
