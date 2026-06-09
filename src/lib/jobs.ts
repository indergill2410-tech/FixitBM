import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured, isSupabaseServerConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/auth";
import { getBillingPlan } from "@/lib/billing";
import { jobPhotoBucket } from "@/lib/uploads";

export type JobStatus =
  | "received"
  | "matching"
  | "tradie_accepted"
  | "en_route"
  | "on_site"
  | "quote_provided"
  | "work_in_progress"
  | "completed"
  | "reviewed"
  | "closed"
  | "cancelled"
  | "disputed";

export type JobSummary = {
  id: string;
  public_reference: string;
  type: "home" | "road" | "scheduled";
  category: string;
  urgency: "emergency" | "today" | "flexible";
  title: string;
  description: string;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  status: JobStatus;
  credit_cost: number;
  guest_name: string | null;
  guest_phone: string | null;
  created_at: string;
  assigned_tradie_id: string | null;
};

export type RequestLaneLabel = "Home emergency" | "Roadside emergency" | "Trade request" | "Project quote";

export type JobStatusEvent = {
  id: string;
  status: JobStatus;
  title: string;
  note: string | null;
  created_at: string;
};

export type JobMessage = {
  id: string;
  sender_label: string | null;
  body: string;
  created_at: string;
};

export type JobPhoto = {
  id: string;
  file_url: string;
  file_name: string | null;
  content_type: string | null;
  created_at: string;
  signed_url?: string | null;
};

export type JobDetail = JobSummary & {
  address: string | null;
  road_name: string | null;
  road_direction: string | null;
  landmark: string | null;
  preferred_contact_method: "call" | "sms" | "in_app";
  events: JobStatusEvent[];
  messages: JobMessage[];
  photos: JobPhoto[];
};

export type TradieProfileSummary = {
  id: string;
  business_name?: string | null;
  abn?: string | null;
  trade_category: string;
  licence_number?: string | null;
  service_area: string | null;
  emergency_available: boolean;
  availability_status?: string | null;
  verification_status?: string | null;
  profile_health?: number | null;
  rating?: number | null;
  total_reviews?: number | null;
  response_rate?: number | null;
  public_liability_insurance?: "yes" | "no" | "not_supplied" | null;
  years_experience?: number | null;
  services_description?: string | null;
  agency_property_maintenance_interest?: boolean | null;
  planned_maintenance_contracts_interest?: boolean | null;
};

export type TradieVerificationDocument = {
  id: string;
  type: string;
  status: string;
  notes: string | null;
  created_at: string;
  reviewed_at: string | null;
};

export type TradieProfileDetail = TradieProfileSummary & {
  documents: TradieVerificationDocument[];
};

export type TradieWalletSummary = {
  id: string;
  balance: number;
  bonus_balance: number;
  bonus_monthly_amount: number;
  bonus_months_total: number;
  bonus_months_granted: number;
  bonus_next_renewal_at: string | null;
  bonus_expires_at: string | null;
  signup_bonus_granted_at: string | null;
  lifetime_purchased: number;
  lifetime_used: number;
  bonus_is_valid: boolean;
  total_available: number;
  transactions: {
    id: string;
    type: string;
    amount: number;
    reason: string | null;
    created_at: string;
  }[];
};

export type TradieSubscriptionSummary = {
  plan: "starter" | "local_pro" | "emergency_pro" | "growth_partner";
  status: string;
  current_period_end: string | null;
};

export type LeadSummary = JobSummary & {
  match_score: number;
  already_claimed: boolean;
};

export type CustomerDashboardInsights = {
  recent_messages: {
    id: string;
    job_id: string;
    job_title: string;
    sender_label: string | null;
    body: string;
    created_at: string;
  }[];
  review_jobs: {
    id: string;
    public_reference: string;
    title: string;
  }[];
};

export type TradieMessageThread = {
  id: string;
  job_id: string;
  job_title: string;
  job_reference: string;
  sender_label: string | null;
  body: string;
  created_at: string;
};

export type AdminCustomerRow = {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  status: string;
  created_at: string;
  job_count: number;
};

export type AdminVerificationRow = {
  id: string;
  tradie_id: string;
  type: string;
  status: string;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  tradie_name: string;
};

export type AdminRevenuePlanLine = {
  code: string;
  name: string;
  type: "customer_membership" | "tradie_subscription";
  count: number;
  unit_price_cents: number;
  mrr_cents: number;
};

export type AdminRevenueSummary = {
  active_memberships: number;
  active_tradie_subscriptions: number;
  lead_claims: number;
  credit_spend: number;
  paid_credits: number;
  bonus_credits: number;
  membership_mrr_cents: number;
  subscription_mrr_cents: number;
  total_mrr_cents: number;
  arr_cents: number;
  plan_lines: AdminRevenuePlanLine[];
};

export type AdminAuditLog = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor_id: string | null;
};

export type AdminSupportTicketRow = {
  id: string;
  subject?: string | null;
  title?: string | null;
  body?: string | null;
  message?: string | null;
  description?: string | null;
  notes?: string | null;
  status?: string | null;
  priority?: string | null;
  user_id?: string | null;
  customer_id?: string | null;
  job_id?: string | null;
  created_at?: string | null;
  customer_name: string;
};

