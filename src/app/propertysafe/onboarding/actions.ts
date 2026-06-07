"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { notifyPropertySafeWalkthroughRequested } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type PropertySafeOnboardingState = {
  ok?: boolean;
  message?: string;
};

const onboardingSchema = z.object({
  name: z.string().min(2).max(90),
  email: z.string().email(),
  phone: z.string().min(8).max(40),
  agencyName: z.string().min(2).max(120),
  role: z.enum(["principal", "property_manager", "landlord", "owner", "operations", "other"]),
  portfolioSize: z.enum(["1-10", "11-50", "51-150", "151-500", "500+"]),
  priority: z.enum(["tenant_maintenance", "owner_visibility", "safety_checks", "repair_history", "portfolio_growth"]),
  suburb: z.string().max(120).optional(),
  message: z.string().max(900).optional(),
  consent: z.literal("on")
});

export async function requestPropertySafeWalkthroughAction(
  _state: PropertySafeOnboardingState,
  formData: FormData
): Promise<PropertySafeOnboardingState> {
  const requesterEmail = String(formData.get("email") ?? "").toLowerCase().trim();
  const limit = rateLimit({
    key: `propertysafe-onboarding:${requesterEmail || "unknown"}`,
    limit: 3,
    windowMs: 60 * 60 * 1000
  });

  if (!limit.ok) {
    return { ok: false, message: "We have this request. Please wait a little before sending another." };
  }

  const parsed = onboardingSchema.safeParse({
    name: formData.get("name"),
    email: requesterEmail,
    phone: formData.get("phone"),
    agencyName: formData.get("agencyName"),
    role: formData.get("role"),
    portfolioSize: formData.get("portfolioSize"),
    priority: formData.get("priority"),
    suburb: formData.get("suburb") || undefined,
    message: formData.get("message") || undefined,
    consent: formData.get("consent")
  });

  if (!parsed.success) {
    return { ok: false, message: "Add your agency details and tick permission so we can prepare the walkthrough." };
  }

  let ticketId: string | null = null;
  const ticketBody = [
    "PropertySafe agency walkthrough request",
    "",
    `Name: ${parsed.data.name}`,
    `Email: ${parsed.data.email}`,
    `Phone: ${parsed.data.phone}`,
    `Agency: ${parsed.data.agencyName}`,
    `Role: ${labelize(parsed.data.role)}`,
    `Portfolio size: ${parsed.data.portfolioSize}`,
    `Main focus: ${labelize(parsed.data.priority)}`,
    parsed.data.suburb ? `Primary area: ${parsed.data.suburb}` : null,
    "",
    "Context:",
    parsed.data.message || "No extra notes supplied.",
    "",
    "Requested from: /propertysafe/onboarding"
  ]
    .filter(Boolean)
    .join("\n");

  if (isSupabaseServerConfigured()) {
    const supabase = createSupabaseAdminClient();

    if (supabase) {
      const { data: ticket } = await supabase
        .from("support_tickets")
        .insert({
          subject: `PropertySafe walkthrough - ${parsed.data.agencyName}`,
          body: ticketBody,
          status: "open"
        })
        .select("id")
        .single();

      ticketId = ticket?.id ?? null;

      if (ticketId) {
        await supabase.from("audit_logs").insert({
          action: "create_support_ticket",
          entity_type: "support_ticket",
          entity_id: ticketId,
          metadata: {
            source: "propertysafe_walkthrough",
            agency_name: parsed.data.agencyName,
            email: parsed.data.email,
            role: parsed.data.role,
            portfolio_size: parsed.data.portfolioSize,
            priority: parsed.data.priority
          }
        });
      }
    }
  }

  await notifyPropertySafeWalkthroughRequested({
    ticketId,
    name: parsed.data.name,
    email: parsed.data.email,
    phone: parsed.data.phone,
    agencyName: parsed.data.agencyName,
    role: parsed.data.role,
    portfolioSize: parsed.data.portfolioSize,
    priority: parsed.data.priority,
    suburb: parsed.data.suburb,
    message: parsed.data.message
  });

  revalidatePath("/admin/support");

  return {
    ok: true,
    message: "Your walkthrough request is in. Fixit247 can now prepare the agency onboarding conversation."
  };
}

function labelize(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
