import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export type Role = "customer" | "tradie" | "admin" | "super_admin";

export type AppUser = {
  id: string;
  auth_id: string | null;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  role: Role;
  status: "pending" | "active" | "suspended";
};

export function roleHome(role: Role) {
  if (role === "tradie") return "/dashboard/tradie";
  if (role === "admin" || role === "super_admin") return "/admin";
  return "/dashboard/customer";
}

export async function getCurrentAppUser(): Promise<AppUser | null> {
  if (!isSupabasePublicConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return null;
  }

  const { data, error } = await supabase
    .from("users")
    .select("id, auth_id, email, phone, first_name, last_name, role, status")
    .eq("auth_id", claimsData.claims.sub)
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

  if (user.status === "suspended" || !roles.includes(user.role)) {
    redirect(roleHome(user.role));
  }

  return user;
}