export type UserSupportTicketRow = {
  id: string;
  subject?: string | null;
  title?: string | null;
  body?: string | null;
  message?: string | null;
  description?: string | null;
  notes?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export type AdminDisputeRow = {
  id: string;
  reason?: string | null;
  type?: string | null;
  description?: string | null;
  notes?: string | null;
  status?: string | null;
  lead_claim_id?: string | null;
  job_id?: string | null;
  created_at?: string | null;
};

export type AdminMembershipRow = {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  plan?: string | null;
  plan_code?: string | null;
  price_cents?: number | null;
  status?: string | null;
  activation_start?: string | null;
  activation_effective_at?: string | null;
  current_period_end?: string | null;
  created_at?: string | null;
};

export type AdminAssignableTradie = {
  id: string;
  business_name: string | null;
  trade_category: string;
  service_area: string | null;
  availability_status: string | null;
  verification_status: string | null;
};

export type AdminSuggestedFixer = AdminAssignableTradie & {
  emergency_available: boolean;
  rating: number | null;
  match_score: number;
  match_reasons: string[];
};

export type AdminJobDetail = JobDetail & {
  assigned_tradie_name: string | null;
  audit_logs: AdminAuditLog[];
};

export type AdminCommandMetrics = {
  activeRequests: number;
  unassignedRequests: number;
  emergencyRequests: number;
  todayRequests: number;
  activeCustomers: number;
  activeFixers: number;
  activeMemberships: number;
  pendingMemberships: number;
  supportOpen: number;
  disputesOpen: number;
  verificationPending: number;
};

export type AdminNotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

export type AdminRequestFilters = {
  lane?: RequestLaneLabel | "all";
  status?: JobStatus | "all";
  assignment?: "all" | "assigned" | "unassigned";
};

export type AdminCustomerDetail = AdminCustomerRow & {
  jobs: JobSummary[];
  properties: SavedProperty[];
  vehicles: SavedVehicle[];
  memberships: Record<string, unknown>[];
  reviews: ReviewSummary[];
};

export type AdminFixerDirectoryRow = TradieProfileSummary & {
  user_id: string | null;
  assigned_count: number;
  claimed_count: number;
};

export type AdminSearchResult = {
  type: "request" | "fixer" | "customer";
  id: string;
  href: string;
  title: string;
  subtitle: string;
  meta: string;
};

export type AdminSearchResults = {
  query: string;
  requests: AdminSearchResult[];
  fixers: AdminSearchResult[];
  customers: AdminSearchResult[];
  total: number;
};

export type AdminFixerDetail = TradieProfileSummary & {
  user_id: string | null;
  user_email: string | null;
  user_phone: string | null;
  subscription: TradieSubscriptionSummary | null;
  wallet: Omit<TradieWalletSummary, "transactions"> | null;
  assigned_jobs: JobSummary[];
  lead_claims: {
    id: string;
    job_id: string;
    credits_spent: number;
    status: string;
    created_at: string;
  }[];
};

export type SavedProperty = {
  id: string;
  label: string | null;
  address: string;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  is_default: boolean | null;
};

export type SavedVehicle = {
  id: string;
  label: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  registration: string | null;
  fuel_type: string | null;
  is_default: boolean | null;
};

export type ReviewSummary = {
  id: string;
  job_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  job_title: string;
  job_reference: string;
};

export async function getCustomerJobs(user: AppUser) {
  noStore();

  if (!isSupabasePublicConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id"
    )
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as JobSummary[];
}

export async function getCustomerDashboardInsights(user: AppUser): Promise<CustomerDashboardInsights> {
  noStore();

  if (!isSupabasePublicConfigured()) {
    return { recent_messages: [], review_jobs: [] };
  }

  const jobs = await getCustomerJobs(user);
  const jobIds = jobs.map((job) => job.id);

  if (!jobIds.length) {
    return { recent_messages: [], review_jobs: [] };
  }

  const supabase = await createSupabaseServerClient();
  const [{ data: messages }, { data: reviews }] = await Promise.all([
    supabase
      .from("job_messages")
      .select("id, job_id, sender_label, body, created_at")
      .in("job_id", jobIds)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase.from("reviews").select("job_id").in("job_id", jobIds).eq("reviewer_id", user.id)
  ]);

  const jobById = new Map(jobs.map((job) => [job.id, job]));
  const reviewedJobIds = new Set((reviews ?? []).map((review) => review.job_id as string));

  return {
    recent_messages: (messages ?? []).map((message) => ({
      id: message.id,
      job_id: message.job_id,
      job_title: jobById.get(message.job_id)?.title ?? "Job",
      sender_label: message.sender_label,
      body: message.body,
      created_at: message.created_at
    })),
    review_jobs: jobs
      .filter((job) => ["completed", "closed"].includes(job.status) && !reviewedJobIds.has(job.id))
      .slice(0, 3)
      .map((job) => ({
        id: job.id,
        public_reference: job.public_reference,
        title: job.title
      }))
  };
}

export async function getCustomerMessageThreads(user: AppUser): Promise<TradieMessageThread[]> {
  noStore();

  const jobs = await getCustomerJobs(user);
  const jobIds = jobs.map((job) => job.id);

  if (!jobIds.length || !isSupabasePublicConfigured()) return [];

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("job_messages")
    .select("id, job_id, sender_label, body, created_at")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(30);

  const jobById = new Map(jobs.map((job) => [job.id, job]));

  return (data ?? []).map((message) => {
    const job = jobById.get(message.job_id);
    return {
      id: message.id,
      job_id: message.job_id,
      job_title: job?.title ?? "Job",
      job_reference: job?.public_reference ?? "Job",
      sender_label: message.sender_label,
      body: message.body,
      created_at: message.created_at
    };
  });
}

export async function getCustomerSavedProperties(user: AppUser) {
  noStore();

  if (!isSupabasePublicConfigured()) return [] as SavedProperty[];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saved_properties")
    .select("id, label, address, suburb, postcode, state, is_default")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false });

  if (error) return [];
  return (data ?? []) as SavedProperty[];
}

export async function getCustomerSavedVehicles(user: AppUser) {
  noStore();

  if (!isSupabasePublicConfigured()) return [] as SavedVehicle[];

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("saved_vehicles")
    .select("id, label, make, model, year, registration, fuel_type, is_default")
    .eq("customer_id", user.id)
    .order("is_default", { ascending: false });

  if (error) return [];
  return (data ?? []) as SavedVehicle[];
}

