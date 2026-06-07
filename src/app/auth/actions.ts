"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured, isSupabaseServerConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { roleHome, type Role } from "@/lib/auth";
import { notifyCustomerRegistered, notifyFixerRegistered } from "@/lib/email";

export type AuthActionState = {
  ok?: boolean;
  message?: string;
};

const emailPasswordSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const customerRegistrationSchema = emailPasswordSchema.extend({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(8)
});

const tradieRegistrationSchema = customerRegistrationSchema.extend({
  businessName: z.string().min(2),
  abn: z.string().optional(),
  tradeCategory: z.string().min(2),
  licenceNumber: z.string().optional(),
  serviceArea: z.string().min(2),
  emergencyAvailable: z.string().optional()
});

function envError(): AuthActionState {
  return {
    ok: false,
    message: "Account access is temporarily unavailable. Please try again shortly."
  };
}

export async function signInAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  if (!isSupabasePublicConfigured()) {
    return envError();
  }

  const parsed = emailPasswordSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return { ok: false, message: "Enter a valid email and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: error.message };
  }

  const { data: authUserData } = await supabase.auth.getUser();
  const authId = authUserData.user?.id;

  if (!authId) {
    return { ok: false, message: "Signed in, but the session could not be confirmed." };
  }

  const userRole = await resolveSignedInUserRole(
    supabase,
    authId,
    authUserData.user?.email ?? parsed.data.email,
    authUserData.user?.user_metadata
  );

  if (!userRole) {
    return { ok: false, message: "Account profile could not be prepared. Please contact Fixit247 support." };
  }

  redirect(roleHome(userRole));
}

async function resolveSignedInUserRole(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  authId: string,
  email: string,
  metadata?: Record<string, unknown> | null
): Promise<Role | null> {
  const { data: linkedUser } = await supabase.from("users").select("role").eq("auth_id", authId).maybeSingle();
  if (linkedUser?.role) return linkedUser.role as Role;

  if (!isSupabaseServerConfigured()) return null;

  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data: existingByEmail } = await admin
    .from("users")
    .select("id, role, auth_id")
    .eq("email", email)
    .maybeSingle();

  if (existingByEmail) {
    if (existingByEmail.auth_id !== authId) {
      await admin.from("users").update({ auth_id: authId }).eq("id", existingByEmail.id);
    }
    return existingByEmail.role as Role;
  }

  const firstName = typeof metadata?.first_name === "string" ? metadata.first_name : null;
  const lastName = typeof metadata?.last_name === "string" ? metadata.last_name : null;
  const { data: createdUser, error } = await admin
    .from("users")
    .insert({
      auth_id: authId,
      email,
      first_name: firstName,
      last_name: lastName,
      role: "customer",
      status: "active"
    })
    .select("id, role")
    .single();

  if (error || !createdUser) return null;

  await admin.from("customer_profiles").upsert({ user_id: createdUser.id }, { onConflict: "user_id" });

  return createdUser.role as Role;
}

export async function registerCustomerAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabasePublicConfigured() || !isSupabaseServerConfigured()) {
    return envError();
  }

  const parsed = customerRegistrationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone")
  });

  if (!parsed.success) {
    return { ok: false, message: "Complete the required customer details." };
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return envError();
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: "customer"
      }
    }
  });

  if (authError || !authData.user) {
    return { ok: false, message: authError?.message ?? "Could not create customer account." };
  }

  const { data: appUser, error: profileError } = await admin
    .from("users")
    .upsert(
      {
        auth_id: authData.user.id,
        email: parsed.data.email,
        phone: parsed.data.phone,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: "customer",
        status: "active"
      },
      { onConflict: "auth_id" }
    )
    .select("id")
    .single();

  if (profileError) {
    return { ok: false, message: profileError.message };
  }

  await admin.from("customer_profiles").upsert({ user_id: appUser.id }, { onConflict: "user_id" });

  await notifyCustomerRegistered({
    userId: appUser.id,
    email: parsed.data.email,
    firstName: parsed.data.firstName
  });

  redirect("/dashboard/customer");
}

export async function registerTradieAction(
  _state: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabasePublicConfigured() || !isSupabaseServerConfigured()) {
    return envError();
  }

  const parsed = tradieRegistrationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    businessName: formData.get("businessName"),
    abn: formData.get("abn"),
    tradeCategory: formData.get("tradeCategory"),
    licenceNumber: formData.get("licenceNumber"),
    serviceArea: formData.get("serviceArea"),
    emergencyAvailable: formData.get("emergencyAvailable")
  });

  if (!parsed.success) {
    return { ok: false, message: "Complete the required Fixer onboarding details." };
  }

  const supabase = await createSupabaseServerClient();
  const admin = createSupabaseAdminClient();

  if (!admin) {
    return envError();
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: "tradie"
      }
    }
  });

  if (authError || !authData.user) {
    return { ok: false, message: authError?.message ?? "Could not create Fixer account." };
  }

  const { data: appUser, error: userError } = await admin
    .from("users")
    .upsert(
      {
        auth_id: authData.user.id,
        email: parsed.data.email,
        phone: parsed.data.phone,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: "tradie",
        status: "active"
      },
      { onConflict: "auth_id" }
    )
    .select("id")
    .single();

  if (userError) {
    return { ok: false, message: userError.message };
  }

  const { data: tradie, error: tradieError } = await admin
    .from("tradie_profiles")
    .upsert(
      {
        user_id: appUser.id,
        business_name: parsed.data.businessName,
        abn: parsed.data.abn || null,
        trade_category: parsed.data.tradeCategory,
        licence_number: parsed.data.licenceNumber || null,
        service_area: parsed.data.serviceArea,
        emergency_available: parsed.data.emergencyAvailable === "on",
        profile_health: 62
      },
      { onConflict: "user_id" }
    )
    .select("id")
    .single();

  if (tradieError) {
    return { ok: false, message: tradieError.message };
  }

  const { data: wallet } = await admin
    .from("tradie_credit_wallets")
    .upsert(
      {
        tradie_id: tradie.id,
        balance: 0,
        bonus_balance: 111,
        bonus_monthly_amount: 111,
        bonus_months_total: 6,
        bonus_months_granted: 1,
        bonus_next_renewal_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        bonus_expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 183).toISOString(),
        signup_bonus_granted_at: new Date().toISOString()
      },
      { onConflict: "tradie_id" }
    )
    .select("id")
    .single();

  if (wallet) {
    await admin.from("credit_transactions").insert({
      wallet_id: wallet.id,
      type: "bonus",
      amount: 111,
      reason: "Signup bonus credits: month 1 of 6",
      created_by: appUser.id
    });
  }
  await admin.from("tradie_subscriptions").upsert({ tradie_id: tradie.id, plan: "starter", status: "active" }, { onConflict: "tradie_id" });

  await notifyFixerRegistered({
    userId: appUser.id,
    email: parsed.data.email,
    firstName: parsed.data.firstName,
    businessName: parsed.data.businessName,
    bonusCredits: 111
  });

  redirect("/dashboard/tradie");
}

export async function signOutAction() {
  if (isSupabasePublicConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}
