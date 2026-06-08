import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type AdminNotificationKind = "fixer_registered" | "fixer_onboarding_completed";

type AdminNotificationInput = {
  type: AdminNotificationKind;
  title: string;
  body: string;
  link: string;
};

export async function createAdminNotifications(input: AdminNotificationInput) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const { data: admins, error: adminError } = await supabase
    .from("users")
    .select("id")
    .in("role", ["admin", "super_admin"])
    .eq("status", "active");

  if (adminError || !admins?.length) {
    if (adminError) console.error("Fixit247 admin notification lookup failed", adminError.message);
    return;
  }

  const { error } = await supabase.from("notifications").insert(
    admins.map((admin) => ({
      user_id: admin.id,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link
    }))
  );

  if (error && error.code !== "42P01") {
    console.error("Fixit247 admin notification insert failed", error.message);
  }
}