export async function getCustomerReviews(user: AppUser) {
  noStore();

  if (!isSupabasePublicConfigured()) return [] as ReviewSummary[];

  const supabase = await createSupabaseServerClient();
  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, job_id, rating, comment, created_at")
    .eq("reviewer_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !reviews?.length) return [];

  const jobIds = reviews.map((review) => review.job_id).filter(Boolean) as string[];
  const { data: jobs } = jobIds.length
    ? await supabase.from("jobs").select("id, title, public_reference").in("id", jobIds)
    : { data: [] };
  const jobById = new Map((jobs ?? []).map((job) => [job.id, job]));

  return reviews.map((review) => {
    const job = review.job_id ? jobById.get(review.job_id) : null;
    return {
      id: review.id,
      job_id: review.job_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      job_title: job?.title ?? "Completed job",
      job_reference: job?.public_reference ?? "Review"
    };
  }) as ReviewSummary[];
}

export async function getCustomerJobDetail(user: AppUser, id: string) {
  noStore();

  if (!isSupabasePublicConfigured()) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id, address, road_name, road_direction, landmark, preferred_contact_method"
    )
    .eq("id", id)
    .eq("customer_id", user.id)
    .maybeSingle();

  if (error || !data) return null;

  const [{ data: events }, { data: messages }, { data: photos }] = await Promise.all([
    supabase
      .from("job_status_events")
      .select("id, status, title, note, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("job_messages")
      .select("id, sender_label, body, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("job_photos")
      .select("id, file_url, file_name, content_type, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: true })
  ]);

  const signedPhotos = await withSignedPhotoUrls((photos ?? []) as JobPhoto[]);

  return {
    ...(data as JobSummary),
    address: data.address,
    road_name: data.road_name,
    road_direction: data.road_direction,
    landmark: data.landmark,
    preferred_contact_method: data.preferred_contact_method,
    events: (events ?? []) as JobStatusEvent[],
    messages: (messages ?? []) as JobMessage[],
    photos: signedPhotos
  } satisfies JobDetail;
}

export async function getTradieJobDetail(user: AppUser, id: string) {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const tradie = await getTradieProfileForUser(user);
  if (!tradie && user.role === "tradie") return null;

  const query = supabase
    .from("jobs")
    .select(
      "id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id, address, road_name, road_direction, landmark, preferred_contact_method"
    )
    .eq("id", id);

  if (user.role === "tradie") {
    query.eq("assigned_tradie_id", tradie?.id);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;

  const [{ data: events }, { data: messages }, { data: photos }] = await Promise.all([
    supabase
      .from("job_status_events")
      .select("id, status, title, note, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("job_messages")
      .select("id, sender_label, body, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("job_photos")
      .select("id, file_url, file_name, content_type, created_at")
      .eq("job_id", id)
      .order("created_at", { ascending: true })
  ]);

  const signedPhotos = await withSignedPhotoUrls((photos ?? []) as JobPhoto[]);

  return {
    ...(data as JobSummary),
    address: data.address,
    road_name: data.road_name,
    road_direction: data.road_direction,
    landmark: data.landmark,
    preferred_contact_method: data.preferred_contact_method,
    events: (events ?? []) as JobStatusEvent[],
    messages: (messages ?? []) as JobMessage[],
    photos: signedPhotos
  } satisfies JobDetail;
}

async function withSignedPhotoUrls(photos: JobPhoto[]) {
  if (!photos.length || !isSupabaseServerConfigured()) return photos;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return photos;

  const { data } = await supabase.storage
    .from(jobPhotoBucket)
    .createSignedUrls(
      photos.map((photo) => photo.file_url),
      60 * 30
    );

  const urlsByPath = new Map((data ?? []).map((item) => [item.path, item.signedUrl]));

  return photos.map((photo) => ({
    ...photo,
    signed_url: urlsByPath.get(photo.file_url) ?? null
  }));
}

export async function getTradieProfileForUser(user: AppUser) {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("tradie_profiles")
    .select("id, business_name, abn, trade_category, licence_number, service_area, emergency_available, availability_status, verification_status, profile_health, rating, total_reviews, response_rate, public_liability_insurance, years_experience, services_description, agency_property_maintenance_interest, planned_maintenance_contracts_interest")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as TradieProfileSummary;
}

export async function getTradieProfileDetail(user: AppUser) {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const profile = await getTradieProfileForUser(user);
  if (!profile) return null;

  const { data: documents } = await supabase
    .from("verification_documents")
    .select("id, type, status, notes, created_at, reviewed_at")
    .eq("tradie_id", profile.id)
    .order("created_at", { ascending: false });

  return {
    ...profile,
    documents: (documents ?? []) as TradieVerificationDocument[]
  } satisfies TradieProfileDetail;
}

export async function getTradieLeads(user: AppUser) {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const tradie = await getTradieProfileForUser(user);
  if (!tradie) return [];

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id"
    )
    .in("status", ["received", "matching"])
    .is("assigned_tradie_id", null)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !jobs) return [];

  const { data: claims } = await supabase
    .from("lead_claims")
    .select("job_id")
    .eq("tradie_id", tradie.id);

  const claimedJobIds = new Set((claims ?? []).map((claim) => claim.job_id as string));

  return (jobs as JobSummary[]).map((job) => ({
    ...job,
    match_score: scoreLead(job, tradie),
    already_claimed: claimedJobIds.has(job.id)
  })) satisfies LeadSummary[];
}

export async function getTradieAssignedJobs(user: AppUser) {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const tradie = await getTradieProfileForUser(user);
  if (!tradie) return [];

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id"
    )
    .eq("assigned_tradie_id", tradie.id)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as JobSummary[];
}

export async function getTradieMessageThreads(user: AppUser): Promise<TradieMessageThread[]> {
  noStore();

  const jobs = await getTradieAssignedJobs(user);
  const jobIds = jobs.map((job) => job.id);

  if (!jobIds.length || !isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("job_messages")
    .select("id, job_id, sender_label, body, created_at")
    .in("job_id", jobIds)
    .order("created_at", { ascending: false })
    .limit(20);

  const jobById = new Map(jobs.map((job) => [job.id, job]));

  return (data ?? []).map((message) => {
    const job = jobById.get(message.job_id);
    return {
      id: message.id,
      job_id: message.job_id,
      job_title: job?.title ?? "Job",
      job_reference: job?.public_reference ?? "Job",
      sender_label: message.sender_label,
      body: message.body,
      created_at: message.created_at
    };
  });
}

export async function getTradieReviews(user: AppUser) {
  noStore();

  if (!isSupabaseServerConfigured()) return [] as ReviewSummary[];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as ReviewSummary[];

  const tradie = await getTradieProfileForUser(user);
  if (!tradie) return [] as ReviewSummary[];

  const { data: reviews, error } = await supabase
    .from("reviews")
    .select("id, job_id, rating, comment, created_at")
    .eq("reviewee_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !reviews?.length) return [];

  const jobIds = reviews.map((review) => review.job_id).filter(Boolean) as string[];
  const { data: jobs } = jobIds.length
    ? await supabase.from("jobs").select("id, title, public_reference").in("id", jobIds)
    : { data: [] };
  const jobById = new Map((jobs ?? []).map((job) => [job.id, job]));

  return reviews.map((review) => {
    const job = review.job_id ? jobById.get(review.job_id) : null;
    return {
      id: review.id,
      job_id: review.job_id,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at,
      job_title: job?.title ?? "Completed job",
      job_reference: job?.public_reference ?? "Review"
    };
  }) as ReviewSummary[];
}

export async function getTradieWallet(user: AppUser) {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const tradie = await getTradieProfileForUser(user);
  if (!tradie) return null;

  const { data: wallet, error } = await supabase
    .from("tradie_credit_wallets")
    .select("id, balance, bonus_balance, bonus_monthly_amount, bonus_months_total, bonus_months_granted, bonus_next_renewal_at, bonus_expires_at, signup_bonus_granted_at, lifetime_purchased, lifetime_used")
    .eq("tradie_id", tradie.id)
    .maybeSingle();

  if (error || !wallet) return null;

  const { data: transactions } = await supabase
    .from("credit_transactions")
    .select("id, type, amount, reason, created_at")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const bonusIsValid = wallet.bonus_expires_at ? new Date(wallet.bonus_expires_at).getTime() > Date.now() : false;

  return {
    ...wallet,
    bonus_is_valid: bonusIsValid,
    total_available: wallet.balance + (bonusIsValid ? wallet.bonus_balance : 0),
    transactions: transactions ?? []
  } as TradieWalletSummary;
}

export async function getTradieSubscription(user: AppUser) {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const tradie = await getTradieProfileForUser(user);
  if (!tradie) return null;

  const { data, error } = await supabase
    .from("tradie_subscriptions")
    .select("plan, status, current_period_end")
    .eq("tradie_id", tradie.id)
    .maybeSingle();

  if (error || !data) return null;
  return data as TradieSubscriptionSummary;
}

export async function getAdminQueue() {
  noStore();

  if (!isSupabaseServerConfigured()) {
    return {
      jobs: [] as JobSummary[],
      onlineTradies: 0,
      verificationPending: 0,
      disputesOpen: 0
    };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      jobs: [] as JobSummary[],
      onlineTradies: 0,
      verificationPending: 0,
      disputesOpen: 0
    };
  }

  const [jobsResult, tradiesResult, verificationResult, disputesResult] = await Promise.all([
    supabase
      .from("jobs")
      .select(
        "id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id"
      )
      .in("status", ["received", "matching", "tradie_accepted", "en_route", "on_site"])
      .order("created_at", { ascending: false })
      .limit(20),
    supabase.from("tradie_profiles").select("id", { count: "exact", head: true }).eq("availability_status", "available"),
    supabase.from("verification_documents").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("disputes").select("id", { count: "exact", head: true }).in("status", ["open", "under_review"])
  ]);

  return {
    jobs: (jobsResult.data ?? []) as JobSummary[],
    onlineTradies: tradiesResult.count ?? 0,
    verificationPending: verificationResult.count ?? 0,
    disputesOpen: disputesResult.count ?? 0
  };
}

const activeAdminStatuses: JobStatus[] = ["received", "matching", "tradie_accepted", "en_route", "on_site", "quote_provided", "work_in_progress"];

export async function getAdminCommandMetrics(): Promise<AdminCommandMetrics> {
  noStore();

  const emptyMetrics = {
    activeRequests: 0,
    unassignedRequests: 0,
    emergencyRequests: 0,
    todayRequests: 0,
    activeCustomers: 0,
    activeFixers: 0,
    activeMemberships: 0,
    pendingMemberships: 0,
    supportOpen: 0,
    disputesOpen: 0,
    verificationPending: 0
  };

  if (!isSupabaseServerConfigured()) {
    return emptyMetrics;
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) return emptyMetrics;

  const [
    activeRequests,
    unassignedRequests,
    emergencyRequests,
    todayRequests,
    activeCustomers,
    activeFixers,
    activeMemberships,
    pendingMemberships,
    supportOpen,
    disputesOpen,
    verificationPending
  ] = await Promise.all([
    supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", activeAdminStatuses),
    supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", activeAdminStatuses).is("assigned_tradie_id", null),
    supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", activeAdminStatuses).eq("urgency", "emergency"),
    supabase.from("jobs").select("id", { count: "exact", head: true }).in("status", activeAdminStatuses).eq("urgency", "today"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "customer").eq("status", "active"),
    supabase.from("tradie_profiles").select("id", { count: "exact", head: true }).eq("availability_status", "available"),
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("memberships").select("id", { count: "exact", head: true }).in("status", ["inactive", "pending_activation"]),
    supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "waiting"]),
    supabase.from("disputes").select("id", { count: "exact", head: true }).in("status", ["open", "under_review"]),
    supabase.from("verification_documents").select("id", { count: "exact", head: true }).eq("status", "pending")
  ]);

  return {
    activeRequests: activeRequests.count ?? 0,
    unassignedRequests: unassignedRequests.count ?? 0,
    emergencyRequests: emergencyRequests.count ?? 0,
    todayRequests: todayRequests.count ?? 0,
    activeCustomers: activeCustomers.count ?? 0,
    activeFixers: activeFixers.count ?? 0,
    activeMemberships: activeMemberships.count ?? 0,
    pendingMemberships: pendingMemberships.count ?? 0,
    supportOpen: supportOpen.count ?? 0,
    disputesOpen: disputesOpen.count ?? 0,
    verificationPending: verificationPending.count ?? 0
  };
}

export async function getAdminNotifications(user: AppUser): Promise<AdminNotificationRow[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, type, title, body, link, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error) return [];
  return (data ?? []) as AdminNotificationRow[];
}

export async function getAdminRequestQueue(filters: AdminRequestFilters = {}) {
  noStore();

  if (!isSupabaseServerConfigured()) return [] as JobSummary[];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as JobSummary[];

  let query = supabase
    .from("jobs")
    .select("id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id")
    .order("created_at", { ascending: false })
    .limit(80);

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  } else {
    query = query.in("status", activeAdminStatuses);
  }

  if (filters.assignment === "assigned") query = query.not("assigned_tradie_id", "is", null);
  if (filters.assignment === "unassigned") query = query.is("assigned_tradie_id", null);

  const { data, error } = await query;
  if (error) return [];

  const jobs = (data ?? []) as JobSummary[];
  if (!filters.lane || filters.lane === "all") return jobs;
  return jobs.filter((job) => requestLaneLabel(job) === filters.lane);
}

