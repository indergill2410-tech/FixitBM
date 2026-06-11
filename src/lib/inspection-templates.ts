// Rental compliance inspection templates.
//
// National baseline (works in every state) with Victoria-aware statutory
// frequencies surfaced as guidance. Each category maps to a digital compliance
// report section; critical items drive the overall pass / fail verdict.
//
// These templates are pure data so they can be shared by the Fixer report form
// (client), the server action that publishes the report, the customer report
// view, and the certificate renderer.

export type InspectionItemStatus = "pass" | "action_required" | "fail" | "na";
export type ComplianceResult = "pass" | "fail" | "action_required" | "not_applicable";

export type InspectionItemTemplate = {
  key: string;
  label: string;
  /** A critical item that fails forces an overall category/inspection FAIL. */
  critical?: boolean;
  help?: string;
};

export type InspectionCategoryTemplate = {
  key: string;
  label: string;
  shortLabel: string;
  /** Statutory re-check cadence in months. null = situational (e.g. new tenancy). */
  frequencyMonths: number | null;
  frequencyLabel: string;
  regulatoryNote: string;
  /** Regulated trade categories require a licensed inspector + licence number. */
  requiresLicence: boolean;
  licenceTrade?: string;
  items: InspectionItemTemplate[];
};

export const inspectionItemStatuses: { value: InspectionItemStatus; label: string }[] = [
  { value: "pass", label: "Pass" },
  { value: "action_required", label: "Action required" },
  { value: "fail", label: "Fail" },
  { value: "na", label: "Not applicable" }
];

export const SMOKE_ALARM: InspectionCategoryTemplate = {
  key: "smoke_alarm",
  label: "Smoke alarm safety check",
  shortLabel: "Smoke alarms",
  frequencyMonths: 12,
  frequencyLabel: "Recommended annually",
  regulatoryNote: "Smoke alarms must be installed, tested and maintained for every tenancy under Australian rental laws (e.g. AS 3786).",
  requiresLicence: false,
  items: [
    { key: "alarms_present_each_level", label: "Working smoke alarm installed on every storey", critical: true },
    { key: "alarms_correct_location", label: "Alarms positioned near sleeping areas / hallways" },
    { key: "alarm_test_button", label: "Test button activates the alarm", critical: true },
    { key: "alarm_within_expiry", label: "Alarms within 10-year expiry date", critical: true },
    { key: "battery_replaced", label: "Batteries tested / replaced where required" },
    { key: "interconnection_check", label: "Interconnection working (where fitted)" },
    { key: "co_alarm_where_required", label: "Carbon monoxide alarm present where required" }
  ]
};

export const GAS: InspectionCategoryTemplate = {
  key: "gas",
  label: "Gas safety check",
  shortLabel: "Gas",
  frequencyMonths: 24,
  frequencyLabel: "Recommended every 2 years",
  regulatoryNote: "Gas safety checks must be carried out by a licensed gasfitter. Victorian rentals require checks at least every 2 years.",
  requiresLicence: true,
  licenceTrade: "Licensed gasfitter",
  items: [
    { key: "appliance_operation", label: "Gas appliances operate correctly" },
    { key: "co_test_negative", label: "Carbon monoxide spillage test within limits", critical: true },
    { key: "gas_leak_test", label: "No gas leaks detected", critical: true },
    { key: "ventilation_adequate", label: "Appliance ventilation adequate" },
    { key: "flue_condition", label: "Flues clear and in good condition" },
    { key: "isolation_valve_accessible", label: "Gas isolation valve accessible" },
    { key: "appliance_servicing_record", label: "Servicing record / data plate present" }
  ]
};

export const ELECTRICAL: InspectionCategoryTemplate = {
  key: "electrical",
  label: "Electrical safety check",
  shortLabel: "Electrical",
  frequencyMonths: 24,
  frequencyLabel: "Recommended every 2 years",
  regulatoryNote: "Electrical safety checks must be carried out by a licensed electrician. Victorian rentals require checks at least every 2 years.",
  requiresLicence: true,
  licenceTrade: "Licensed electrician",
  items: [
    { key: "switchboard_condition", label: "Switchboard safe and in good condition" },
    { key: "rcd_present", label: "RCD / safety switch installed", critical: true },
    { key: "rcd_trip_test", label: "RCD trips within required time", critical: true },
    { key: "socket_outlets_condition", label: "Socket outlets safe and undamaged" },
    { key: "visible_wiring_condition", label: "Accessible wiring in safe condition" },
    { key: "light_fittings_condition", label: "Light fittings safe and secure" },
    { key: "earth_continuity", label: "Earthing / bonding satisfactory", critical: true }
  ]
};

export const MINIMUM_STANDARDS: InspectionCategoryTemplate = {
  key: "minimum_standards",
  label: "Rental minimum standards",
  shortLabel: "Minimum standards",
  frequencyMonths: null,
  frequencyLabel: "At the start of each new tenancy",
  regulatoryNote: "Rental minimum standards must be met before a new tenancy begins (locks, amenities, structure, ventilation).",
  requiresLicence: false,
  items: [
    { key: "locks_external_doors", label: "External entry doors lockable", critical: true },
    { key: "windows_secure", label: "Windows secure and functional" },
    { key: "vermin_proof", label: "Property reasonably vermin proof" },
    { key: "toilet_functional", label: "Functioning toilet in good working order", critical: true },
    { key: "bathroom_washbasin", label: "Washbasin with hot and cold water" },
    { key: "kitchen_cooktop_sink", label: "Kitchen cooktop and sink in working order" },
    { key: "hot_and_cold_water", label: "Adequate hot and cold water supply", critical: true },
    { key: "heating_fixed", label: "Fixed heater in main living area" },
    { key: "structural_soundness", label: "Property structurally sound", critical: true },
    { key: "mould_damp_free", label: "Free of serious mould and damp" },
    { key: "ventilation_rooms", label: "Rooms adequately ventilated" }
  ]
};

