// Outbound CRM sync for published compliance reports.
//
// Pushes a normalized compliance payload to a property-management CRM
// (PropertyMe or Property Tree) when the property owner / agency has
// configured an integration. Best-effort: failures are logged, never thrown,
// so they can't block a published report.

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

export type CrmProvider = "property_me" | "property_tree";

export const crmProviderLabels: Record<CrmProvider, string> = {
  property_me: "PropertyMe",
  property_tree: "Property Tree"
};

// Documented API roots. Agencies can override base_url with their own endpoint
// (e.g. an inbound automation webhook) when their plan exposes a custom path.
const providerDefaultBaseUrl: Record<CrmProvider, string> = {
  property_me: "https://api.propertyme.com/v1/compliance-events",
  property_tree: "https://api.propertytree.com/v1/compliance-events"
};

type ComplianceCategorySummary = {
  key: string;
  label: string;
  result: string;
  nextDue: string | null;
};

export type CrmComplianceSyncInput = {
  ownerUserId: string;
  safetyCheckId: string;
  propertyLabel: string;
  propertyAddress: string | null;
  certificateNumber: string | null;
  overallResult: string;
  categories: ComplianceCategorySummary[];
  publishedAt: string;
};

type CrmIntegrationRow = {
  id: string;
  provider: CrmProvider;
  api_key: string | null;
  base_url: string | null;
  account_id: string | null;
  status: string;
};

function buildPayload(integration: CrmIntegrationRow, input: CrmComplianceSyncInput) {
  return {
    provider: integration.provider,
    accountId: integration.account_id,
    event: "rental_compliance_report_published",
    property: {
      label: input.propertyLabel,
      address: input.propertyAddress
    },
    compliance: {
      certificateNumber: input.certificateNumber,
      overallResult: input.overallResult,
      publishedAt: input.publishedAt,
      categories: input.categories.map((category) => ({
        category: category.key,
        label: category.label,
        result: category.result,
        nextDueAt: category.nextDue
      }))
    },
    source: "fixit247"
  };
}

export type CrmIntegrationSummary = {
  provider: CrmProvider;
  status: string;
  account_id: string | null;
  base_url: string | null;
  has_api_key: boolean;
  last_synced_at: string | null;
};

/** Loads the owner's CRM integration summary (never returns the API key). */
export async function getCrmIntegrationForOwner(ownerUserId: string): Promise<CrmIntegrationSummary | null> {
  if (!isSupabaseServerConfigured()) return null;
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("crm_integrations")
    .select("provider, status, account_id, base_url, api_key, last_synced_at")
    .eq("owner_user_id", ownerUserId)
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return {
    provider: data.provider as CrmProvider,
    status: data.status,
    account_id: data.account_id,
    base_url: data.base_url,
    has_api_key: Boolean(data.api_key),
    last_synced_at: data.last_synced_at
  };
}

/**
 * Syncs a published compliance report to the owner's configured CRM.
 * Returns a status string; never throws.
 */
export async function syncComplianceReportToCrm(input: CrmComplianceSyncInput): Promise<"success" | "skipped" | "error"> {
  if (!isSupabaseServerConfigured()) return "skipped";

  const supabase = createSupabaseAdminClient();
  if (!supabase) return "skipped";

  const { data: integration } = await supabase
    .from("crm_integrations")
    .select("id, provider, api_key, base_url, account_id, status")
    .eq("owner_user_id", input.ownerUserId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (!integration) return "skipped";

  const row = integration as CrmIntegrationRow;
  const payload = buildPayload(row, input);
  const endpoint = row.base_url || providerDefaultBaseUrl[row.provider];

  let status: "success" | "error" = "error";
  let responseSummary = "";

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(row.api_key ? { Authorization: `Bearer ${row.api_key}` } : {})
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);
    status = response.ok ? "success" : "error";
    responseSummary = `HTTP ${response.status}`;
  } catch (error) {
    status = "error";
    responseSummary = error instanceof Error ? error.message.slice(0, 280) : "Unknown CRM sync error";
  }

  await supabase.from("crm_sync_logs").insert({
    integration_id: row.id,
    safety_check_id: input.safetyCheckId,
    owner_user_id: input.ownerUserId,
    provider: row.provider,
    status,
    request_payload: payload,
    response_summary: responseSummary
  });

  if (status === "success") {
    await supabase.from("crm_integrations").update({ last_synced_at: new Date().toISOString() }).eq("id", row.id);
  }

  return status;
}