export async function getAdminJobDetail(id: string): Promise<AdminJobDetail | null> {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id, address, road_name, road_direction, landmark, preferred_contact_method"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const [{ data: events }, { data: messages }, { data: photos }, { data: auditLogs }, { data: assignedTradie }] =
    await Promise.all([
      supabase
        .from("job_status_events")
        .select("id, status, title, note, created_at")
        .eq("job_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("job_messages")
        .select("id, sender_label, body, created_at")
        .eq("job_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("job_photos")
        .select("id, file_url, file_name, content_type, created_at")
        .eq("job_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("audit_logs")
        .select("id, action, entity_type, entity_id, metadata, created_at, actor_id")
        .eq("entity_type", "job")
        .eq("entity_id", id)
        .order("created_at", { ascending: false })
        .limit(30),
      data.assigned_tradie_id
        ? supabase
            .from("tradie_profiles")
            .select("id, business_name, trade_category")
            .eq("id", data.assigned_tradie_id)
            .maybeSingle()
        : Promise.resolve({ data: null })
    ]);

  const signedPhotos = await withSignedPhotoUrls((photos ?? []) as JobPhoto[]);

  return {
    ...(data as JobSummary),
    address: data.address,
    road_name: data.road_name,
    road_direction: data.road_direction,
    landmark: data.landmark,
    preferred_contact_method: data.preferred_contact_method,
    events: (events ?? []) as JobStatusEvent[],
    messages: (messages ?? []) as JobMessage[],
    photos: signedPhotos,
    assigned_tradie_name: assignedTradie
      ? assignedTradie.business_name || assignedTradie.trade_category || "Assigned tradie"
      : null,
    audit_logs: (auditLogs ?? []) as AdminAuditLog[]
  } satisfies AdminJobDetail;
}

export async function getAvailableTradiesForAdmin(): Promise<AdminAssignableTradie[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("tradie_profiles")
    .select("id, business_name, trade_category, service_area, availability_status, verification_status")
    .order("business_name", { ascending: true })
    .limit(80);

  return (data ?? []) as AdminAssignableTradie[];
}

// Ranks Fixers for a specific request so admins can dispatch the right person:
// trade match, service-area coverage, availability, emergency-readiness, and
// verification all contribute a score with human-readable reasons. Emergency
// requests bias hard toward emergency-ready, nearby, verified Fixers.
export async function getSuggestedFixersForJob(
  job: Pick<JobSummary, "category" | "title" | "urgency" | "suburb" | "postcode" | "state">
): Promise<AdminSuggestedFixer[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("tradie_profiles")
    .select(
      "id, business_name, trade_category, service_area, availability_status, verification_status, emergency_available, rating"
    )
    .order("business_name", { ascending: true })
    .limit(120);

  const fixers = (data ?? []) as Array<
    AdminAssignableTradie & { emergency_available: boolean | null; rating: number | null }
  >;

  const isEmergency = job.urgency === "emergency";
  const tradeTokens = tokenize(`${job.category} ${job.title}`);
  const suburb = (job.suburb ?? "").trim().toLowerCase();
  const postcode = (job.postcode ?? "").trim().toLowerCase();

  const scored: AdminSuggestedFixer[] = fixers.map((fixer) => {
    const reasons: string[] = [];
    let score = 0;

    // Trade match — overlap between request keywords and the Fixer's trade.
    const tradeText = (fixer.trade_category ?? "").toLowerCase();
    const tradeMatched = tokenize(tradeText).some((token) => tradeTokens.includes(token));
    if (tradeMatched && tradeText && tradeText !== "profile pending") {
      score += 45;
      reasons.push(`${titleCase(fixer.trade_category)} trade match`);
    }

    // Service area — does the Fixer cover this suburb / postcode?
    const area = (fixer.service_area ?? "").toLowerCase();
    if (area && suburb && area.includes(suburb)) {
      score += 30;
      reasons.push(`Services ${titleCase(job.suburb ?? "")}`);
    } else if (area && postcode && area.includes(postcode)) {
      score += 28;
      reasons.push(`Covers ${postcode}`);
    } else if (area && job.state && area.includes(job.state.toLowerCase())) {
      score += 10;
      reasons.push("Nearby area");
    }

    // Availability.
    const available = (fixer.availability_status ?? "").toLowerCase();
    if (["available", "online", "ready"].some((token) => available.includes(token))) {
      score += 12;
      reasons.push("Available now");
    }

    // Emergency readiness — decisive for emergency requests.
    if (isEmergency) {
      if (fixer.emergency_available) {
        score += 25;
        reasons.push("Emergency available");
      } else {
        score -= 20;
      }
    } else if (fixer.emergency_available) {
      score += 4;
    }

    // Verification & reputation.
    if ((fixer.verification_status ?? "").toLowerCase() === "verified") {
      score += 12;
      reasons.push("Verified profile");
    }
    if (typeof fixer.rating === "number" && fixer.rating >= 4) {
      score += 6;
      reasons.push(`${fixer.rating.toFixed(1)}★ rating`);
    }

    return {
      id: fixer.id,
      business_name: fixer.business_name,
      trade_category: fixer.trade_category,
      service_area: fixer.service_area,
      availability_status: fixer.availability_status,
      verification_status: fixer.verification_status,
      emergency_available: Boolean(fixer.emergency_available),
      rating: fixer.rating,
      match_score: Math.max(0, Math.min(100, score)),
      match_reasons: reasons
    } satisfies AdminSuggestedFixer;
  });

  return scored.sort((a, b) => b.match_score - a.match_score);
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2);
}

function titleCase(value: string): string {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getAdminCustomers() {
  noStore();

  if (!isSupabaseServerConfigured()) return [] as AdminCustomerRow[];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as AdminCustomerRow[];

  const [{ data: customers }, { data: jobs }] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, phone, first_name, last_name, status, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase.from("jobs").select("customer_id").not("customer_id", "is", null)
  ]);

  const counts = new Map<string, number>();
  (jobs ?? []).forEach((job) => counts.set(job.customer_id, (counts.get(job.customer_id) ?? 0) + 1));

  return (customers ?? []).map((customer) => ({
    ...customer,
    job_count: counts.get(customer.id) ?? 0
  })) as AdminCustomerRow[];
}

export async function getAdminCustomerDetail(id: string): Promise<AdminCustomerDetail | null> {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: customer, error } = await supabase
    .from("users")
    .select("id, email, phone, first_name, last_name, status, created_at")
    .eq("id", id)
    .eq("role", "customer")
    .maybeSingle();

  if (error || !customer) return null;

  const [{ data: jobs }, { data: properties }, { data: vehicles }, { data: memberships }, { data: reviews }] =
    await Promise.all([
      supabase
        .from("jobs")
        .select("id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id")
        .eq("customer_id", id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase.from("saved_properties").select("id, label, address, suburb, postcode, state, is_default").eq("customer_id", id),
      supabase.from("saved_vehicles").select("id, label, make, model, year, registration, fuel_type, is_default").eq("customer_id", id),
      supabase.from("memberships").select("*").eq("customer_id", id).order("created_at", { ascending: false }).limit(5),
      supabase.from("reviews").select("id, job_id, rating, comment, created_at").eq("reviewer_id", id).order("created_at", { ascending: false }).limit(10)
    ]);

  const reviewJobIds = (reviews ?? []).map((review) => review.job_id).filter(Boolean) as string[];
  const { data: reviewJobs } = reviewJobIds.length
    ? await supabase.from("jobs").select("id, title, public_reference").in("id", reviewJobIds)
    : { data: [] };
  const reviewJobById = new Map((reviewJobs ?? []).map((job) => [job.id, job]));

  return {
    ...customer,
    job_count: jobs?.length ?? 0,
    jobs: (jobs ?? []) as JobSummary[],
    properties: (properties ?? []) as SavedProperty[],
    vehicles: (vehicles ?? []) as SavedVehicle[],
    memberships: (memberships ?? []) as Record<string, unknown>[],
    reviews: (reviews ?? []).map((review) => {
      const job = review.job_id ? reviewJobById.get(review.job_id) : null;
      return {
        id: review.id,
        job_id: review.job_id,
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
        job_title: job?.title ?? "Completed request",
        job_reference: job?.public_reference ?? "Review"
      };
    }) as ReviewSummary[]
  } as AdminCustomerDetail;
}

export async function getAdminFixers(): Promise<AdminFixerDirectoryRow[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data: profiles } = await supabase
    .from("tradie_profiles")
    .select("id, user_id, business_name, abn, trade_category, licence_number, service_area, emergency_available, availability_status, verification_status, profile_health, rating, total_reviews, response_rate")
    .order("business_name", { ascending: true })
    .limit(80);

  const fixerIds = (profiles ?? []).map((profile) => profile.id as string);
  const [{ data: assigned }, { data: claims }] = fixerIds.length
    ? await Promise.all([
        supabase.from("jobs").select("assigned_tradie_id").in("assigned_tradie_id", fixerIds),
        supabase.from("lead_claims").select("tradie_id").in("tradie_id", fixerIds)
      ])
    : [{ data: [] }, { data: [] }];

  const assignedCounts = new Map<string, number>();
  (assigned ?? []).forEach((row) => {
    if (row.assigned_tradie_id) assignedCounts.set(row.assigned_tradie_id, (assignedCounts.get(row.assigned_tradie_id) ?? 0) + 1);
  });

  const claimedCounts = new Map<string, number>();
  (claims ?? []).forEach((row) => {
    if (row.tradie_id) claimedCounts.set(row.tradie_id, (claimedCounts.get(row.tradie_id) ?? 0) + 1);
  });

  return (profiles ?? []).map((profile) => ({
    ...(profile as TradieProfileSummary & { user_id: string | null }),
    assigned_count: assignedCounts.get(profile.id) ?? 0,
    claimed_count: claimedCounts.get(profile.id) ?? 0
  }));
}

