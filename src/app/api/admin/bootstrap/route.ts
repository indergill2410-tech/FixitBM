import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  secret: z.string().min(16)
});

export async function POST(request: Request) {
  if (!process.env.ADMIN_BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Admin setup is unavailable." }, { status: 503 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Admin setup is unavailable." }, { status: 503 });
  }

  const parsed = bootstrapSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: "Provide admin email, password, name, and bootstrap secret." }, { status: 400 });
  }

  if (parsed.data.secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: "Invalid bootstrap secret." }, { status: 403 });
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Admin setup is unavailable." }, { status: 503 });
  }

  const { data: existingUser } = await supabase
    .from("users")
    .select("id, role")
    .eq("email", parsed.data.email)
    .maybeSingle();

  let authId: string | null = null;

  if (!existingUser) {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: parsed.data.email,
      password: parsed.data.password,
      email_confirm: true,
      user_metadata: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: "super_admin"
      }
    });

    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message ?? "Could not create admin auth user." }, { status: 500 });
    }

    authId = authData.user.id;
  }

  const { data: appUser, error: userError } = await supabase
    .from("users")
    .upsert(
      {
        auth_id: authId ?? undefined,
        email: parsed.data.email,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        role: "super_admin",
        status: "active"
      },
      { onConflict: "email" }
    )
    .select("id")
    .single();

  if (userError || !appUser) {
    return NextResponse.json({ error: userError?.message ?? "Could not create admin profile." }, { status: 500 });
  }

  await supabase.from("admin_profiles").upsert(
    {
      user_id: appUser.id,
      title: "Founder / Super Admin",
      can_manage_admins: true
    },
    { onConflict: "user_id" }
  );

  await supabase.from("audit_logs").insert({
    actor_id: appUser.id,
    action: "create",
    entity_type: "admin_profile",
    entity_id: appUser.id,
    metadata: { bootstrap: true }
  });

  return NextResponse.json({
    ok: true,
    message: "Super admin account is ready. Rotate ADMIN_BOOTSTRAP_SECRET after use."
  });
}
