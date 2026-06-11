import { getCurrentAppUser } from "@/lib/auth";
import { complianceResultLabel, type ComplianceResult } from "@/lib/inspection-templates";
import { renderComplianceCertificatePdf, type CertificateCategory } from "@/lib/pdf";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const user = await getCurrentAppUser();

  if (!user) {
    return new Response("Sign in to download this certificate.", { status: 401 });
  }

  if (!isSupabaseServerConfigured()) {
    return new Response("Certificates are temporarily unavailable.", { status: 503 });
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return new Response("Certificates are temporarily unavailable.", { status: 503 });
  }

  const { data: check } = await supabase
    .from("safety_checks")
    .select("id, customer_id, property_id, assigned_fixer_id, compliance_result, category_results, certificate_number, certificate_issued_at, inspector_name, inspector_licence_no, summary")
    .eq("id", id)
    .maybeSingle();

  if (!check || !check.certificate_number) {
    return new Response("No certificate has been issued for this inspection.", { status: 404 });
  }

  // Authorise: property owner, the assigned Fixer, or an admin.
  let authorised = user.role === "admin" || user.role === "super_admin" || check.customer_id === user.id;
  if (!authorised && check.assigned_fixer_id) {
    const { data: tradie } = await supabase.from("tradie_profiles").select("id").eq("user_id", user.id).maybeSingle();
    authorised = Boolean(tradie?.id && tradie.id === check.assigned_fixer_id);
  }
  if (!authorised) {
    return new Response("You do not have access to this certificate.", { status: 403 });
  }

  const { data: property } = check.property_id
    ? await supabase.from("saved_properties").select("label, address, suburb, postcode, state").eq("id", check.property_id).maybeSingle()
    : { data: null };
  const { data: owner } = await supabase
    .from("users")
    .select("first_name, last_name")
    .eq("id", check.customer_id)
    .maybeSingle();

  const categoryResults = (check.category_results ?? {}) as Record<string, { label: string; result: ComplianceResult; next_due_at: string | null }>;
  const categories: CertificateCategory[] = Object.values(categoryResults).map((value) => ({
    label: value.label,
    result: complianceResultLabel[value.result] ?? value.result,
    nextDue: value.next_due_at ? formatDate(value.next_due_at) : null
  }));

  const overall = (check.compliance_result ?? "not_applicable") as ComplianceResult;
  const pdf = renderComplianceCertificatePdf({
    certificateNumber: check.certificate_number,
    issuedAt: formatDate(check.certificate_issued_at),
    propertyLabel: property?.label || "Property",
    propertyAddress: property
      ? [property.address, property.suburb, property.postcode, property.state].filter(Boolean).join(", ")
      : null,
    ownerName: owner ? [owner.first_name, owner.last_name].filter(Boolean).join(" ") || null : null,
    inspectorName: check.inspector_name,
    inspectorLicenceNo: check.inspector_licence_no,
    overallResult: complianceResultLabel[overall] ?? overall,
    categories,
    summary: check.summary
  });

  return new Response(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${check.certificate_number}.pdf"`,
      "Cache-Control": "private, no-store"
    }
  });
}