// Cross-entity operations search: one query spans requests (reference / title /
// suburb / address / contact), Fixers (business / trade / area / ABN) and
// customers (name / email). Powers the sidebar search box.
export async function searchAdminConsole(rawQuery: string): Promise<AdminSearchResults> {
  noStore();

  const query = rawQuery.trim();
  const empty: AdminSearchResults = { query, requests: [], fixers: [], customers: [], total: 0 };
  if (query.length < 2) return empty;

  if (!isSupabaseServerConfigured()) return empty;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return empty;

  // Strip PostgREST `or()` control characters so the term is treated as data.
  const term = query.replace(/[(),*]/g, " ").trim();
  if (!term) return empty;
  const like = `%${term}%`;

  const [{ data: jobs }, { data: fixers }, { data: customers }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, public_reference, title, category, status, suburb, postcode, state, guest_name")
      .or(`public_reference.ilike.${like},title.ilike.${like},suburb.ilike.${like},address.ilike.${like},guest_name.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("tradie_profiles")
      .select("id, business_name, trade_category, service_area, abn, verification_status")
      .or(`business_name.ilike.${like},trade_category.ilike.${like},service_area.ilike.${like},abn.ilike.${like}`)
      .order("business_name", { ascending: true })
      .limit(12),
    supabase
      .from("users")
      .select("id, first_name, last_name, email, phone, status")
      .eq("role", "customer")
      .or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`)
      .order("created_at", { ascending: false })
      .limit(12)
  ]);

  const requests: AdminSearchResult[] = (jobs ?? []).map((job) => ({
    type: "request",
    id: job.id,
    href: `/admin/jobs/${job.id}`,
    title: job.title || job.public_reference,
    subtitle: `${job.public_reference} · ${job.category ?? "Request"}`,
    meta: [statusLabel(job.status as JobStatus), [job.suburb, job.state].filter(Boolean).join(" ")].filter(Boolean).join(" · ")
  }));

  const fixerResults: AdminSearchResult[] = (fixers ?? []).map((fixer) => ({
    type: "fixer",
    id: fixer.id,
    href: `/admin/tradies/${fixer.id}`,
    title: fixer.business_name || fixer.trade_category || "Fixer",
    subtitle: [fixer.trade_category, fixer.service_area].filter(Boolean).join(" · ") || "Fixer profile",
    meta: fixer.verification_status ? `Verification: ${fixer.verification_status}` : "Verification pending"
  }));

  const customerResults: AdminSearchResult[] = (customers ?? []).map((customer) => ({
    type: "customer",
    id: customer.id,
    href: `/admin/customers/${customer.id}`,
    title: [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Customer",
    subtitle: customer.email || customer.phone || "Customer profile",
    meta: customer.status ? `Status: ${customer.status}` : "Customer"
  }));

  return {
    query,
    requests,
    fixers: fixerResults,
    customers: customerResults,
    total: requests.length + fixerResults.length + customerResults.length
  };
}

