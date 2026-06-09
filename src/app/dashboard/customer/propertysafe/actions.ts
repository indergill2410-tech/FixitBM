"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type PropertySafeInviteActionState = { ok?: boolean; message?: string };

const inviteSchema = z.object({ participantId: z.string().uuid() });

// Resolves the invite while proving it belongs to this user — either already
// linked by user_id, or addressed to their verified email. Returns the row only
// when the caller is entitled to act on it.
async function loadOwnInvite(
  supabase: NonNullable<ReturnType<typeof createSupabaseAdminClient>>,
  participantId: string,
  userId: string,
  email: string
) {
  const { data } = await supabase
    .from("propertysafe_participants")
    .select("id, propertysafe_profile_id, user_id, invite_email, status")
    .eq("id", participantId)
    .maybeSingle();
  if (!data) return null;
  const belongs = data.user_id === userId || (email && (data.invite_email ?? "").toLowerCase() === email);
  return belongs ? data : null;
}

export async function acceptPropertySafeInviteAction(
  _state: PropertySafeInviteActionState,
  formData: FormData
): Promise<PropertySafeInviteActionState> {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  if (!isSupabaseServerConfigured()) return { ok: false, message: "PropertySafe is temporarily unavailable." };

  const parsed = inviteSchema.safeParse({ participantId: formData.get("participantId") });
  if (!parsed.success) return { ok: false, message: "That invitation could not be found." };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, message: "PropertySafe is temporarily unavailable." };

  const email = (user.email ?? "").trim().toLowerCase();
  const invite = await loadOwnInvite(supabase, parsed.data.participantId, user.id, email);
  if (!invite) return { ok: false, message: "That invitation is not available to your account." };

  if (invite.status === "active") {
    revalidatePath("/dashboard/customer/propertysafe");
    return { ok: true, message: "You already have access to this record." };
  }
  if (invite.status === "revoked") return { ok: false, message: "That invitation is no longer available." };

  // Link the participant to this account and activate access in one step.
  const { error } = await supabase
    .from("propertysafe_participants")
    .update({ status: "active", user_id: user.id })
    .eq("id", invite.id);
  if (error) return { ok: false, message: "We could not accept that invitation. Please try again." };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "accept_propertysafe_invite",
    entity_type: "propertysafe_participant",
    entity_id: invite.id,
    metadata: { propertysafe_profile_id: invite.propertysafe_profile_id }
  });

  revalidatePath("/dashboard/customer/propertysafe");
  revalidatePath("/dashboard/customer");
  return { ok: true, message: "Access accepted. The shared record is now available." };
}

export async function declinePropertySafeInviteAction(
  _state: PropertySafeInviteActionState,
  formData: FormData
): Promise<PropertySafeInviteActionState> {
  const user = await requireRole(["customer", "admin", "super_admin"]);
  if (!isSupabaseServerConfigured()) return { ok: false, message: "PropertySafe is temporarily unavailable." };

  const parsed = inviteSchema.safeParse({ participantId: formData.get("participantId") });
  if (!parsed.success) return { ok: false, message: "That invitation could not be found." };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, message: "PropertySafe is temporarily unavailable." };

  const email = (user.email ?? "").trim().toLowerCase();
  const invite = await loadOwnInvite(supabase, parsed.data.participantId, user.id, email);
  if (!invite) return { ok: false, message: "That invitation is not available to your account." };

  const { error } = await supabase
    .from("propertysafe_participants")
    .update({ status: "revoked" })
    .eq("id", invite.id);
  if (error) return { ok: false, message: "We could not update that invitation. Please try again." };

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "decline_propertysafe_invite",
    entity_type: "propertysafe_participant",
    entity_id: invite.id,
    metadata: { propertysafe_profile_id: invite.propertysafe_profile_id }
  });

  revalidatePath("/dashboard/customer/propertysafe");
  return { ok: true, message: "Invitation declined." };
}
