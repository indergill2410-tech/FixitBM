import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { notifyLeadClaimed } from "@/lib/email";
import { fixerMarketplaceEnabled } from "@/lib/featureFlags";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

type LeadClaimRpcResult = {
  ok?: boolean;
  code?: string;
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const jobId = String(formData.get("jobId") ?? "");
  const user = await getCurrentAppUser();
  const redirectUrl = new URL("/dashboard/tradie/leads", request.url);

  // Self-serve lead claiming is disabled until the marketplace launches; work is
  // dispatched by admins. Guard the endpoint so credits can never be spent early.
  if (!fixerMarketplaceEnabled) {
    redirectUrl.pathname = "/dashboard/tradie";
    redirectUrl.searchParams.set("claim", "disabled");
    return NextResponse.redirect(redirectUrl);
  }

  if (!jobId || !user || user.role !== "tradie") {
    redirectUrl.searchParams.set("claim", "denied");
    return NextResponse.redirect(redirectUrl);
  }

  if (!isSupabaseServerConfigured()) {
    redirectUrl.searchParams.set("claim", "config");
    return NextResponse.redirect(redirectUrl);
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    redirectUrl.searchParams.set("claim", "config");
    return NextResponse.redirect(redirectUrl);
  }

  const { data: claimResult, error } = await supabase
    .rpc("claim_lead_with_credits", {
      p_job_id: jobId,
      p_user_id: user.id,
      p_match_score: 88
    })
    .single();

  if (error || !claimResult) {
    redirectUrl.searchParams.set("claim", "error");
    return NextResponse.redirect(redirectUrl);
  }

  const typedClaimResult = claimResult as LeadClaimRpcResult;
  const resultCode = typeof typedClaimResult.code === "string" ? typedClaimResult.code : "error";
  if (!typedClaimResult.ok) {
    redirectUrl.searchParams.set("claim", resultCode);
    return NextResponse.redirect(redirectUrl);
  }

  revalidatePath("/dashboard/tradie/leads");
  revalidatePath("/dashboard/tradie/wallet");

  const [{ data: job }, { data: tradie }] = await Promise.all([
    supabase
      .from("jobs")
      .select("id, public_reference, title, customer_id, guest_email")
      .eq("id", jobId)
      .maybeSingle(),
    supabase
      .from("tradie_profiles")
      .select("id, business_name, trade_category")
      .eq("user_id", user.id)
      .maybeSingle()
  ]);

  const { data: customer } = job?.customer_id
    ? await supabase.from("users").select("email").eq("id", job.customer_id).maybeSingle()
    : { data: null };

  if (job) {
    await notifyLeadClaimed({
      jobId: job.id,
      reference: job.public_reference,
      jobTitle: job.title,
      fixerName: tradie?.business_name || tradie?.trade_category || user.first_name || "Fixer",
      fixerEmail: user.email,
      customerEmail: customer?.email ?? job.guest_email ?? null
    });
  }

  redirectUrl.searchParams.set("claim", "success");
  return NextResponse.redirect(redirectUrl);
}
