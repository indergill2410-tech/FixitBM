import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export type Role = "customer" | "agency" | "tradie" | "admin" | "super_admin";

export type AppUser = {
  id: string;
  auth_id: string | null;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  role: Role;
  status: "pending" | "active" | "suspended";
  email_verified_at: string | null;
};

export function roleHome(role: Role) {
  if (role === "agency") return "/dashboard/agency";
  if (role === "tradie") return "/dashboard/tradie";
  if (role === "admin" || role === "super_admin") return "/admin";
  return "/dashboard/customer";
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, email, phone, first_name, last_name, role, status, email_verified_at")
    .eq("auth_id", authData.user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as AppUser;
}

export async function requireRole(roles: Role[]) {
  const user = await getCurrentAppUser();

  if (!user) {
    redirect("/login");
  }

  if (user.status === "suspended") {
    redirect("/");
  }

  if (!roles.includes(user.role)) {
    redirect(roleHome(user.role));
  }

  return user;
}
