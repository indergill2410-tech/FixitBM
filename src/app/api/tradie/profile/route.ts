import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { notifyFixerOnboardingCompleted } from "@/lib/email";
import { createAdminNotifications } from "@/lib/notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

const profileSchema = z.object({
  businessName: z.string().trim().min(2).max(120),
  tradeCategory: z.string().trim().min(2).max(80),
  serviceArea: z.string().trim().min(2).max(160),
  abn: z.string().trim().max(40).optional(),
  licenceNumber: z.string().trim().max(80).optional(),
  publicLiabilityInsurance: z.enum(["yes", "no", "not_supplied"]),
  yearsExperience: z.coerce.number().int().min(0).max(80).optional().nullable(),
  servicesDescription: z.string().trim().max(1000).optional(),
  availabilityStatus: z.enum(["available", "busy", "offline"]),
  emergencyAvailable: z.boolean(),
  agencyPropertyMaintenanceInterest: z.boolean(),
  plannedMaintenanceContractsInterest: z.boolean()
});

export async function POST(request: Request) {
  const user = await getCurrentAppUser();

  if (!user || user.role !== "tradie") {
    return NextResponse.json({ error: "Fixer access required." }, { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json({ error: "Profile saving is temporarily unavailable." }, { status: 503 });
  }

  const formData = await request.formData();
  const parsed = profileSchema.safeParse({
    businessName: String(formData.get("businessName") ?? ""),
    tradeCategory: String(formData.get("tradeCategory") ?? ""),
    serviceArea: String(formData.get("serviceArea") ?? ""),
    abn: String(formData.get("abn") ?? ""),
    licenceNumber: String(formData.get("licenceNumber") ?? ""),
    publicLiabilityInsurance: String(formData.get("publicLiabilityInsurance") ?? "not_supplied"),
    yearsExperience: formData.get("yearsExperience") ? String(formData.get("yearsExperience")) : null,
    servicesDescription: String(formData.get("servicesDescription") ?? ""),
    availabilityStatus: String(formData.get("availabilityStatus") ?? "available"),
    emergencyAvailable: formData.get("emergencyAvailable") === "on",
    agencyPropertyMaintenanceInterest: formData.get("agencyPropertyMaintenanceInterest") === "on",
    plannedMaintenanceContractsInterest: formData.get("plannedMaintenanceContractsInterest") === "on"
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Complete the required business profile details." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ error: "Profile saving is temporarily unavailable." }, { status: 503 });

  const profileHealth = calculateProfileHealth(parsed.data);

  const { data: existingProfile } = await supabase
    .from("tradie_profiles")
    .select("id, business_name, trade_category, service_area, abn, licence_number, emergency_available, public_liability_insurance, services_description, agency_property_maintenance_interest, planned_maintenance_contracts_interest")
    .eq("user_id", user.id)
    .maybeSingle();
  const wasComplete = isFixerOnboardingComplete(existingProfile);

  const { error } = await supabase
    .from("tradie_profiles")
    .update({
      business_name: parsed.data.businessName,
      trade_category: parsed.data.tradeCategory,
      service_area: parsed.data.serviceArea,
      abn: parsed.data.abn || null,
      licence_number: parsed.data.licenceNumber || null,
      public_liability_insurance: parsed.data.publicLiabilityInsurance,
      years_experience: parsed.data.yearsExperience,
      services_description: parsed.data.servicesDescription || null,
      availability_status: parsed.data.availabilityStatus,
      emergency_available: parsed.data.emergencyAvailable,
      agency_property_maintenance_interest: parsed.data.agencyPropertyMaintenanceInterest,
      planned_maintenance_contracts_interest: parsed.data.plannedMaintenanceContractsInterest,
      profile_health: profileHealth
    })
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const completedProfile = {
    ...existingProfile,
    business_name: parsed.data.businessName,
    trade_category: parsed.data.tradeCategory,
    service_area: parsed.data.serviceArea,
    abn: parsed.data.abn || null,
    licence_number: parsed.data.licenceNumber || null,
    emergency_available: parsed.data.emergencyAvailable,
    public_liability_insurance: parsed.data.publicLiabilityInsurance,
    services_description: parsed.data.servicesDescription || null,
    agency_property_maintenance_interest: parsed.data.agencyPropertyMaintenanceInterest,
    planned_maintenance_contracts_interest: parsed.data.plannedMaintenanceContractsInterest
  };

  if (!wasComplete && isFixerOnboardingComplete(completedProfile)) {
    const profileId = existingProfile?.id;
    await Promise.all([
      notifyFixerOnboardingCompleted({
        userId: user.id,
        email: user.email,
        firstName: user.first_name,
        businessName: parsed.data.businessName,
        tradeCategory: parsed.data.tradeCategory,
        serviceArea: parsed.data.serviceArea,
        emergencyAvailable: parsed.data.emergencyAvailable,
        agencyInterest: parsed.data.agencyPropertyMaintenanceInterest,
        plannedMaintenanceInterest: parsed.data.plannedMaintenanceContractsInterest
      }),
      createAdminNotifications({
        type: "fixer_onboarding_completed",
        title: `Fixer onboarding completed: ${parsed.data.businessName}`,
        body: `${parsed.data.businessName} completed core profile details for ${parsed.data.tradeCategory} in ${parsed.data.serviceArea}.`,
        link: profileId ? `/admin/tradies/${profileId}` : "/admin/tradies"
      })
    ]);
  }

  revalidatePath("/dashboard/tradie");
  revalidatePath("/dashboard/tradie/profile");
  revalidatePath("/dashboard/tradie/leads");

  return NextResponse.json({ ok: true });
}

function isFixerOnboardingComplete(
  profile:
    | {
        business_name?: string | null;
        trade_category?: string | null;
        service_area?: string | null;
        abn?: string | null;
        licence_number?: string | null;
        emergency_available?: boolean | null;
        public_liability_insurance?: string | null;
        services_description?: string | null;
        agency_property_maintenance_interest?: boolean | null;
        planned_maintenance_contracts_interest?: boolean | null;
      }
    | null
    | undefined
) {
  return Boolean(
    profile?.business_name &&
      profile.trade_category &&
      profile.service_area &&
      profile.abn &&
      profile.public_liability_insurance === "yes" &&
      profile.services_description &&
      (profile.emergency_available || profile.planned_maintenance_contracts_interest) &&
      profile.agency_property_maintenance_interest
  );
}

function calculateProfileHealth(profile: z.infer<typeof profileSchema>) {
  let score = 45;
  if (profile.businessName) score += 10;
  if (profile.tradeCategory) score += 10;
  if (profile.serviceArea) score += 10;
  if (profile.abn) score += 10;
  if (profile.licenceNumber) score += 10;
  if (profile.emergencyAvailable) score += 5;
  if (profile.publicLiabilityInsurance === "yes") score += 5;
  if (profile.servicesDescription) score += 5;
  if (profile.agencyPropertyMaintenanceInterest || profile.plannedMaintenanceContractsInterest) score += 5;
  return Math.min(score, 100);
}
