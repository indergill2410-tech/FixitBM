import { unstable_noStore as noStore } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabasePublicConfigured, isSupabaseServerConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AppUser } from "@/lib/auth";
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

export type AdminRevenueSummary = {
  active_memberships: number;
  active_tradie_subscriptions: number;
  lead_claims: number;
  credit_spend: number;
  paid_credits: number;
  bonus_credits: number;
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

export type AdminAssignableTradie = {
  id: string;
  business_name: string | null;
  trade_category: string;
  service_area: string | null;
  availability_status: string | null;
  verification_status: string | null;
};

export type AdminJobDetail = JobDetail & {
  assigned_tradie_name: string | null;
  audit_logs: AdminAuditLog[];
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
    .select("id, business_name, abn, trade_category, licence_number, service_area, emergency_available, availability_status, verification_status, profile_health, rating, total_reviews, response_rate")
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

  if (!isSupabaseServerConfigured()) {
    return { active_memberships: 0, active_tradie_subscriptions: 0, lead_claims: 0, credit_spend: 0, paid_credits: 0, bonus_credits: 0 };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return { active_memberships: 0, active_tradie_subscriptions: 0, lead_claims: 0, credit_spend: 0, paid_credits: 0, bonus_credits: 0 };
  }

  const [memberships, subscriptions, claims, wallets] = await Promise.all([
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tradie_subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("lead_claims").select("credits_spent"),
    supabase.from("tradie_credit_wallets").select("balance, bonus_balance")
  ]);

  return {
    active_memberships: memberships.count ?? 0,
    active_tradie_subscriptions: subscriptions.count ?? 0,
    lead_claims: claims.data?.length ?? 0,
    credit_spend: (claims.data ?? []).reduce((total, claim) => total + Number(claim.credits_spent ?? 0), 0),
    paid_credits: (wallets.data ?? []).reduce((total, wallet) => total + Number(wallet.balance ?? 0), 0),
    bonus_credits: (wallets.data ?? []).reduce((total, wallet) => total + Number(wallet.bonus_balance ?? 0), 0)
  };
}

export async function getAdminSupportTickets() {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase.from("support_tickets").select("*").order("created_at", { ascending: false }).limit(40);
  return data ?? [];
}

export async function getAdminDisputes() {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase.from("disputes").select("*").order("created_at", { ascending: false }).limit(40);
  return data ?? [];
}

export async function getAdminMemberships() {
  noStore();

  if (!isSupabaseServerConfigured()) return [];

  const supabase = createSupabaseAdminClient();
  if (!supabase) return [];

  const { data } = await supabase.from("memberships").select("*").order("created_at", { ascending: false }).limit(40);
  return data ?? [];
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