export const POOL_SPA: InspectionCategoryTemplate = {
  key: "pool_spa",
  label: "Pool & spa barrier check",
  shortLabel: "Pool / spa",
  frequencyMonths: null,
  frequencyLabel: "Per state pool safety register requirements",
  regulatoryNote: "Pool and spa barriers must comply with the relevant state safety barrier standard.",
  requiresLicence: false,
  items: [
    { key: "barrier_height_compliant", label: "Barrier height compliant", critical: true },
    { key: "gate_self_closing", label: "Gate self-closing", critical: true },
    { key: "gate_self_latching", label: "Gate self-latching", critical: true },
    { key: "no_climbable_objects", label: "No climbable objects within the non-climb zone" },
    { key: "cpr_sign_present", label: "CPR sign present and legible" },
    { key: "water_recirculation", label: "No standing/stagnant water hazards" }
  ]
};

// Legacy home readiness check (Fixit Plus members) — kept so existing
// "home" / "home_and_road" Safety Checks continue to work unchanged.
export const GENERAL_READINESS: InspectionCategoryTemplate = {
  key: "general_readiness",
  label: "Home safety & readiness",
  shortLabel: "Readiness",
  frequencyMonths: 6,
  frequencyLabel: "Every 6 months while a Fixit Plus member",
  regulatoryNote: "A visual readiness check to spot maintenance concerns and emergency-preparation gaps.",
  requiresLicence: false,
  items: [
    { key: "water_shutoff", label: "Water shutoff and visible leak readiness" },
    { key: "electrical_visible", label: "Electrical visible concern awareness" },
    { key: "fire_smoke", label: "Fire and smoke alarm reminders" },
    { key: "lockout_access", label: "Lockout and access readiness" },
    { key: "roof_gutter_storm", label: "Roof, gutter, and storm readiness" },
    { key: "appliance_hvac", label: "Appliance, hot water, and HVAC visual concerns" },
    { key: "home_profile", label: "Home profile completion" },
    { key: "vehicle_readiness", label: "Vehicle readiness for Complete members" }
  ]
};

export const inspectionCategoryMap: Record<string, InspectionCategoryTemplate> = {
  smoke_alarm: SMOKE_ALARM,
  gas: GAS,
  electrical: ELECTRICAL,
  minimum_standards: MINIMUM_STANDARDS,
  pool_spa: POOL_SPA,
  general_readiness: GENERAL_READINESS
};

// Categories a customer can book as a rental compliance inspection.
export const bookableComplianceCategories: InspectionCategoryTemplate[] = [
  SMOKE_ALARM,
  GAS,
  ELECTRICAL,
  MINIMUM_STANDARDS,
  POOL_SPA
];

export const complianceCategoryKeys = bookableComplianceCategories.map((category) => category.key);

/**
 * Resolves which checklist categories an inspection should cover, given the
 * stored check_type and requested_categories array.
 */
export function getCategoriesForCheck(
  checkType: string,
  requestedCategories: string[] | null | undefined
): InspectionCategoryTemplate[] {
  const requested = (requestedCategories ?? []).filter((key) => key in inspectionCategoryMap);

  if (requested.length) {
    return requested.map((key) => inspectionCategoryMap[key]);
  }

  if (complianceCategoryKeys.includes(checkType)) {
    return [inspectionCategoryMap[checkType]];
  }

  if (checkType === "rental_compliance") {
    // Compliance booking with no stored categories — default to the full bundle.
    return bookableComplianceCategories;
  }

  // home / home_and_road / digital → legacy readiness checklist.
  return [GENERAL_READINESS];
}

/** Soonest statutory re-check date for the inspected categories. */
export function nextDueForCategories(categoryKeys: string[], from = new Date()): Date {
  const months = categoryKeys
    .map((key) => inspectionCategoryMap[key]?.frequencyMonths)
    .filter((value): value is number => typeof value === "number");

  // Fall back to a 12-month review when every category is situational.
  const soonest = months.length ? Math.min(...months) : 12;
  const due = new Date(from);
  due.setMonth(due.getMonth() + soonest);
  return due;
}

export function frequencyMonthsFor(categoryKey: string): number | null {
  return inspectionCategoryMap[categoryKey]?.frequencyMonths ?? null;
}

export function isComplianceCheck(checkType: string, requestedCategories: string[] | null | undefined): boolean {
  if (checkType === "rental_compliance") return true;
  if (complianceCategoryKeys.includes(checkType)) return true;
  return (requestedCategories ?? []).some((key) => complianceCategoryKeys.includes(key));
}

export const complianceResultLabel: Record<ComplianceResult, string> = {
  pass: "Compliant",
  fail: "Non-compliant",
  action_required: "Action required",
  not_applicable: "Not applicable"
};
