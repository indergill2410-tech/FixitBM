import { unstable_noStore as noStore } from "next/cache";
import type { AppUser } from "@/lib/auth";
import { getCustomerJobs, getCustomerSavedProperties, getCustomerSavedVehicles, type SavedProperty, type SavedVehicle } from "@/lib/jobs";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const safetyCheckDisclaimer =
  "The Fixit247 Safety Check is a visual home safety and readiness check designed to help identify visible risks, maintenance needs, and emergency preparation gaps. It is not a building inspection, electrical certificate, gas compliance certificate, pest inspection, insurance assessment, or mechanical inspection. Specialist inspections, compliance certificates, repairs, parts, labour, towing, trade work, renovations, and specialist services are quoted separately unless specifically included.";

export const activationCopy =
  "To keep Fixit Plus fair for every member, benefits activate after 72 hours. Existing emergencies can still be posted free and handled as pay-as-you-go requests.";

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

  const [membership, properties, vehicles, jobs] = await Promise.all([
    getCustomerMembershipSummary(user),
    getCustomerSavedProperties(user),
    getCustomerSavedVehicles(user),
    getCustomerJobs(user)
  ]);

  const isActiveMember = membership?.status === "active";
  const isComplete = membership?.plan === "complete";
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

  score = Math.min(score, 100);

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

  const safetyCheckState: SafetyCheckState = !membership
    ? "free_user"
    : isActiveMember
      ? "available_to_book"
      : "pending_activation";

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
    safetyCheckCta: safetyCheckState === "available_to_book" ? "Book My Safety Check" : safetyCheckState === "pending_activation" ? "View Membership" : "Join Fixit Plus",
    nextDueLabel: safetyCheckState === "available_to_book" ? "Ready to book after activation" : safetyCheckState === "pending_activation" ? "Activation pending" : "Included with Fixit Plus",
    recommendedFixes: []
  };
}
