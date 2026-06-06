import { unstable_noStore as noStore } from "next/cache";
import type { AppUser } from "@/lib/auth";
import {
  getCustomerJobs,
  getCustomerSavedProperties,
  getCustomerSavedVehicles,
  getTradieProfileForUser,
  type SavedProperty,
  type SavedVehicle
} from "@/lib/jobs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured, isSupabaseServerConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const safetyCheckDisclaimer =
  "The Fixit247 Safety Check is a visual home safety and readiness check designed to help identify visible risks, maintenance needs, and emergency preparation gaps. It is not a building inspection, electrical certificate, gas compliance certificate, pest inspection, insurance assessment, or mechanical inspection. Specialist inspections, compliance certificates, repairs, parts, labour, towing, trade work, renovations, and specialist services are quoted separately unless specifically included.";

export const activationCopy =
  "To keep Fixit Plus fair for every member, benefits activate after 72 hours. Existing emergencies can still be started free and handled as pay-as-you-go requests.";

export const safetyCheckChecklist = [
  "Water shutoff and visible leak readiness",
  "Electrical visible risk awareness",
  "Fire and smoke alarm reminders",
  "Lockout and access readiness",
  "Roof, gutter, and storm readiness",
  "Appliance, hot water, and HVAC visual concerns",
  "Home profile completion",
  "Vehicle readiness for Complete members"
];

export const recommendedFixExamples = [
  "Leaking tap",
  "Gutter cleaning",
  "Lock repair",
  "Hot water concern",
  "Roof leak sign",
  "Smoke alarm reminder",
  "Deck maintenance",
  "Painting maintenance",
  "Pest concern",
  "Electrical visible risk"
];

export type CustomerMembershipSummary = {
  plan: "home" | "complete" | string;
  status: string;
  current_period_end: string | null;
  created_at: string | null;
} | null;

export type SafetyCheckState = "free_user" | "pending_activation" | "available_to_book" | "booked" | "assigned" | "completed" | "overdue";

export type SafetyCheckStatus = "due" | "booked" | "assigned" | "completed" | "cancelled" | "overdue";
export type SafetyCheckType = "home" | "home_and_road" | "digital";

