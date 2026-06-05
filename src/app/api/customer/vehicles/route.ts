import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const vehicleSchema = z.object({
  label: z.string().trim().max(80).optional(),
  make: z.string().trim().min(1).max(80),
  model: z.string().trim().min(1).max(80),
  year: z.coerce.number().int().min(1900).max(2100).optional().or(z.literal("").transform(() => undefined)),
  registration: z.string().trim().max(32).optional(),
  fuelType: z.string().trim().max(40).optional(),
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
  const parsed = vehicleSchema.safeParse({
    label: String(formData.get("label") ?? ""),
    make: String(formData.get("make") ?? ""),
    model: String(formData.get("model") ?? ""),
    year: String(formData.get("year") ?? ""),
    registration: String(formData.get("registration") ?? ""),
    fuelType: String(formData.get("fuelType") ?? ""),
    isDefault: formData.get("isDefault") === "on"
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid vehicle make and model." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  if (parsed.data.isDefault) {
    await supabase.from("saved_vehicles").update({ is_default: false }).eq("customer_id", user.id);
  }

  const { error } = await supabase.from("saved_vehicles").insert({
    customer_id: user.id,
    label: parsed.data.label || "Vehicle",
    make: parsed.data.make,
    model: parsed.data.model,
    year: parsed.data.year ?? null,
    registration: parsed.data.registration || null,
    fuel_type: parsed.data.fuelType || null,
    is_default: parsed.data.isDefault
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/dashboard/customer/vehicles");
  return NextResponse.json({ ok: true });
}
