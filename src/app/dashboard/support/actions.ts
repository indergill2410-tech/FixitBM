"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth";
import { notifySupportTicketCreated } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type SupportTicketState = {
  ok?: boolean;
  message?: string;
};

const supportTicketSchema = z.object({
  subject: z.string().min(4).max(120),
  message: z.string().min(10).max(1200)
});

export async function submitSupportTicketAction(
  _state: SupportTicketState,
  formData: FormData
): Promise<SupportTicketState> {
  const user = await requireRole(["customer", "agency", "tradie", "admin", "super_admin"]);

  if (!isSupabaseServerConfigured()) {
    return { ok: false, message: "Support is temporarily unavailable. Please try again shortly." };
  }

  const parsed = supportTicketSchema.safeParse({
    subject: formData.get("subject"),
    message: formData.get("message")
  });

  if (!parsed.success) {
    return { ok: false, message: "Add a short subject and a clear message." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { ok: false, message: "Support is temporarily unavailable. Please try again shortly." };
  }

  const { data: ticket, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: user.id,
      subject: parsed.data.subject,
      body: parsed.data.message,
      status: "open"
    })
    .select("id")
    .single();

  if (error || !ticket) {
    return { ok: false, message: "We could not save this support request yet. Please try again." };
  }

  await supabase.from("audit_logs").insert({
    actor_id: user.id,
    action: "create_support_ticket",
    entity_type: "support_ticket",
    entity_id: ticket.id,
    metadata: {
      subject: parsed.data.subject,
      role: user.role
    }
  });

  await notifySupportTicketCreated({
    ticketId: ticket.id,
    userEmail: user.email,
    userName: [user.first_name, user.last_name].filter(Boolean).join(" ") || null,
    role: user.role,
    subject: parsed.data.subject,
    message: parsed.data.message
  });

  revalidatePath("/admin/support");
  revalidatePath("/dashboard/customer/support");
  revalidatePath("/dashboard/tradie/support");

  return { ok: true, message: "Support request sent. Fixit247 support can now review it." };
}
