import { unstable_noStore as noStore } from "next/cache";
import type { AppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type AgencyProfile = {
  id: string;
  owner_user_id: string;
  name: string;
  abn: string | null;
  phone: string | null;
  service_area: string | null;
  portfolio_size: "1-10" | "11-50" | "51-150" | "151-500" | "500+";
  status: "onboarding" | "active" | "paused" | "archived";
  onboarding_stage: "profile" | "properties" | "owners" | "rules" | "ready";
  created_at: string;
  updated_at: string;
};

export type AgencyMember = {
  id: string;
  agency_id: string;
  user_id: string | null;
  invite_email: string | null;
  role: "principal" | "property_manager" | "operations" | "viewer";
  status: "invited" | "active" | "paused" | "removed";
  created_at: string;
  updated_at: string;
};

export type AgencyManagedProperty = {
  id: string;
  agency_id: string;
  saved_property_id: string | null;
  propertysafe_profile_id: string | null;
  label: string;
  address: string;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  owner_name: string | null;
  owner_email: string | null;
  management_status: "onboarding" | "active" | "needs_review" | "paused" | "archived";
  risk_status: "clear" | "watch" | "needs_review" | "urgent";
  notes: string | null;
  last_touch_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AgencyOwnerInvite = {
  id: string;
  agency_id: string;
  managed_property_id: string | null;
  owner_email: string;
  owner_name: string | null;
  access_level: "view_record" | "request_work" | "manage_record";
  status: "invited" | "active" | "paused" | "revoked";
  invited_by: string | null;
  accepted_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AgencyMaintenanceRules = {
  id: string;
  agency_id: string;
  owner_update_policy: "urgent_only" | "urgent_and_recommended" | "all_requests";
  default_contact_method: "email" | "phone" | "sms";
  after_hours_notes: string | null;
  urgent_authority_notes: string | null;
  preferred_trades_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AgencyDashboardSummary = {
  agency: AgencyProfile | null;
  memberRole: AgencyMember["role"] | "principal" | null;
  members: AgencyMember[];
  properties: AgencyManagedProperty[];
  ownerInvites: AgencyOwnerInvite[];
  rules: AgencyMaintenanceRules | null;
  stats: {
    readinessScore: number;
    setupProgress: number;
    propertyCount: number;
    activeProperties: number;
    ownerVisible: number;
    needsReview: number;
    urgent: number;
    pendingInvites: number;
    nextActionLabel: string;
    nextActionDetail: string;
    nextActionHref: string;
    operatingMode: string;
  };
  setupSteps: Array<{
    label: string;
    status: "done" | "next" | "pending";
    detail: string;
  }>;
  graph: Array<{
    label: string;
    value: number;
    tone: "green" | "amber" | "red" | "blue";
  }>;
};

type AgencyAccess = {
  agency: AgencyProfile | null;
  memberRole: AgencyDashboardSummary["memberRole"];
};

const agencyProfileSelect =
  "id, owner_user_id, name, abn, phone, service_area, portfolio_size, status, onboarding_stage, created_at, updated_at";
const agencyMemberSelect = "id, agency_id, user_id, invite_email, role, status, created_at, updated_at";
const agencyPropertySelect =
  "id, agency_id, saved_property_id, propertysafe_profile_id, label, address, suburb, postcode, state, owner_name, owner_email, management_status, risk_status, notes, last_touch_at, created_by, created_at, updated_at";
const agencyInviteSelect =
  "id, agency_id, managed_property_id, owner_email, owner_name, access_level, status, invited_by, accepted_user_id, created_at, updated_at";
const agencyRulesSelect =
  "id, agency_id, owner_update_policy, default_contact_method, after_hours_notes, urgent_authority_notes, preferred_trades_notes, created_at, updated_at";

export async function getAgencyAccessForUser(user: AppUser): Promise<AgencyAccess> {
  noStore();

  if (!isSupabaseServerConfigured()) return { agency: null, memberRole: null };

  const supabase = createSupabaseAdminClient();
  if (!supabase) return { agency: null, memberRole: null };

  const { data: ownedAgency } = await supabase
    .from("agency_profiles")
    .select(agencyProfileSelect)
    .eq("owner_user_id", user.id)
    .neq("status", "archived")
    .maybeSingle();

  if (ownedAgency) {
    return { agency: ownedAgency as AgencyProfile, memberRole: "principal" };
  }

  const { data: membership } = await supabase
    .from("agency_members")
    .select("agency_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!membership?.agency_id) return { agency: null, memberRole: null };

  const { data: agency } = await supabase
    .from("agency_profiles")
    .select(agencyProfileSelect)
    .eq("id", membership.agency_id)
    .neq("status", "archived")
    .maybeSingle();

  return {
    agency: agency ? (agency as AgencyProfile) : null,
    memberRole: (membership.role as AgencyDashboardSummary["memberRole"]) ?? null
  };
}

export async function getAgencyDashboard(user: AppUser): Promise<AgencyDashboardSummary> {
  noStore();

  const empty = buildAgencyDashboardSummary({
    agency: null,
    memberRole: null,
    members: [],
    properties: [],
    ownerInvites: [],
    rules: null
  });

  if (!isSupabaseServerConfigured()) return empty;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return empty;

  const access = await getAgencyAccessForUser(user);
  if (!access.agency) return empty;

  const [{ data: properties }, { data: ownerInvites }, { data: rules }, { data: members }] = await Promise.all([
    supabase
      .from("agency_managed_properties")
      .select(agencyPropertySelect)
      .eq("agency_id", access.agency.id)
      .neq("management_status", "archived")
      .order("updated_at", { ascending: false }),
    supabase
      .from("agency_owner_invites")
      .select(agencyInviteSelect)
      .eq("agency_id", access.agency.id)
      .neq("status", "revoked")
      .order("created_at", { ascending: false }),
    supabase
      .from("agency_maintenance_rules")
      .select(agencyRulesSelect)
      .eq("agency_id", access.agency.id)
      .maybeSingle(),
    supabase
      .from("agency_members")
      .select(agencyMemberSelect)
      .eq("agency_id", access.agency.id)
      .neq("status", "removed")
      .order("created_at", { ascending: false })
  ]);

  return buildAgencyDashboardSummary({
    agency: access.agency,
    memberRole: access.memberRole,
    members: (members ?? []) as AgencyMember[],
    properties: (properties ?? []) as AgencyManagedProperty[],
    ownerInvites: (ownerInvites ?? []) as AgencyOwnerInvite[],
    rules: (rules ?? null) as AgencyMaintenanceRules | null
  });
}

function buildAgencyDashboardSummary({
  agency,
  memberRole,
  members,
  properties,
  ownerInvites,
  rules
}: {
  agency: AgencyProfile | null;
  memberRole: AgencyDashboardSummary["memberRole"];
  members: AgencyMember[];
  properties: AgencyManagedProperty[];
  ownerInvites: AgencyOwnerInvite[];
  rules: AgencyMaintenanceRules | null;
}): AgencyDashboardSummary {
  const activeProperties = properties.filter((property) => property.management_status === "active").length;
  const urgent = properties.filter((property) => property.risk_status === "urgent").length;
  const needsReview = properties.filter(
    (property) => property.risk_status === "needs_review" || property.management_status === "needs_review"
  ).length;
  const ownerVisible = ownerInvites.filter((invite) => invite.status === "active" || invite.status === "invited").length;
  const pendingInvites = ownerInvites.filter((invite) => invite.status === "invited").length;
  const setup = {
    profile: Boolean(agency?.name && agency?.service_area && agency?.phone),
    properties: properties.length > 0,
    owners: ownerInvites.length > 0,
    rules: Boolean(rules)
  };
  const profileScore = setup.profile ? 20 : agency ? 8 : 0;
  const propertyScore = setup.properties ? Math.min(15 + properties.length * 5, 25) : 0;
  const ownerScore = setup.owners ? Math.min(10 + ownerVisible * 5, 20) : 0;
  const rulesScore = setup.rules ? 15 : 0;
  const workflowScore = setup.properties && setup.rules ? 10 : 0;
  const attentionScore = setup.properties && urgent === 0 && needsReview === 0 ? 5 : 0;
  const readinessScore = profileScore + propertyScore + ownerScore + rulesScore + workflowScore + attentionScore;
  const setupProgress =
    [setup.profile, setup.properties, setup.owners, setup.rules].filter(Boolean).length * 25;
  const nextAction = getAgencyNextAction({
    agency,
    setup,
    urgent,
    needsReview,
    properties,
    pendingInvites
  });

  const setupSteps = [
    {
      label: "Agency profile",
      status: setup.profile ? "done" : "next",
      detail: setup.profile ? "Agency details are ready." : "Add the agency name, phone, and service area."
    },
    {
      label: "Managed properties",
      status: setup.properties ? "done" : setup.profile ? "next" : "pending",
      detail: setup.properties ? `${properties.length} properties in the workspace.` : "Add the first rental or managed home."
    },
    {
      label: "Sharing rules",
      status: setup.owners ? "done" : setup.properties ? "next" : "pending",
      detail: setup.owners ? `${ownerVisible} sharing records prepared.` : "Prepare agency-approved sharing only after the property record is clear."
    },
    {
      label: "Maintenance rules",
      status: setup.rules ? "done" : setup.owners ? "next" : "pending",
      detail: setup.rules ? "Update rules are saved." : "Set how urgent updates and follow-up notes should move."
    }
  ] satisfies AgencyDashboardSummary["setupSteps"];

  const clearProperties = properties.length ? Math.round((activeProperties / properties.length) * 100) : 0;
  const ownerAccess = properties.length ? Math.min(Math.round((ownerVisible / properties.length) * 100), 100) : 0;
  const recordsConnected = properties.length
    ? Math.round((properties.filter((property) => property.propertysafe_profile_id || property.saved_property_id).length / properties.length) * 100)
    : 0;
  const attentionLoad = properties.length ? Math.min(Math.round(((urgent + needsReview) / properties.length) * 100), 100) : 0;

  return {
    agency,
    memberRole,
    members,
    properties,
    ownerInvites,
    rules,
    stats: {
      readinessScore: Math.min(readinessScore, 100),
      setupProgress,
      propertyCount: properties.length,
      activeProperties,
      ownerVisible,
      needsReview,
      urgent,
      pendingInvites,
      nextActionLabel: nextAction.label,
      nextActionDetail: nextAction.detail,
      nextActionHref: nextAction.href,
      operatingMode: nextAction.mode
    },
    setupSteps,
    graph: [
      { label: "Clear properties", value: clearProperties, tone: "green" },
      { label: "Sharing ready", value: ownerAccess, tone: "blue" },
      { label: "Records connected", value: recordsConnected, tone: "amber" },
      { label: "Needs attention", value: attentionLoad, tone: attentionLoad > 40 ? "red" : "amber" }
    ]
  };
}

function getAgencyNextAction({
  agency,
  setup,
  urgent,
  needsReview,
  properties,
  pendingInvites
}: {
  agency: AgencyProfile | null;
  setup: {
    profile: boolean;
    properties: boolean;
    owners: boolean;
    rules: boolean;
  };
  urgent: number;
  needsReview: number;
  properties: AgencyManagedProperty[];
  pendingInvites: number;
}) {
  if (!agency) {
    return {
      label: "Create the agency workspace",
      detail: "Add the agency details first so properties, rules, and sharing settings have a clear home.",
      href: "#agency-profile",
      mode: "Setup needed"
    };
  }

  if (!setup.profile) {
    return {
      label: "Finish agency details",
      detail: "Add phone and service area before inviting owners or adding live property records.",
      href: "#agency-profile",
      mode: "Profile setup"
    };
  }

  if (!setup.properties) {
    return {
      label: "Add the first managed property",
      detail: "Start with one real rental or managed home. Everything else becomes easier once the record exists.",
      href: "#properties",
      mode: "Portfolio setup"
    };
  }

  if (urgent > 0) {
    return {
      label: "Triage urgent properties",
      detail: `${urgent} property ${urgent === 1 ? "needs" : "need"} fast attention before a clean property update.`,
      href: "#properties",
      mode: "Fast triage"
    };
  }

  if (needsReview > 0) {
    return {
      label: "Clear review items",
      detail: `${needsReview} property ${needsReview === 1 ? "has" : "have"} watch notes or follow-up work to resolve.`,
      href: "#properties",
      mode: "Review queue"
    };
  }

  if (!setup.owners) {
    return {
      label: "Prepare agency-approved sharing",
      detail: "Choose one property and share the narrowest useful record first.",
      href: "#owner-access",
      mode: "Access setup"
    };
  }

  if (pendingInvites > 0) {
    return {
      label: "Follow up pending access",
      detail: `${pendingInvites} owner ${pendingInvites === 1 ? "invite is" : "invites are"} waiting to become active.`,
      href: "#owner-access",
      mode: "Access follow-up"
    };
  }

  if (!setup.rules) {
    return {
      label: "Set maintenance rules",
      detail: "Save the agency rules for urgent contact, after-hours notes, and property update preferences.",
      href: "#rules",
      mode: "Rules setup"
    };
  }

  return {
    label: "Start the next maintenance request",
    detail: `${properties.length} managed ${properties.length === 1 ? "property is" : "properties are"} ready to carry request history and follow-up work.`,
    href: "/post-job",
    mode: "Ready to operate"
  };
}
