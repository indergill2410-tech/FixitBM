"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole, type AppUser } from "@/lib/auth";
import { notifyAgencyOwnerInvited } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type AgencyActionState = {
  ok?: boolean;
  message?: string;
};

type SupabaseAdmin = NonNullable<ReturnType<typeof createSupabaseAdminClient>>;

const portfolioSizes = ["1-10", "11-50", "51-150", "151-500", "500+"] as const;

const profileSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(40),
  abn: z.string().trim().max(32).optional(),
  serviceArea: z.string().trim().min(2).max(160),
  portfolioSize: z.enum(portfolioSizes)
});

const propertySchema = z.object({
  label: z.string().trim().min(2).max(90),
  address: z.string().trim().min(3).max(180),
  suburb: z.string().trim().max(90).optional(),
  postcode: z.string().trim().max(16).optional(),
  state: z.string().trim().max(16).optional(),
  ownerName: z.string().trim().max(100).optional(),
  ownerEmail: z.string().trim().email().optional(),
  managementStatus: z.enum(["onboarding", "active", "needs_review"]),
  riskStatus: z.enum(["clear", "watch", "needs_review", "urgent"]),
  notes: z.string().trim().max(700).optional()
});

const ownerInviteSchema = z.object({
  managedPropertyId: z.string().uuid(),
  ownerName: z.string().trim().max(100).optional(),
  ownerEmail: z.string().trim().email(),
  accessLevel: z.enum(["view_record", "request_work", "manage_record"])
});

const rulesSchema = z.object({
  ownerUpdatePolicy: z.enum(["urgent_only", "urgent_and_recommended", "all_requests"]),
  defaultContactMethod: z.enum(["email", "phone", "sms"]),
  afterHoursNotes: z.string().trim().max(700).optional(),
  urgentAuthorityNotes: z.string().trim().max(700).optional(),
  preferredTradesNotes: z.string().trim().max(700).optional()
});

function configError(): AgencyActionState {
  return { ok: false, message: "Agency workspace access is temporarily unavailable." };
}

async function getAgencyActionContext() {
  const user = await requireRole(["agency", "admin", "super_admin"]);

  if (!isSupabaseServerConfigured()) {
    return { user, supabase: null };
  }

  return { user, supabase: createSupabaseAdminClient() };
}

export async function saveAgencyProfileAction(_state: AgencyActionState, formData: FormData): Promise<AgencyActionState> {
  const { user, supabase } = await getAgencyActionContext();
  if (!supabase) return configError();

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    abn: formData.get("abn") || undefined,
    serviceArea: formData.get("serviceArea"),
    portfolioSize: formData.get("portfolioSize")
  });

  if (!parsed.success) {
    return { ok: false, message: "Add the agency name, phone, service area, and portfolio size." };
  }

  const existing = await getWritableAgency(supabase, user);
  const patch = {
    owner_user_id: existing?.owner_user_id ?? user.id,
    name: parsed.data.name,
    phone: parsed.data.phone,
    abn: parsed.data.abn || null,
    service_area: parsed.data.serviceArea,
    portfolio_size: parsed.data.portfolioSize,
    status: existing?.status === "active" ? "active" : "onboarding",
    onboarding_stage: existing ? advanceStage(existing.onboarding_stage, "properties") : "properties"
  };

  const { data: agency, error } = existing
    ? await supabase.from("agency_profiles").update(patch).eq("id", existing.id).select("id").single()
    : await supabase.from("agency_profiles").insert(patch).select("id").single();

  if (error || !agency) {
    return { ok: false, message: error?.message ?? "Agency workspace could not be saved." };
  }

  await ensurePrincipalMember(supabase, agency.id, user.id);
  await ensureRules(supabase, agency.id);
  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: existing ? "update_agency_profile" : "create_agency_profile",
    entity_type: "agency_profile",
    entity_id: agency.id,
    metadata: {
      agencyName: parsed.data.name,
      portfolioSize: parsed.data.portfolioSize,
      serviceArea: parsed.data.serviceArea
    }
  });

  revalidateAgencyPaths();
  return { ok: true, message: existing ? "Agency profile updated." : "Agency workspace created." };
}