export type SafetyCheckRecord = {
  id: string;
  customer_id: string;
  membership_id: string | null;
  property_id: string | null;
  assigned_fixer_id: string | null;
  status: SafetyCheckStatus;
  check_type: SafetyCheckType;
  preferred_window: string | null;
  customer_notes: string | null;
  scheduled_at: string | null;
  completed_at: string | null;
  next_due_at: string | null;
  score_before: number | null;
  score_after: number | null;
  summary: string | null;
  report_published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SafetyCheckItem = {
  id: string;
  safety_check_id: string;
  category: string;
  label: string;
  status: "ok" | "attention" | "recommended" | "not_checked";
  notes: string | null;
  created_at: string;
};

export type SafetyCheckRecommendation = {
  id: string;
  safety_check_id: string | null;
  customer_id: string;
  property_id: string | null;
  title: string;
  category: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  description: string | null;
  estimated_trade_type: string | null;
  status: "recommended" | "quote_requested" | "converted_to_request" | "dismissed";
  linked_job_id: string | null;
  created_at: string;
  updated_at: string;
};

export type HomeProtectionScoreRecord = {
  id: string;
  customer_id: string;
  property_id: string | null;
  score: number;
  reason_summary: string | null;
  calculated_at: string;
};

export type CustomerSafetyCheckDetail = SafetyCheckRecord & {
  property: SavedProperty | null;
  items: SafetyCheckItem[];
  recommendations: SafetyCheckRecommendation[];
};

export type AdminSafetyCheckRow = SafetyCheckRecord & {
  customer_name: string;
  customer_email: string | null;
  property_label: string;
  assigned_fixer_name: string | null;
};

export type TradieSafetyCheckRow = SafetyCheckRecord & {
  customer_name: string;
  property_label: string;
  property_location: string;
};

export type HomeProtectionSummary = {
  membership: CustomerMembershipSummary;
  properties: SavedProperty[];
  vehicles: SavedVehicle[];
  requestCount: number;
  activeRequestCount: number;
  completedRequestCount: number;
  score: number;
  scoreBand: "low" | "medium" | "high";
  scoreHeadline: string;
  scoreCopy: string;
  safetyCheckState: SafetyCheckState;
  safetyCheckCta: string;
  nextDueLabel: string;
  recommendedFixes: string[];
  safetyChecks: SafetyCheckRecord[];
  latestSafetyCheck: SafetyCheckRecord | null;
  nextSafetyCheck: SafetyCheckRecord | null;
  recommendations: SafetyCheckRecommendation[];
};

export async function getCustomerMembershipSummary(user: AppUser): Promise<CustomerMembershipSummary> {
  noStore();

  if (!isSupabasePublicConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("memberships")
    .select("plan, plan_code, status, current_period_end, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  return {
    plan: data.plan ?? data.plan_code ?? "home",
    status: data.status ?? "inactive",
    current_period_end: data.current_period_end ?? null,
    created_at: data.created_at ?? null
  };
}

export async function getHomeProtectionSummary(user: AppUser): Promise<HomeProtectionSummary> {
  noStore();

  const [membership, properties, vehicles, jobs, safetyChecks, recommendations, scoreRows] = await Promise.all([
    getCustomerMembershipSummary(user),
    getCustomerSavedProperties(user),
    getCustomerSavedVehicles(user),
    getCustomerJobs(user),
    getCustomerSafetyChecks(user),
    getCustomerSafetyCheckRecommendations(user),
    getCustomerHomeProtectionScores(user)
  ]);

  const isActiveMember = membership?.status === "active";
  const isComplete = membership?.plan === "complete";
  const activeSafetyCheck = safetyChecks.find((check) => ["booked", "assigned"].includes(check.status));
  const latestSafetyCheck = safetyChecks.find((check) => check.status === "completed") ?? safetyChecks[0] ?? null;
  const latestScore = scoreRows[0]?.score ?? latestSafetyCheck?.score_after ?? null;
  const activeRequestCount = jobs.filter((job) => !["completed", "reviewed", "closed", "cancelled"].includes(job.status)).length;
  const completedRequestCount = jobs.filter((job) => ["completed", "reviewed", "closed"].includes(job.status)).length;
  const hasDefaultProperty = properties.some((property) => property.is_default);
  const hasAddress = properties.some((property) => Boolean(property.address));
  const hasVehicle = vehicles.length > 0;

  let score = 20;
  if (properties.length) score += 15;
  if (hasAddress) score += 10;
  if (hasDefaultProperty) score += 5;
  if (isActiveMember && membership?.plan === "home") score += 20;
  if (isActiveMember && isComplete) score += 30;
  if (hasVehicle) score += 10;
  if (jobs.length) score += 5;

  score = latestScore ?? Math.min(score, 100);

  const scoreBand = score >= 75 ? "high" : score >= 45 ? "medium" : "low";
  const scoreText = {
    low: {
      headline: "Your home plan is just getting started.",
      copy: "Join Fixit Plus and book your first Safety Check to improve your readiness before the next emergency."
    },
    medium: {
      headline: "You're building a stronger home emergency plan.",
      copy: "Complete your home profile and book your Safety Check to stay prepared."
    },
    high: {
      headline: "Your home is better prepared for the unexpected.",
      copy: "Keep your details updated and complete your next 6-monthly Safety Check."
    }
  }[scoreBand];

  const safetyCheckState: SafetyCheckState = activeSafetyCheck?.status === "assigned"
    ? "assigned"
    : activeSafetyCheck?.status === "booked"
      ? "booked"
      : latestSafetyCheck?.status === "overdue"
        ? "overdue"
        : latestSafetyCheck?.status === "completed"
          ? "completed"
          : !membership
            ? "free_user"
            : isActiveMember
              ? "available_to_book"
              : "pending_activation";

  const nextDueLabel = activeSafetyCheck
    ? activeSafetyCheck.scheduled_at
      ? `Booked for ${new Date(activeSafetyCheck.scheduled_at).toLocaleDateString()}`
      : activeSafetyCheck.preferred_window
        ? `Requested: ${activeSafetyCheck.preferred_window}`
        : "Booking requested"
    : latestSafetyCheck?.next_due_at
      ? `Next due ${new Date(latestSafetyCheck.next_due_at).toLocaleDateString()}`
      : safetyCheckState === "available_to_book"
        ? "Ready to book after activation"
        : safetyCheckState === "pending_activation"
          ? "Activation pending"
          : "Included with Fixit Plus";

  const safetyCheckCta = safetyCheckState === "booked" || safetyCheckState === "assigned"
    ? "View Booking"
    : safetyCheckState === "available_to_book" || safetyCheckState === "completed"
      ? "Book My Safety Check"
      : safetyCheckState === "pending_activation"
        ? "View Membership"
        : "Join Fixit Plus";

  return {
    membership,
    properties,
    vehicles,
    requestCount: jobs.length,
    activeRequestCount,
    completedRequestCount,
    score,
    scoreBand,
    scoreHeadline: scoreText.headline,
    scoreCopy: scoreText.copy,
    safetyCheckState,
    safetyCheckCta,
    nextDueLabel,
    recommendedFixes: recommendations.length ? recommendations.map((recommendation) => recommendation.title) : [],
    safetyChecks,
    latestSafetyCheck,
    nextSafetyCheck: activeSafetyCheck ?? null,
    recommendations
  };
}

export async function getCustomerSafetyChecks(user: AppUser): Promise<SafetyCheckRecord[]> {
  noStore();

  if (!isSupabasePublicConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("safety_checks")
    .select(safetyCheckSelect)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as SafetyCheckRecord[];
}

export async function getCustomerSafetyCheckRecommendations(user: AppUser): Promise<SafetyCheckRecommendation[]> {
  noStore();

  if (!isSupabasePublicConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("safety_check_recommendations")
    .select(recommendationSelect)
    .eq("customer_id", user.id)
    .neq("status", "dismissed")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as SafetyCheckRecommendation[];
}

export async function getCustomerHomeProtectionScores(user: AppUser): Promise<HomeProtectionScoreRecord[]> {
  noStore();

  if (!isSupabasePublicConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("home_protection_scores")
    .select("id, customer_id, property_id, score, reason_summary, calculated_at")
    .eq("customer_id", user.id)
    .order("calculated_at", { ascending: false })
    .limit(5);

  if (error) return [];
  return (data ?? []) as HomeProtectionScoreRecord[];
}

export async function getCustomerSafetyCheckDetail(user: AppUser, id: string): Promise<CustomerSafetyCheckDetail | null> {
  noStore();

  if (!isSupabasePublicConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data: check, error } = await supabase
    .from("safety_checks")
    .select(safetyCheckSelect)
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error || !check) return null;

  const [{ data: items }, { data: recommendations }, properties] = await Promise.all([
    supabase
      .from("safety_check_items")
      .select("id, safety_check_id, category, label, status, notes, created_at")
      .eq("safety_check_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("safety_check_recommendations")
      .select(recommendationSelect)
      .eq("safety_check_id", id)
      .order("created_at", { ascending: false }),
    getCustomerSavedProperties(user)
  ]);

  return {
    ...(check as SafetyCheckRecord),
    property: properties.find((property) => property.id === check.property_id) ?? null,
    items: (items ?? []) as SafetyCheckItem[],
    recommendations: (recommendations ?? []) as SafetyCheckRecommendation[]
  };
}

export async function getAdminSafetyCheckQueue(): Promise<AdminSafetyCheckRow[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data: checks, error } = await supabase
    .from("safety_checks")
    .select(safetyCheckSelect)
    .order("created_at", { ascending: false })
    .limit(80);

  if (error || !checks?.length) return [];

  const customerIds = Array.from(new Set(checks.map((check) => check.customer_id).filter(Boolean)));
  const propertyIds = Array.from(new Set(checks.map((check) => check.property_id).filter(Boolean))) as string[];
  const fixerIds = Array.from(new Set(checks.map((check) => check.assigned_fixer_id).filter(Boolean))) as string[];

  const [{ data: customers }, { data: properties }, { data: fixers }] = await Promise.all([
    customerIds.length
      ? supabase.from("users").select("id, email, first_name, last_name").in("id", customerIds)
      : Promise.resolve({ data: [] }),
    propertyIds.length
      ? supabase.from("saved_properties").select("id, label, address, suburb, postcode, state").in("id", propertyIds)
      : Promise.resolve({ data: [] }),
    fixerIds.length
      ? supabase.from("tradie_profiles").select("id, business_name, trade_category").in("id", fixerIds)
      : Promise.resolve({ data: [] })
  ]);

  const customerById = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const propertyById = new Map((properties ?? []).map((property) => [property.id, property]));
  const fixerById = new Map((fixers ?? []).map((fixer) => [fixer.id, fixer]));

  return (checks as SafetyCheckRecord[]).map((check) => {
    const customer = customerById.get(check.customer_id);
    const property = check.property_id ? propertyById.get(check.property_id) : null;
    const fixer = check.assigned_fixer_id ? fixerById.get(check.assigned_fixer_id) : null;

    return {
      ...check,
      customer_name: [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || customer?.email || "Customer",
      customer_email: customer?.email ?? null,
      property_label: formatSafetyCheckProperty(property),
      assigned_fixer_name: fixer ? fixer.business_name || fixer.trade_category || "Assigned Fixer" : null
    };
  });
}

export async function getTradieAssignedSafetyChecks(user: AppUser): Promise<TradieSafetyCheckRow[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const tradie = await getTradieProfileForUser(user);
  if (!tradie) return [];

  const { data: checks, error } = await supabase
    .from("safety_checks")
    .select(safetyCheckSelect)
    .eq("assigned_fixer_id", tradie.id)
    .in("status", ["assigned", "booked", "overdue"])
    .order("scheduled_at", { ascending: true, nullsFirst: false })
    .limit(20);

  if (error || !checks?.length) return [];

  const customerIds = Array.from(new Set(checks.map((check) => check.customer_id)));
  const propertyIds = Array.from(new Set(checks.map((check) => check.property_id).filter(Boolean))) as string[];

  const [{ data: customers }, { data: properties }] = await Promise.all([
    customerIds.length
      ? supabase.from("users").select("id, first_name, last_name, email").in("id", customerIds)
      : Promise.resolve({ data: [] }),
    propertyIds.length
      ? supabase.from("saved_properties").select("id, label, address, suburb, postcode, state").in("id", propertyIds)
      : Promise.resolve({ data: [] })
  ]);

  const customerById = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const propertyById = new Map((properties ?? []).map((property) => [property.id, property]));

  return (checks as SafetyCheckRecord[]).map((check) => {
    const customer = customerById.get(check.customer_id);
    const property = check.property_id ? propertyById.get(check.property_id) : null;

    return {
      ...check,
      customer_name: [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") || customer?.email || "Customer",
      property_label: property?.label || property?.address || "Property",
      property_location: [property?.suburb, property?.postcode, property?.state].filter(Boolean).join(" ") || "Location pending"
    };
  });
}

function formatSafetyCheckProperty(property?: Partial<SavedProperty> | null) {
  if (!property) return "Property pending";
  const label = property.label || property.address || "Property";
  const location = [property.suburb, property.postcode, property.state].filter(Boolean).join(" ");
  return location ? `${label} - ${location}` : label;
}

const safetyCheckSelect =
  "id, customer_id, membership_id, property_id, assigned_fixer_id, status, check_type, preferred_window, customer_notes, scheduled_at, completed_at, next_due_at, score_before, score_after, summary, report_published_at, created_at, updated_at";

const recommendationSelect =
  "id, safety_check_id, customer_id, property_id, title, category, priority, description, estimated_trade_type, status, linked_job_id, created_at, updated_at";