export async function getAdminFixerDetail(id: string): Promise<AdminFixerDetail | null> {
  noStore();

  if (!isSupabaseServerConfigured()) return null;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("tradie_profiles")
    .select("id, user_id, business_name, abn, trade_category, licence_number, service_area, emergency_available, availability_status, verification_status, profile_health, rating, total_reviews, response_rate")
    .eq("id", id)
    .maybeSingle();

  if (error || !profile) return null;

  const [{ data: user }, { data: subscription }, { data: wallet }, { data: assignedJobs }, { data: leadClaims }] =
    await Promise.all([
      profile.user_id ? supabase.from("users").select("email, phone").eq("id", profile.user_id).maybeSingle() : Promise.resolve({ data: null }),
      supabase.from("tradie_subscriptions").select("plan, status, current_period_end").eq("tradie_id", id).maybeSingle(),
      supabase
        .from("tradie_credit_wallets")
        .select("id, balance, bonus_balance, bonus_monthly_amount, bonus_months_total, bonus_months_granted, bonus_next_renewal_at, bonus_expires_at, signup_bonus_granted_at, lifetime_purchased, lifetime_used")
        .eq("tradie_id", id)
        .maybeSingle(),
      supabase
        .from("jobs")
        .select("id, public_reference, type, category, urgency, title, description, suburb, postcode, state, status, credit_cost, guest_name, guest_phone, created_at, assigned_tradie_id")
        .eq("assigned_tradie_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("lead_claims")
        .select("id, job_id, credits_spent, status, created_at")
        .eq("tradie_id", id)
        .order("created_at", { ascending: false })
        .limit(20)
    ]);

  const bonusIsValid = wallet?.bonus_expires_at ? new Date(wallet.bonus_expires_at).getTime() > Date.now() : false;

  return {
    ...(profile as TradieProfileSummary & { user_id: string | null }),
    user_email: user?.email ?? null,
    user_phone: user?.phone ?? null,
    subscription: subscription as TradieSubscriptionSummary | null,
    wallet: wallet
      ? {
          ...wallet,
          bonus_is_valid: bonusIsValid,
          total_available: wallet.balance + (bonusIsValid ? wallet.bonus_balance : 0)
        }
      : null,
    assigned_jobs: (assignedJobs ?? []) as JobSummary[],
    lead_claims: (leadClaims ?? []) as AdminFixerDetail["lead_claims"]
  };
}

export async function getAdminVerificationQueue() {
  noStore();

  if (!isSupabaseServerConfigured()) return [] as AdminVerificationRow[];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as AdminVerificationRow[];

  const { data: documents } = await supabase
    .from("verification_documents")
    .select("id, tradie_id, type, status, file_url, notes, created_at")
    .order("created_at", { ascending: false })
    .limit(40);

  const tradieIds = Array.from(new Set((documents ?? []).map((document) => document.tradie_id as string)));
  const { data: tradies } = tradieIds.length
    ? await supabase.from("tradie_profiles").select("id, business_name, trade_category").in("id", tradieIds)
    : { data: [] };

  const tradieById = new Map((tradies ?? []).map((tradie) => [tradie.id, tradie.business_name || tradie.trade_category || "Tradie"]));

  return (documents ?? []).map((document) => ({
    ...document,
    tradie_name: tradieById.get(document.tradie_id) ?? "Tradie"
  })) as AdminVerificationRow[];
}

export async function getAdminRevenueSummary(): Promise<AdminRevenueSummary> {
  noStore();

  const empty: AdminRevenueSummary = {
    active_memberships: 0,
    active_tradie_subscriptions: 0,
    lead_claims: 0,
    credit_spend: 0,
    paid_credits: 0,
    bonus_credits: 0,
    membership_mrr_cents: 0,
    subscription_mrr_cents: 0,
    total_mrr_cents: 0,
    arr_cents: 0,
    plan_lines: []
  };

  if (!isSupabaseServerConfigured()) return empty;

  const supabase = createSupabaseAdminClient();
  if (!supabase) return empty;

  const [memberships, subscriptions, claims, wallets] = await Promise.all([
    supabase.from("memberships").select("plan_code").eq("status", "active"),
    supabase.from("tradie_subscriptions").select("plan").eq("status", "active"),
    supabase.from("lead_claims").select("credits_spent"),
    supabase.from("tradie_credit_wallets").select("balance, bonus_balance")
  ]);

  // Recurring revenue, priced from the canonical billing plan catalogue and
  // grouped into one line per active plan so the desk sees the MRR mix.
  const lineMap = new Map<string, AdminRevenuePlanLine>();
  const addToLine = (code: string | null | undefined, type: AdminRevenuePlanLine["type"]) => {
    if (!code) return;
    const plan = getBillingPlan(code);
    if (!plan || plan.type !== type) return;
    const existing = lineMap.get(code);
    if (existing) {
      existing.count += 1;
      existing.mrr_cents += plan.priceCents;
    } else {
      lineMap.set(code, {
        code,
        name: plan.name,
        type,
        count: 1,
        unit_price_cents: plan.priceCents,
        mrr_cents: plan.priceCents
      });
    }
  };

  (memberships.data ?? []).forEach((row) => addToLine(row.plan_code, "customer_membership"));
  (subscriptions.data ?? []).forEach((row) => addToLine(row.plan, "tradie_subscription"));

  const planLines = Array.from(lineMap.values()).sort((a, b) => b.mrr_cents - a.mrr_cents);
  const membershipMrr = planLines.filter((line) => line.type === "customer_membership").reduce((sum, line) => sum + line.mrr_cents, 0);
  const subscriptionMrr = planLines.filter((line) => line.type === "tradie_subscription").reduce((sum, line) => sum + line.mrr_cents, 0);
  const totalMrr = membershipMrr + subscriptionMrr;

  return {
    active_memberships: memberships.data?.length ?? 0,
    active_tradie_subscriptions: subscriptions.data?.length ?? 0,
    lead_claims: claims.data?.length ?? 0,
    credit_spend: (claims.data ?? []).reduce((total, claim) => total + Number(claim.credits_spent ?? 0), 0),
    paid_credits: (wallets.data ?? []).reduce((total, wallet) => total + Number(wallet.balance ?? 0), 0),
    bonus_credits: (wallets.data ?? []).reduce((total, wallet) => total + Number(wallet.bonus_balance ?? 0), 0),
    membership_mrr_cents: membershipMrr,
    subscription_mrr_cents: subscriptionMrr,
    total_mrr_cents: totalMrr,
    arr_cents: totalMrr * 12,
    plan_lines: planLines
  };
}

export async function getAdminSupportTickets() {
  noStore();

  if (!isSupabaseServerConfigured()) return [] as AdminSupportTicketRow[];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as AdminSupportTicketRow[];

  const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(40);
  const tickets = (data ?? []) as (AdminSupportTicketRow & { customer_name?: string })[];
  const userIds = Array.from(new Set(tickets.map((ticket) => ticket.user_id ?? ticket.customer_id).filter(Boolean))) as string[];
  const { data: users } = userIds.length
    ? await supabase.from("users").select("id, email, first_name, last_name").in("id", userIds)
    : { data: [] };
  const userById = new Map((users ?? []).map((ticketUser) => [ticketUser.id, ticketUser]));

  return tickets.map((ticket) => {
    const linkedUserId = ticket.user_id ?? ticket.customer_id;
    const linkedUser = linkedUserId ? userById.get(linkedUserId) : null;
    const publicLeadName = ticket.body ? extractSupportBodyValue(ticket.body, "Name") : null;
    const publicLeadEmail = ticket.body ? extractSupportBodyValue(ticket.body, "Email") : null;
    return {
      ...ticket,
      customer_name: linkedUser
        ? [linkedUser.first_name, linkedUser.last_name].filter(Boolean).join(" ") || linkedUser.email || "User"
        : [publicLeadName, publicLeadEmail].filter(Boolean).join(" · ") || "Public enquiry"
    };
  });
}

function extractSupportBodyValue(body: string, label: string) {
  const line = body.split("\n").find((item) => item.toLowerCase().startsWith(`${label.toLowerCase()}:`));
  return line?.slice(label.length + 1).trim() || null;
}

export async function getUserSupportTickets(user: AppUser): Promise<UserSupportTicketRow[]> {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("support_tickets")
    .select("id, subject, title, body, message, description, notes, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  return (data ?? []) as UserSupportTicketRow[];
}

export async function getAdminDisputes() {
  noStore();

  if (!isSupabaseServerConfigured()) return [] as AdminDisputeRow[];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as AdminDisputeRow[];

  const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false }).limit(40);
  return (data ?? []) as AdminDisputeRow[];
}