export async function addAgencyManagedPropertyAction(
  _state: AgencyActionState,
  formData: FormData
): Promise<AgencyActionState> {
  const { user, supabase } = await getAgencyActionContext();
  if (!supabase) return configError();

  const agency = await getWritableAgency(supabase, user);
  if (!agency) return { ok: false, message: "Create the agency workspace first." };

  const ownerEmail = String(formData.get("ownerEmail") ?? "").trim().toLowerCase();
  const parsed = propertySchema.safeParse({
    label: formData.get("label"),
    address: formData.get("address"),
    suburb: formData.get("suburb") || undefined,
    postcode: formData.get("postcode") || undefined,
    state: formData.get("state") || undefined,
    ownerName: formData.get("ownerName") || undefined,
    ownerEmail: ownerEmail || undefined,
    managementStatus: formData.get("managementStatus"),
    riskStatus: formData.get("riskStatus"),
    notes: formData.get("notes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Add a valid managed property and owner details." };
  }

  const { data: property, error } = await supabase
    .from("agency_managed_properties")
    .insert({
      agency_id: agency.id,
      label: parsed.data.label,
      address: parsed.data.address,
      suburb: parsed.data.suburb || null,
      postcode: parsed.data.postcode || null,
      state: parsed.data.state || "NSW",
      owner_name: parsed.data.ownerName || null,
      owner_email: parsed.data.ownerEmail || null,
      management_status: parsed.data.managementStatus,
      risk_status: parsed.data.riskStatus,
      notes: parsed.data.notes || null,
      last_touch_at: new Date().toISOString(),
      created_by: user.id
    })
    .select("id")
    .single();

  if (error || !property) {
    return { ok: false, message: error?.message ?? "Managed property could not be added." };
  }

  await supabase
    .from("agency_profiles")
    .update({ onboarding_stage: advanceStage(agency.onboarding_stage, "owners") })
    .eq("id", agency.id);

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "create_agency_property",
    entity_type: "agency_managed_property",
    entity_id: property.id,
    metadata: {
      agencyId: agency.id,
      label: parsed.data.label,
      riskStatus: parsed.data.riskStatus,
      managementStatus: parsed.data.managementStatus
    }
  });

  revalidateAgencyPaths();
  return { ok: true, message: "Managed property added." };
}

export async function inviteAgencyOwnerAction(_state: AgencyActionState, formData: FormData): Promise<AgencyActionState> {
  const { user, supabase } = await getAgencyActionContext();
  if (!supabase) return configError();

  const agency = await getWritableAgency(supabase, user);
  if (!agency) return { ok: false, message: "Create the agency workspace first." };

  const parsed = ownerInviteSchema.safeParse({
    managedPropertyId: formData.get("managedPropertyId"),
    ownerName: formData.get("ownerName") || undefined,
    ownerEmail: String(formData.get("ownerEmail") ?? "").trim().toLowerCase(),
    accessLevel: formData.get("accessLevel")
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose a property and enter a valid owner email." };
  }

  const { data: property } = await supabase
    .from("agency_managed_properties")
    .select("id, label, address, suburb, postcode, state")
    .eq("id", parsed.data.managedPropertyId)
    .eq("agency_id", agency.id)
    .maybeSingle();

  if (!property) {
    return { ok: false, message: "That property is not in this agency workspace." };
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", parsed.data.ownerEmail)
    .maybeSingle();
  const status = existingUser?.id ? "active" : "invited";

  const { data: existingInvite } = await supabase
    .from("agency_owner_invites")
    .select("id")
    .eq("agency_id", agency.id)
    .eq("managed_property_id", parsed.data.managedPropertyId)
    .eq("owner_email", parsed.data.ownerEmail)
    .maybeSingle();

  const invitePatch = {
    agency_id: agency.id,
    managed_property_id: parsed.data.managedPropertyId,
    owner_email: parsed.data.ownerEmail,
    owner_name: parsed.data.ownerName || null,
    access_level: parsed.data.accessLevel,
    status,
    invited_by: user.id,
    accepted_user_id: existingUser?.id ?? null
  };

  const { data: invite, error } = existingInvite
    ? await supabase.from("agency_owner_invites").update(invitePatch).eq("id", existingInvite.id).select("id").single()
    : await supabase.from("agency_owner_invites").insert(invitePatch).select("id").single();

  if (error || !invite) {
    return { ok: false, message: error?.message ?? "Owner access could not be prepared." };
  }

  await supabase
    .from("agency_managed_properties")
    .update({
      owner_email: parsed.data.ownerEmail,
      owner_name: parsed.data.ownerName || null,
      last_touch_at: new Date().toISOString()
    })
    .eq("id", parsed.data.managedPropertyId);

  await supabase
    .from("agency_profiles")
    .update({ onboarding_stage: advanceStage(agency.onboarding_stage, "rules") })
    .eq("id", agency.id);

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "invite_agency_owner",
    entity_type: "agency_owner_invite",
    entity_id: invite.id,
    metadata: {
      agencyId: agency.id,
      managedPropertyId: parsed.data.managedPropertyId,
      ownerEmail: parsed.data.ownerEmail,
      accessLevel: parsed.data.accessLevel,
      status
    }
  });

  const propertyLabel =
    property.label || [property.address, property.suburb, property.postcode, property.state].filter(Boolean).join(" ");
  await notifyAgencyOwnerInvited({
    inviteId: invite.id,
    email: parsed.data.ownerEmail,
    agencyName: agency.name,
    propertyLabel,
    ownerName: parsed.data.ownerName,
    accessLevel: parsed.data.accessLevel,
    status
  });

  revalidateAgencyPaths();
  return {
    ok: true,
    message: existingUser?.id ? "Owner access is active for that Fixit247 account." : "Owner access prepared and emailed."
  };
}

