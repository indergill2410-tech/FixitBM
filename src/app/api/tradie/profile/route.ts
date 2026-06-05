import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const profileSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  tradeCategory: z.string().trim().min(2).max(80),
  serviceArea: z.string().trim().min(2).max(160),
  abn: z.string().trim().max(40).optional(),
  licenceNumber: z.string().trim().max(80).optional(),
  availabilityStatus: z.enum(["available", "busy", "offline"]),
  emergencyAvailable: z.boolean()
});

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user || user.role !== "tradie") {
    return NextResponse.json({ error: "Fixer access required." }, { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Supabase server key is not configured." }, { status: 503 });
  }

  const formData = await request.formData();
  const parsed = profileSchema.safeParse({
    businessName: String(formData.get("businessName") ?? ""),
    tradeCategory: String(formData.get("tradeCategory") ?? ""),
    serviceArea: String(formData.get("serviceArea") ?? ""),
    abn: String(formData.get("abn") ?? ""),
    licenceNumber: String(formData.get("licenceNumber") ?? ""),
    availabilityStatus: String(formData.get("availabilityStatus") ?? "available"),
    emergencyAvailable: formData.get("emergencyAvailable") === "on"
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Complete the required business profile details." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

  const profileHealth = calculateProfileHealth(parsed.data);

  const { error } = await supabase
    .from("tradie_profiles")
    .update({
      business_name: parsed.data.businessName,
      trade_category: parsed.data.tradeCategory,
      service_area: parsed.data.serviceArea,
      abn: parsed.data.abn || null,
      licence_number: parsed.data.licenceNumber || null,
      availability_status: parsed.data.availabilityStatus,
      emergency_available: parsed.data.emergencyAvailable,
      profile_health: profileHealth
    })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidatePath("/dashboard/tradie");
  revalidatePath("/dashboard/tradie/profile");
  revalidatePath("/dashboard/tradie/leads");

  return NextResponse.json({ ok: true });
}

function calculateProfileHealth(profile: z.infer<typeof profileSchema>) {
  let score = 45;
  if (profile.businessName) score += 10;
  if (profile.tradeCategory) score += 10;
  if (profile.serviceArea) score += 10;
  if (profile.abn) score += 10;
  if (profile.licenceNumber) score += 10;
  if (profile.emergencyAvailable) score += 5;
  return Math.min(score, 100);
}
