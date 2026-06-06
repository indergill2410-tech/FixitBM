import { unstable_noStore as noStore } from "next/cache";
import type { AppUser } from "@/lib/auth";
import { getCustomerMembershipSummary } from "@/lib/safety-checks";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured, isSupabaseServerConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PropertySafeProfile = {
  id: string;
  customer_id: string;
  property_id: string | null;
  membership_id: string | null;
  status: "draft" | "active" | "paused" | "archived";
  protection_level: "monitor" | "plus" | "complete";
  display_name: string | null;
  last_assessed_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertySafeAssessment = {
  id: string;
  propertysafe_profile_id: string;
  source_safety_check_id: string | null;
  assessment_type: "baseline" | "six_month" | "incident_follow_up" | "digital";
  status: "draft" | "published" | "archived";
  score_before: number | null;
  score_after: number | null;
  summary: string | null;
  published_at: string | null;
  next_review_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertySafeRecommendation = {
  id: string;
  assessment_id: string | null;
  customer_id: string;
  property_id: string | null;
  title: string;
  trade_type: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  description: string | null;
  status: "recommended" | "quote_requested" | "converted_to_request" | "dismissed";
  linked_job_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertySafeSummary = {
  membershipStatus: string | null;
  activeProfileCount: number;
  openRecommendationCount: number;
  latestAssessment: PropertySafeAssessment | null;
  statusLabel: string;
  headline: string;
  copy: string;
  nextReviewLabel: string;
  ctaLabel: string;
  ctaHref: string;
};

type PropertySafeReportItem = {
  category: string;
  label: string;
  status: "ok" | "attention" | "recommended" | "not_checked";
  notes: string | null;
};

type PropertySafeReportRecommendation = {
  title: string;
  category: string | null;
  priority: "low" | "medium" | "high" | "urgent";
  description: string | null;
  estimated_trade_type: string | null;
};

type PropertySafeReportSyncInput = {
  safetyCheckId: string;
  customerId: string;
  propertyId: string | null;
  membershipId: string | null;
  scoreBefore: number;
  scoreAfter: number;
  summary: string;
  items: PropertySafeReportItem[];
  recommendations: PropertySafeReportRecommendation[];
  publishedAt: string;
  nextReviewAt: string;
};

export async function getCustomerPropertySafeSummary(user: AppUser): Promise<PropertySafeSummary> {
  noStore();

  const membership = await getCustomerMembershipSummary(user);
  const defaultSummary = buildPropertySafeSummary({
    membershipStatus: membership?.status ?? null,
    profiles: [],
    latestAssessment: null,
    recommendations: []
  });

  if (!isSupabasePublicConfigured()) return defaultSummary;

  const supabase = await createSupabaseServerClient();
  const { data: profiles, error: profileError } = await supabase
    .from("propertysafe_profiles")
    .select(propertySafeProfileSelect)
    .eq("customer_id", user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (profileError || !profiles?.length) return defaultSummary;

  const profileIds = profiles.map((profile) => profile.id);
  const [{ data: latestAssessment }, { data: recommendations }] = await Promise.all([
    supabase
      .from("propertysafe_assessments")
      .select(propertySafeAssessmentSelect)
      .in("propertysafe_profile_id", profileIds)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("propertysafe_recommendations")
      .select(propertySafeRecommendationSelect)
      .eq("customer_id", user.id)
      .neq("status", "dismissed")
      .order("created_at", { ascending: false })
  ]);

  return buildPropertySafeSummary({
    membershipStatus: membership?.status ?? null,
    profiles: profiles as PropertySafeProfile[],
    latestAssessment: (latestAssessment ?? null) as PropertySafeAssessment | null,
    recommendations: (recommendations ?? []) as PropertySafeRecommendation[]
  });
}

export async function syncPropertySafeFromSafetyCheckReport(input: PropertySafeReportSyncInput) {
  if (!isSupabaseServerConfigured()) return { ok: false, message: "PropertySafe sync is unavailable." };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, message: "PropertySafe sync is unavailable." };

  const { data: membership } = input.membershipId
    ? await supabase.from("memberships").select("plan").eq("id", input.membershipId).maybeSingle()
    : { data: null };
  const protectionLevel = membership?.plan === "complete" ? "complete" : membership ? "plus" : "monitor";

  const { data: profile, error: profileError } = await supabase
    .from("propertysafe_profiles")
    .upsert(
      {
        customer_id: input.customerId,
        property_id: input.propertyId,
        membership_id: input.membershipId,
        status: "active",
        protection_level: protectionLevel,
        last_assessed_at: input.publishedAt,
        next_review_at: input.nextReviewAt
      },
      { onConflict: "customer_id,property_id" }
    )
    .select("id")
    .single();

  if (profileError || !profile) {
    return { ok: false, message: profileError?.message ?? "PropertySafe profile could not be updated." };
  }

  const { data: existingAssessment } = await supabase
    .from("propertysafe_assessments")
    .select("id")
    .eq("source_safety_check_id", input.safetyCheckId)
    .maybeSingle();

  const assessmentPatch = {
    propertysafe_profile_id: profile.id,
    source_safety_check_id: input.safetyCheckId,
    assessment_type: "six_month",
    status: "published",
    score_before: input.scoreBefore,
    score_after: input.scoreAfter,
    summary: input.summary,
    published_at: input.publishedAt,
    next_review_at: input.nextReviewAt
  };

  const { data: assessment, error: assessmentError } = existingAssessment
    ? await supabase
        .from("propertysafe_assessments")
        .update(assessmentPatch)
        .eq("id", existingAssessment.id)
        .select("id")
        .single()
    : await supabase
        .from("propertysafe_assessments")
        .insert(assessmentPatch)
        .select("id")
        .single();

  if (assessmentError || !assessment) {
    return { ok: false, message: assessmentError?.message ?? "PropertySafe assessment could not be updated." };
  }

  await Promise.all([
    supabase.from("propertysafe_findings").delete().eq("assessment_id", assessment.id),
    supabase.from("propertysafe_recommendations").delete().eq("assessment_id", assessment.id)
  ]);

  const findings = input.items
    .filter((item) => item.status === "attention" || item.status === "recommended")
    .map((item) => ({
      assessment_id: assessment.id,
      category: item.category,
      title: item.label,
      severity: item.status === "attention" ? "high" : "medium",
      notes: item.notes,
      status: "open"
    }));

  if (findings.length) {
    await supabase.from("propertysafe_findings").insert(findings);
  }

  if (input.recommendations.length) {
    await supabase.from("propertysafe_recommendations").insert(
      input.recommendations.map((recommendation) => ({
        assessment_id: assessment.id,
        customer_id: input.customerId,
        property_id: input.propertyId,
        title: recommendation.title,
        trade_type: recommendation.estimated_trade_type ?? recommendation.category,
        priority: recommendation.priority,
        description: recommendation.description,
        status: "recommended"
      }))
    );
  }

  await supabase.from("propertysafe_events").insert({
    propertysafe_profile_id: profile.id,
    assessment_id: assessment.id,
    customer_id: input.customerId,
    event_type: "safety_check_report_published",
    title: "Safety Check report added to PropertySafe",
    details: "A completed Safety & Readiness Check updated this property's PropertySafe view.",
    metadata: {
      safetyCheckId: input.safetyCheckId,
      scoreBefore: input.scoreBefore,
      scoreAfter: input.scoreAfter,
      findingCount: findings.length,
      recommendationCount: input.recommendations.length
    }
  });

  return { ok: true, message: "PropertySafe profile updated." };
}

function buildPropertySafeSummary({
  membershipStatus,
  profiles,
  latestAssessment,
  recommendations
}: {
  membershipStatus: string | null;
  profiles: PropertySafeProfile[];
  latestAssessment: PropertySafeAssessment | null;
  recommendations: PropertySafeRecommendation[];
}): PropertySafeSummary {
  const activeProfiles = profiles.filter((profile) => profile.status === "active");
  const openRecommendations = recommendations.filter((recommendation) => recommendation.status === "recommended");

  if (!activeProfiles.length) {
    return {
      membershipStatus,
      activeProfileCount: 0,
      openRecommendationCount: 0,
      latestAssessment: null,
      statusLabel: membershipStatus === "active" ? "Ready to build" : "Not active yet",
      headline: "Build your PropertySafe view from a real Safety Check.",
      copy: membershipStatus === "active"
        ? "Book a Safety & Readiness Check and we will turn the completed report into a clear PropertySafe view for your home."
        : "Join Fixit Plus to unlock Safety Checks, saved home details, and a real PropertySafe history over time.",
      nextReviewLabel: "No report yet",
      ctaLabel: membershipStatus === "active" ? "Book Safety Check" : "Protect My Home",
      ctaHref: membershipStatus === "active" ? "/dashboard/customer/safety-checks/book" : "/fixit-plus"
    };
  }

  return {
    membershipStatus,
    activeProfileCount: activeProfiles.length,
    openRecommendationCount: openRecommendations.length,
    latestAssessment,
    statusLabel: latestAssessment ? "PropertySafe active" : "Profile active",
    headline: latestAssessment ? "Your PropertySafe view is live." : "Your PropertySafe profile is active.",
    copy: latestAssessment?.summary
      ? latestAssessment.summary
      : "PropertySafe brings your saved property, Safety Check history, and recommended next steps into one calm view.",
    nextReviewLabel: latestAssessment?.next_review_at
      ? `Next review ${new Date(latestAssessment.next_review_at).toLocaleDateString()}`
      : "Review date pending",
    ctaLabel: openRecommendations.length ? "Review Next Fixes" : "View Safety Checks",
    ctaHref: "/dashboard/customer/safety-checks"
  };
}

const propertySafeProfileSelect =
  "id, customer_id, property_id, membership_id, status, protection_level, display_name, last_assessed_at, next_review_at, created_at, updated_at";

const propertySafeAssessmentSelect =
  "id, propertysafe_profile_id, source_safety_check_id, assessment_type, status, score_before, score_after, summary, published_at, next_review_at, created_at, updated_at";

const propertySafeRecommendationSelect =
  "id, assessment_id, customer_id, property_id, title, trade_type, priority, description, status, linked_job_id, created_at, updated_at";