export async function saveAgencyRulesAction(_state: AgencyActionState, formData: FormData): Promise<AgencyActionState> {
  const { user, supabase } = await getAgencyActionContext();
  if (!supabase) return configError();

  const agency = await getWritableAgency(supabase, user);
  if (!agency) return { ok: false, message: "Create the agency workspace first." };

  const parsed = rulesSchema.safeParse({
    ownerUpdatePolicy: formData.get("ownerUpdatePolicy"),
    defaultContactMethod: formData.get("defaultContactMethod"),
    afterHoursNotes: formData.get("afterHoursNotes") || undefined,
    urgentAuthorityNotes: formData.get("urgentAuthorityNotes") || undefined,
    preferredTradesNotes: formData.get("preferredTradesNotes") || undefined
  });

  if (!parsed.success) {
    return { ok: false, message: "Choose valid maintenance rules." };
  }

  const { data: rules, error } = await supabase
    .from("agency_maintenance_rules")
    .upsert(
      {
        agency_id: agency.id,
        owner_update_policy: parsed.data.ownerUpdatePolicy,
        default_contact_method: parsed.data.defaultContactMethod,
        after_hours_notes: parsed.data.afterHoursNotes || null,
        urgent_authority_notes: parsed.data.urgentAuthorityNotes || null,
        preferred_trades_notes: parsed.data.preferredTradesNotes || null
      },
      { onConflict: "agency_id" }
    )
    .select("id")
    .single();

  if (error || !rules) {
    return { ok: false, message: error?.message ?? "Maintenance rules could not be saved." };
  }

  await supabase
    .from("agency_profiles")
    .update({ status: "active", onboarding_stage: "ready" })
    .eq("id", agency.id);

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "update_agency_rules",
    entity_type: "agency_maintenance_rules",
    entity_id: rules.id,
    metadata: {
      agencyId: agency.id,
      ownerUpdatePolicy: parsed.data.ownerUpdatePolicy,
      defaultContactMethod: parsed.data.defaultContactMethod
    }
  });

  revalidateAgencyPaths();
  return { ok: true, message: "Maintenance rules saved. The agency workspace is ready." };
}

async function getWritableAgency(supabase: SupabaseAdmin, user: AppUser) {
  const { data: ownedAgency } = await supabase
    .from("agency_profiles")
    .select("id, owner_user_id, name, status, onboarding_stage")
    .eq("owner_user_id", user.id)
    .neq("status", "archived")
    .maybeSingle();

  if (ownedAgency) {
    return ownedAgency as {
      id: string;
      owner_user_id: string;
      name: string;
      status: "onboarding" | "active" | "paused" | "archived";
      onboarding_stage: "profile" | "properties" | "owners" | "rules" | "ready";
    };
  }

  const { data: member } = await supabase
    .from("agency_members")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .in("role", ["principal", "property_manager", "operations"])
    .limit(1)
    .maybeSingle();

  if (!member?.agency_id) return null;

  const { data: agency } = await supabase
    .from("agency_profiles")
    .select("id, owner_user_id, name, status, onboarding_stage")
    .eq("id", member.agency_id)
    .neq("status", "archived")
    .maybeSingle();

  return agency as typeof ownedAgency;
}

async function ensurePrincipalMember(supabase: SupabaseAdmin, agencyId: string, userId: string) {
  const { data: existing } = await supabase
    .from("agency_members")
    .select("id")
    .eq("agency_id", agencyId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing?.id) {
    await supabase
      .from("agency_members")
      .update({ role: "principal", status: "active" })
      .eq("id", existing.id);
    return;
  }

  await supabase.from("agency_members").insert({
    agency_id: agencyId,
    user_id: userId,
    role: "principal",
    status: "active"
  });
}

async function ensureRules(supabase: SupabaseAdmin, agencyId: string) {
  await supabase.from("agency_maintenance_rules").upsert(
    {
      agency_id: agencyId,
      owner_update_policy: "urgent_and_recommended",
      default_contact_method: "email"
    },
    { onConflict: "agency_id" }
  );
}

function advanceStage(
  current: "profile" | "properties" | "owners" | "rules" | "ready",
  next: "properties" | "owners" | "rules" | "ready"
) {
  const order = ["profile", "properties", "owners", "rules", "ready"];
  return order.indexOf(current) > order.indexOf(next) ? current : next;
}

function revalidateAgencyPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/agency");
  revalidatePath("/dashboard/customer");
  revalidatePath("/admin/support");
}
