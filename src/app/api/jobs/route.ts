import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAppUser } from "@/lib/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";
import { jobPhotoBucket, jobPhotoTypes, maxJobPhotoBytes, storagePath } from "@/lib/uploads";

const jobRequestSchema = z.object({
  type: z.enum(["home", "road", "scheduled"]),
  serviceLane: z.enum(["emergency_home", "emergency_road", "standard_trade_job", "larger_project"]).optional(),
  category: z.string().min(2),
  title: z.string().min(2),
  description: z.string().min(4),
  danger: z.string().optional(),
  utilities: z.string().optional(),
  address: z.string().optional(),
  suburb: z.string().optional(),
  postcode: z.string().optional(),
  state: z.string().optional(),
  roadName: z.string().optional(),
  roadDirection: z.string().optional(),
  landmark: z.string().optional(),
  firstName: z.string().min(1),
  phone: z.string().min(8),
  email: z.string().email().optional().or(z.literal("")),
  contact: z.enum(["call", "sms", "in_app"]),
  timing: z.string().optional(),
  budgetRange: z.string().optional(),
  consent: z.literal(true)
});

export async function POST(request: Request) {
  const limit = rateLimit({
    key: `jobs:${getClientIp(request)}`,
    limit: 8,
    windowMs: 60 * 60 * 1000
  });

  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests from this connection. Please try again later." }, { status: 429 });
  }

  const user = await getCurrentAppUser();
  const formData = await request.formData();
  const rawRequest = formData.get("request");
  const files = formData.getAll("photos").filter((file): file is File => file instanceof File && file.size > 0);
  const requestData =
    typeof rawRequest === "string"
      ? JSON.parse(rawRequest)
      : Object.fromEntries(Array.from(formData.entries()).filter(([key]) => key !== "photos"));

  const payload = jobRequestSchema.safeParse(requestData);

  if (!payload.success) {
    return NextResponse.json({ error: "Please complete the required request details." }, { status: 400 });
  }

  if (files.length > 6) {
    return NextResponse.json({ error: "Upload up to 6 photos for this request." }, { status: 400 });
  }

  const invalidFile = files.find((file) => !jobPhotoTypes.includes(file.type) || file.size > maxJobPhotoBytes);
  if (invalidFile) {
    return NextResponse.json({ error: "Photos must be JPG, PNG, or WebP images under 10MB each." }, { status: 400 });
  }

  if (!isSupabaseServerConfigured()) {
    return NextResponse.json(
      {
        error: "Supabase server key is not configured yet. Add SUPABASE_SECRET_KEY to save guest jobs.",
        configured: false
      },
      { status: 503 }
    );
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const data = payload.data;
  const title = data.title || `${data.category} request`;
  const isCustomerAccount = user?.role === "customer";
  const lane = data.serviceLane ?? (data.type === "road" ? "emergency_road" : data.type === "scheduled" ? "standard_trade_job" : "emergency_home");
  const isProject = lane === "larger_project";
  const isStandard = lane === "standard_trade_job";
  const isEmergency = lane === "emergency_home" || lane === "emergency_road";
  const enrichedDescription = [
    `Request lane: ${lane.replaceAll("_", " ")}`,
    data.timing ? `Timing: ${data.timing}` : null,
    data.budgetRange && (isStandard || isProject) ? `Budget: ${data.budgetRange}` : null,
    "",
    data.description
  ]
    .filter((item) => item !== null)
    .join("\n");

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      customer_id: isCustomerAccount ? user.id : null,
      type: data.type,
      category: data.category,
      urgency: isEmergency ? "emergency" : data.timing === "Today" ? "today" : "flexible",
      title,
      description: enrichedDescription,
      danger_notes: data.danger,
      utilities_involved: data.utilities,
      address: data.address || null,
      suburb: data.suburb || null,
      postcode: data.postcode || null,
      state: data.state || null,
      road_name: data.roadName || null,
      road_direction: data.roadDirection || null,
      landmark: data.landmark || null,
      guest_name: isCustomerAccount ? null : data.firstName,
      guest_phone: isCustomerAccount ? null : data.phone,
      guest_email: isCustomerAccount ? null : data.email || null,
      preferred_contact_method: data.contact,
      consent_to_contact: data.consent,
      status: "received",
      credit_cost: isProject ? 220 : isStandard ? 50 : 120
    })
    .select("id, public_reference")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from("job_status_events").insert({
    job_id: job.id,
    status: "received",
    title: isProject ? "Project quote request posted" : isStandard ? "Trade request posted" : "Emergency request posted",
    note: isCustomerAccount ? "Customer request received by Fixit247." : "Guest request received by Fixit247.",
    created_by: isCustomerAccount ? user.id : null
  });

  if (files.length) {
    const photoRows = [];

    for (const file of files) {
      const path = storagePath(["jobs", job.id], file.name);
      const bytes = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage.from(jobPhotoBucket).upload(path, bytes, {
        contentType: file.type,
        upsert: false
      });

      if (!uploadError) {
        photoRows.push({
          job_id: job.id,
          file_url: path,
          file_name: file.name,
          content_type: file.type
        });
      }
    }

    if (photoRows.length) {
      await supabase.from("job_photos").insert(photoRows);
    }
  }

  return NextResponse.json({
    reference: job.public_reference,
    photoCount: files.length,
    dashboardUrl: isCustomerAccount ? `/dashboard/customer/jobs/${job.id}` : null
  });
}
