import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const propertySchema = z.object({
  label: z.string().trim().max(80).optional(),
  address: z.string().trim().min(3).max(180),
  suburb: z.string().trim().max(80).optional(),
  postcode: z.string().trim().max(16).optional(),
  state: z.string().trim().max(16).optional(),
  isDefault: z.boolean()
});

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user || !["customer", "admin", "super_admin"].includes(user.role)) {
    return NextResponse.json({ error: "Customer access required." }, { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase server key is not configured." }, { status: 503 });
  }

  const formData = await request.formData();
  const parsed = propertySchema.safeParse({
    label: String(formData.get("label") ?? ""),
    address: String(formData.get("address") ?? ""),
    suburb: String(formData.get("suburb") ?? ""),
    postcode: String(formData.get("postcode") ?? ""),
    state: String(formData.get("state") ?? ""),
    isDefault: formData.get("isDefault") === "on"
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid property address." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  if (parsed.data.isDefault) {
    await supabase.from("saved_properties").update({ is_default: false }).eq("customer_id", user.id);
  }

  const { error } = await supabase.from("saved_properties").insert({
    customer_id: user.id,
    label: parsed.data.label || "Property",
    address: parsed.data.address,
    suburb: parsed.data.suburb || null,
    postcode: parsed.data.postcode || null,
    state: parsed.data.state || null,
    is_default: parsed.data.isDefault
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/dashboard/customer/properties");
  return NextResponse.json({ ok: true });
}
