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

export type PropertySafeParticipant = {
  id: string;
  propertysafe_profile_id: string;
  user_id: string | null;
  invite_email: string | null;
  relationship: "owner" | "landlord" | "agency_manager" | "property_manager" | "tenant_viewer" | "viewer";
  agency_name: string | null;
  can_view: boolean;
  can_request_work: boolean;
  can_manage_record: boolean;
  can_view_financials: boolean;
  status: "invited" | "active" | "paused" | "revoked";
  created_at: string;
  updated_at: string;
};

export type PropertySafeSummary = {
  membershipStatus: string | null;
  activeProfileCount: number;
  sharedProfileCount: number;
  agencyManagedCount: number;
  openRecommendationCount: number;
  latestAssessment: PropertySafeAssessment | null;
  statusLabel: string;
  headline: string;
  copy: string;
  nextReviewLabel: string;
  ctaLabel: string;
  ctaHref: string;
};

export type AdminPropertySafeProfileRow = {
  id: string;
  display_name: string | null;
  status: string;
  protection_level: string;
  customer_name: string;
  customer_email: string | null;
  property_label: string;
  last_assessed_at: string | null;
  next_review_at: string | null;
  participant_count: number;
  open_recommendation_count: number;
  latest_assessment_summary: string | null;
};

type PropertySafeReportItem = {
  category: string;
  label: string;
  status: "ok" | "attention" | "recommended" | "not_checked" | "pass" | "fail" | "action_required" | "na";
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
  assessmentType?: string;
  complianceResult?: string | null;
  certificateNumber?: string | null;
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
    participants: [],
    latestAssessment: null,
    recommendations: []
  });

  if (!isSupabasePublicConfigured()) return defaultSummary;

  const supabase = await createSupabaseServerClient();
  const { data: ownedProfiles, error: profileError } = await supabase
    .from("propertysafe_profiles")
    .select(propertySafeProfileSelect)
    .eq("customer_id", user.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (profileError) return defaultSummary;

  const { data: participantRows, error: participantError } = await supabase
    .from("propertysafe_participants")
    .select(propertySafeParticipantSelect)
    .eq("user_id", user.id)
    .eq("status", "active")
    .eq("can_view", true);

  const participants = participantError ? [] : ((participantRows ?? []) as PropertySafeParticipant[]);
  const sharedProfileIds = participants.map((participant) => participant.propertysafe_profile_id);
  const { data: sharedProfiles, error: sharedProfileError } = sharedProfileIds.length
    ? await supabase
        .from("propertysafe_profiles")
        .select(propertySafeProfileSelect)
        .in("id", sharedProfileIds)
        .neq("status", "archived")
    : { data: [], error: null };

  const profileMap = new Map<string, PropertySafeProfile>();
  [...((ownedProfiles ?? []) as PropertySafeProfile[]), ...((sharedProfileError ? [] : sharedProfiles ?? []) as PropertySafeProfile[])].forEach((profile) => {
    profileMap.set(profile.id, profile);
  });
  const profiles = Array.from(profileMap.values());

  if (!profiles.length) {
    return buildPropertySafeSummary({
      membershipStatus: membership?.status ?? null,
      profiles: [],
      participants,
      latestAssessment: null,
      recommendations: []
    });
  }

  const profileIds = profiles.map((profile) => profile.id);
  const propertyIds = profiles.map((profile) => profile.property_id).filter((id): id is string => Boolean(id));
  const [{ data: latestAssessment }, { data: ownedRecommendations }, propertyRecommendationResult] = await Promise.all([
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
      .order("created_at", { ascending: false }),
    propertyIds.length
      ? supabase
          .from("propertysafe_recommendations")
          .select(propertySafeRecommendationSelect)
          .in("property_id", propertyIds)
          .neq("status", "dismissed")
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [], error: null })
  ]);

  const recommendationMap = new Map<string, PropertySafeRecommendation>();
  [
    ...((ownedRecommendations ?? []) as PropertySafeRecommendation[]),
    ...((propertyRecommendationResult.error ? [] : propertyRecommendationResult.data ?? []) as PropertySafeRecommendation[])
  ].forEach((recommendation) => {
    recommendationMap.set(recommendation.id, recommendation);
  });

  return buildPropertySafeSummary({
    membershipStatus: membership?.status ?? null,
    profiles: profiles as PropertySafeProfile[],
    participants,
    latestAssessment: (latestAssessment ?? null) as PropertySafeAssessment | null,
    recommendations: Array.from(recommendationMap.values())
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
    assessment_type: input.assessmentType ?? "six_month",
    status: "published",
    score_before: input.scoreBefore,
    score_after: input.scoreAfter,
    summary: input.summary,
    compliance_result: input.complianceResult ?? null,
    certificate_number: input.certificateNumber ?? null,
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

  const findingStatuses = new Set(["attention", "recommended", "fail", "action_required"]);
  const highSeverityStatuses = new Set(["attention", "fail"]);
  const findings = input.items
    .filter((item) => findingStatuses.has(item.status))
    .map((item) => ({
      assessment_id: assessment.id,
      category: item.category,
      title: item.label,
      severity: highSeverityStatuses.has(item.status) ? "high" : "medium",
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

export async function getAdminPropertySafeProfiles(): Promise<AdminPropertySafeProfileRow[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data: profiles, error } = await supabase
    .from("propertysafe_profiles")
    .select(propertySafeProfileSelect)
    .order("updated_at", { ascending: false })
    .limit(80);

  if (error || !profiles?.length) return [];

  const typedProfiles = profiles as PropertySafeProfile[];
  const customerIds = Array.from(new Set(typedProfiles.map((profile) => profile.customer_id).filter(Boolean)));
  const propertyIds = Array.from(new Set(typedProfiles.map((profile) => profile.property_id).filter(Boolean))) as string[];
  const profileIds = typedProfiles.map((profile) => profile.id);

  const [{ data: customers }, { data: properties }, { data: participants }, { data: recommendations }, { data: assessments }] =
    await Promise.all([
      customerIds.length
        ? supabase.from("users").select("id, email, first_name, last_name").in("id", customerIds)
        : Promise.resolve({ data: [] }),
      propertyIds.length
        ? supabase.from("saved_properties").select("id, label, address, suburb, postcode, state").in("id", propertyIds)
        : Promise.resolve({ data: [] }),
      supabase
        .from("propertysafe_participants")
        .select("propertysafe_profile_id, status")
        .in("propertysafe_profile_id", profileIds)
        .neq("status", "revoked"),
      propertyIds.length
        ? supabase
            .from("propertysafe_recommendations")
            .select("property_id, status")
            .in("property_id", propertyIds)
            .eq("status", "recommended")
        : Promise.resolve({ data: [] }),
      supabase
        .from("propertysafe_assessments")
        .select("propertysafe_profile_id, summary, published_at, created_at")
        .in("propertysafe_profile_id", profileIds)
        .eq("status", "published")
        .order("published_at", { ascending: false, nullsFirst: false })
    ]);

  const customerById = new Map((customers ?? []).map((customer) => [customer.id, customer]));
  const propertyById = new Map((properties ?? []).map((property) => [property.id, property]));
  const participantCounts = new Map<string, number>();
  (participants ?? []).forEach((participant) => {
    participantCounts.set(participant.propertysafe_profile_id, (participantCounts.get(participant.propertysafe_profile_id) ?? 0) + 1);
  });

  const recommendationCounts = new Map<string, number>();
  (recommendations ?? []).forEach((recommendation) => {
    if (recommendation.property_id) {
      recommendationCounts.set(recommendation.property_id, (recommendationCounts.get(recommendation.property_id) ?? 0) + 1);
    }
  });

  const latestAssessmentByProfileId = new Map<string, { summary: string | null }>();
  (assessments ?? []).forEach((assessment) => {
    if (!latestAssessmentByProfileId.has(assessment.propertysafe_profile_id)) {
      latestAssessmentByProfileId.set(assessment.propertysafe_profile_id, { summary: assessment.summary ?? null });
    }
  });

  return typedProfiles.map((profile) => {
    const customer = customerById.get(profile.customer_id);
    const property = profile.property_id ? propertyById.get(profile.property_id) : null;
    const customerName = customer
      ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Customer"
      : "Customer";
    const propertyLabel =
      profile.display_name ||
      property?.label ||
      [property?.address, property?.suburb, property?.postcode, property?.state].filter(Boolean).join(" ") ||
      "PropertySafe record";

    return {
      id: profile.id,
      display_name: profile.display_name,
      status: profile.status,
      protection_level: profile.protection_level,
      customer_name: customerName,
      customer_email: customer?.email ?? null,
      property_label: propertyLabel,
      last_assessed_at: profile.last_assessed_at,
      next_review_at: profile.next_review_at,
      participant_count: participantCounts.get(profile.id) ?? 0,
      open_recommendation_count: profile.property_id ? recommendationCounts.get(profile.property_id) ?? 0 : 0,
      latest_assessment_summary: latestAssessmentByProfileId.get(profile.id)?.summary ?? null
    };
  });
}

function buildPropertySafeSummary({
  membershipStatus,
  profiles,
  participants,
  latestAssessment,
  recommendations
}: {
  membershipStatus: string | null;
  profiles: PropertySafeProfile[];
  participants: PropertySafeParticipant[];
  latestAssessment: PropertySafeAssessment | null;
  recommendations: PropertySafeRecommendation[];
}): PropertySafeSummary {
  const activeProfiles = profiles.filter((profile) => profile.status === "active");
  const sharedProfileIds = new Set(participants.map((participant) => participant.propertysafe_profile_id));
  const sharedProfiles = activeProfiles.filter((profile) => sharedProfileIds.has(profile.id));
  const agencyManagedProfiles = sharedProfiles.filter((profile) => {
    const participant = participants.find((item) => item.propertysafe_profile_id === profile.id);
    return participant?.relationship === "owner" || participant?.relationship === "landlord";
  });
  const openRecommendations = recommendations.filter((recommendation) => recommendation.status === "recommended");

  if (!activeProfiles.length) {
    return {
      membershipStatus,
      activeProfileCount: 0,
      sharedProfileCount: participants.length,
      agencyManagedCount: 0,
      openRecommendationCount: 0,
      latestAssessment: null,
      statusLabel: membershipStatus === "active" ? "Ready to build" : "Not active yet",
      headline: "Build your PropertySafe view from a real Safety Check.",
      copy: membershipStatus === "active"
        ? "Book a Safety & Readiness Check for your home, or ask your property manager to share a managed property record with you."
        : "Join Fixit Plus for your own home, or use PropertySafe through a real estate agency managing your investment property.",
      nextReviewLabel: "No report yet",
      ctaLabel: membershipStatus === "active" ? "Book Safety Check" : "Protect my property",
      ctaHref: membershipStatus === "active" ? "/dashboard/customer/safety-checks/book" : "/fixit-plus"
    };
  }

  const hasAgencyManagedRecord = agencyManagedProfiles.length > 0;

  return {
    membershipStatus,
    activeProfileCount: activeProfiles.length,
    sharedProfileCount: sharedProfiles.length,
    agencyManagedCount: agencyManagedProfiles.length,
    openRecommendationCount: openRecommendations.length,
    latestAssessment,
    statusLabel: hasAgencyManagedRecord ? "Agency-shared record" : latestAssessment ? "PropertySafe active" : "Profile active",
    headline: hasAgencyManagedRecord
      ? "Your managed property record is ready."
      : latestAssessment
        ? "Your PropertySafe view is live."
        : "Your PropertySafe profile is active.",
    copy: latestAssessment?.summary
      ? latestAssessment.summary
      : hasAgencyManagedRecord
        ? "See real checks, recommended fixes, and follow-up work shared through the agency managing your property."
        : "PropertySafe brings your saved property, Safety Check history, and recommended next steps into one calm view.",
    nextReviewLabel: latestAssessment?.next_review_at
      ? `Next review ${new Date(latestAssessment.next_review_at).toLocaleDateString()}`
      : "Review date pending",
    ctaLabel: openRecommendations.length ? "Review next fixes" : "View Safety Checks",
    ctaHref: "/dashboard/customer/safety-checks"
  };
}

const propertySafeProfileSelect =
  "id, customer_id, property_id, membership_id, status, protection_level, display_name, last_assessed_at, next_review_at, created_at, updated_at";

const propertySafeAssessmentSelect =
  "id, propertysafe_profile_id, source_safety_check_id, assessment_type, status, score_before, score_after, summary, published_at, next_review_at, created_at, updated_at";

const propertySafeRecommendationSelect =
  "id, assessment_id, customer_id, property_id, title, trade_type, priority, description, status, linked_job_id, created_at, updated_at";

const propertySafeParticipantSelect =
  "id, propertysafe_profile_id, user_id, invite_email, relationship, agency_name, can_view, can_request_work, can_manage_record, can_view_financials, status, created_at, updated_at";

export type PropertySafeSharedInvite = {
  participant_id: string;
  propertysafe_profile_id: string;
  relationship: PropertySafeParticipant["relationship"];
  agency_name: string | null;
  can_request_work: boolean;
  can_view_financials: boolean;
  property_label: string;
  shared_by: string;
};

export type PropertySafeSharedRecordRow = {
  profile_id: string;
  property_label: string;
  relationship: PropertySafeParticipant["relationship"];
  protection_level: PropertySafeProfile["protection_level"];
  last_assessed_at: string | null;
  next_review_at: string | null;
  shared_by: string;
  can_request_work: boolean;
};

export type PropertySafeSharedAccess = {
  pendingInvites: PropertySafeSharedInvite[];
  records: PropertySafeSharedRecordRow[];
};

export type PropertySafeFinding = {
  id: string;
  category: string | null;
  title: string;
  severity: "low" | "medium" | "high" | "urgent";
  notes: string | null;
  status: string;
};

export type PropertySafeSharedRecord = {
  profile: PropertySafeProfile;
  property_label: string;
  shared_by: string;
  relationship: PropertySafeParticipant["relationship"];
  can_request_work: boolean;
  can_view_financials: boolean;
  latestAssessment: PropertySafeAssessment | null;
  findings: PropertySafeFinding[];
  recommendations: PropertySafeRecommendation[];
};

function relationshipLabel(relationship: string) {
  return relationship.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function buildPropertyLabelMap(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  profiles: PropertySafeProfile[]
) {
  const labels = new Map<string, string>();
  if (!supabase) return labels;
  const propertyIds = profiles.map((p) => p.property_id).filter((id): id is string => Boolean(id));
  const { data: properties } = propertyIds.length
    ? await supabase.from("saved_properties").select("id, label, address, suburb, state").in("id", propertyIds)
    : { data: [] };
  const propertyById = new Map((properties ?? []).map((row) => [row.id as string, row]));
  profiles.forEach((profile) => {
    const property = profile.property_id ? propertyById.get(profile.property_id) : null;
    const label =
      profile.display_name ||
      property?.label ||
      [property?.address, property?.suburb, property?.state].filter(Boolean).join(", ") ||
      "PropertySafe record";
    labels.set(profile.id, label);
  });
  return labels;
}

async function buildOwnerNameMap(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  profiles: PropertySafeProfile[]
) {
  const names = new Map<string, string>();
  if (!supabase) return names;
  const ownerIds = Array.from(new Set(profiles.map((p) => p.customer_id)));
  const { data: owners } = ownerIds.length
    ? await supabase.from("users").select("id, first_name, last_name, email").in("id", ownerIds)
    : { data: [] };
  const ownerById = new Map((owners ?? []).map((row) => [row.id as string, row]));
  profiles.forEach((profile) => {
    const owner = ownerById.get(profile.customer_id);
    names.set(
      profile.id,
      owner ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") || owner.email || "Property owner" : "Property owner"
    );
  });
  return names;
}

// Surfaces PropertySafe records shared with this user: pending invitations (matched
// by linked user_id OR by the email the invite was sent to) and active records they
// can view. This is the missing half of the share flow — admins/agencies could
// invite, but invitees had nowhere to accept or view.
export async function getPropertySafeSharedAccess(user: AppUser): Promise<PropertySafeSharedAccess> {
  noStore();
  const empty: PropertySafeSharedAccess = { pendingInvites: [], records: [] };
  if (!isSupabaseServerConfigured()) return empty;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return empty;

  const email = (user.email ?? "").trim().toLowerCase();
  const orFilter = email ? `user_id.eq.${user.id},invite_email.eq.${email}` : `user_id.eq.${user.id}`;

  const { data: participantRows } = await supabase
    .from("propertysafe_participants")
    .select(propertySafeParticipantSelect)
    .or(orFilter)
    .in("status", ["invited", "active"]);

  const participants = (participantRows ?? []) as PropertySafeParticipant[];
  if (!participants.length) return empty;

  const profileIds = Array.from(new Set(participants.map((p) => p.propertysafe_profile_id)));
  const { data: profileRows } = await supabase
    .from("propertysafe_profiles")
    .select(propertySafeProfileSelect)
    .in("id", profileIds)
    .neq("status", "archived");
  const profiles = (profileRows ?? []) as PropertySafeProfile[];
  const profileById = new Map(profiles.map((p) => [p.id, p]));

  const [labels, owners] = await Promise.all([
    buildPropertyLabelMap(supabase, profiles),
    buildOwnerNameMap(supabase, profiles)
  ]);

  const pendingInvites: PropertySafeSharedInvite[] = [];
  const records: PropertySafeSharedRecordRow[] = [];

  participants.forEach((participant) => {
    const profile = profileById.get(participant.propertysafe_profile_id);
    if (!profile) return;
    const label = labels.get(profile.id) ?? "PropertySafe record";
    const sharedBy = participant.agency_name || owners.get(profile.id) || "Property owner";

    if (participant.status === "invited") {
      pendingInvites.push({
        participant_id: participant.id,
        propertysafe_profile_id: profile.id,
        relationship: participant.relationship,
        agency_name: participant.agency_name,
        can_request_work: participant.can_request_work,
        can_view_financials: participant.can_view_financials,
        property_label: label,
        shared_by: sharedBy
      });
    } else if (participant.status === "active" && participant.can_view) {
      records.push({
        profile_id: profile.id,
        property_label: label,
        relationship: participant.relationship,
        protection_level: profile.protection_level,
        last_assessed_at: profile.last_assessed_at,
        next_review_at: profile.next_review_at,
        shared_by: sharedBy,
        can_request_work: participant.can_request_work
      });
    }
  });

  return { pendingInvites, records };
}

// Loads a single shared record, enforcing that the requesting user is an ACTIVE
// participant with can_view. Permission flags are returned so the UI can gate
// request-work and financials. Returns null when the user has no active access.
export async function getPropertySafeSharedRecord(
  user: AppUser,
  profileId: string
): Promise<PropertySafeSharedRecord | null> {
  noStore();
  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const email = (user.email ?? "").trim().toLowerCase();
  const orFilter = email ? `user_id.eq.${user.id},invite_email.eq.${email}` : `user_id.eq.${user.id}`;

  const { data: participant } = await supabase
    .from("propertysafe_participants")
    .select(propertySafeParticipantSelect)
    .eq("propertysafe_profile_id", profileId)
    .eq("status", "active")
    .or(orFilter)
    .maybeSingle();

  const access = participant as PropertySafeParticipant | null;
  if (!access || !access.can_view) return null;

  const { data: profileRow } = await supabase
    .from("propertysafe_profiles")
    .select(propertySafeProfileSelect)
    .eq("id", profileId)
    .neq("status", "archived")
    .maybeSingle();
  const profile = profileRow as PropertySafeProfile | null;
  if (!profile) return null;

  const [labels, owners] = await Promise.all([
    buildPropertyLabelMap(supabase, [profile]),
    buildOwnerNameMap(supabase, [profile])
  ]);

  const { data: latestAssessment } = await supabase
    .from("propertysafe_assessments")
    .select(propertySafeAssessmentSelect)
    .eq("propertysafe_profile_id", profileId)
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();

  const assessment = (latestAssessment ?? null) as PropertySafeAssessment | null;

  const [{ data: findings }, { data: recommendations }] = assessment
    ? await Promise.all([
        supabase
          .from("propertysafe_findings")
          .select("id, category, title, severity, notes, status")
          .eq("assessment_id", assessment.id)
          .order("severity", { ascending: false }),
        supabase
          .from("propertysafe_recommendations")
          .select(propertySafeRecommendationSelect)
          .eq("assessment_id", assessment.id)
          .neq("status", "dismissed")
          .order("created_at", { ascending: false })
      ])
    : [{ data: [] }, { data: [] }];

  return {
    profile,
    property_label: labels.get(profile.id) ?? "PropertySafe record",
    shared_by: access.agency_name || owners.get(profile.id) || "Property owner",
    relationship: access.relationship,
    can_request_work: access.can_request_work,
    can_view_financials: access.can_view_financials,
    latestAssessment: assessment,
    findings: (findings ?? []) as PropertySafeFinding[],
    recommendations: (recommendations ?? []) as PropertySafeRecommendation[]
  };
}

export { relationshipLabel as propertySafeRelationshipLabel };