export async function getAdminMemberships() {
  noStore();

  if (!isSupabaseServerConfigured()) return [] as AdminMembershipRow[];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [] as AdminMembershipRow[];

  const { data } = await supabase.from("memberships").select("*").order("created_at", { ascending: false }).limit(40);
  const memberships = (data ?? []) as AdminMembershipRow[];
  const customerIds = Array.from(new Set(memberships.map((membership) => membership.customer_id).filter(Boolean))) as string[];
  const { data: customers } = customerIds.length
    ? await supabase.from("users").select("id, email, first_name, last_name").in("id", customerIds)
    : { data: [] };
  const customerById = new Map((customers ?? []).map((customer) => [customer.id, customer]));

  return memberships.map((membership) => {
    const customer = membership.customer_id ? customerById.get(membership.customer_id) : null;
    return {
      ...membership,
      customer_name: customer
        ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.email || "Customer"
        : "Customer pending",
      customer_email: customer?.email ?? null
    };
  });
}

export function statusLabel(status: JobStatus) {
  return status
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatJobLocation(job: Pick<JobSummary, "suburb" | "postcode" | "state">) {
  return [job.suburb, job.postcode, job.state].filter(Boolean).join(" ") || "Location pending";
}

export function requestLaneLabel(job: Pick<JobSummary, "type" | "description" | "credit_cost">): RequestLaneLabel {
  const description = job.description.toLowerCase();

  if (description.includes("request lane: larger project") || job.credit_cost >= 200) return "Project quote";
  if (description.includes("request lane: standard trade")) return "Trade request";
  if (job.type === "road") return "Roadside emergency";
  if (job.type === "scheduled") return "Trade request";
  return "Home emergency";
}

export function requestLaneTone(job: Pick<JobSummary, "type" | "description" | "credit_cost">) {
  const lane = requestLaneLabel(job);
  if (lane === "Project quote") return "purple";
  if (lane === "Trade request") return "blue";
  if (lane === "Roadside emergency") return "red";
  return "red";
}

function scoreLead(job: JobSummary, tradie: TradieProfileSummary) {
  let score = 68;
  if (job.urgency === "emergency" && tradie.emergency_available) score += 18;
  if (job.category.toLowerCase().includes(tradie.trade_category.toLowerCase())) score += 14;
  if (tradie.service_area && job.suburb && tradie.service_area.toLowerCase().includes(job.suburb.toLowerCase())) score += 8;
  return Math.min(score, 98);
}
