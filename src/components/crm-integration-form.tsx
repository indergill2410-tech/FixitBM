"use client";

import { useActionState } from "react";
import { saveCrmIntegrationAction, type AgencyActionState } from "@/app/dashboard/agency/actions";
import { Button } from "@/components/ui";
import { crmProviderLabels, type CrmIntegrationSummary } from "@/lib/crm";

const initialState: AgencyActionState = {};

export function CrmIntegrationForm({
  integration,
  disabled
}: {
  integration: CrmIntegrationSummary | null;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(saveCrmIntegrationAction, initialState);

  return (
    <form action={action} className="mt-5 grid gap-4">
      {state.message ? (
        <div className={`rounded-xl p-3 text-sm font-semibold ${state.ok ? "bg-green-50 text-[var(--green)]" : "bg-red-50 text-[var(--red)]"}`}>
          {state.message}
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-bold">
        CRM provider
        <select name="provider" defaultValue={integration?.provider ?? "property_me"} className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-white px-4" disabled={disabled}>
          {(Object.keys(crmProviderLabels) as (keyof typeof crmProviderLabels)[]).map((key) => (
            <option key={key} value={key}>{crmProviderLabels[key]}</option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Account ID <span className="font-normal text-[var(--text3)]">(optional)</span>
        <input name="accountId" defaultValue={integration?.account_id ?? ""} className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-white px-4" placeholder="Your CRM account / agency ID" disabled={disabled} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        API key
        <input name="apiKey" type="password" className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-white px-4" placeholder={integration?.has_api_key ? "•••••••• (leave blank to keep current)" : "Paste your CRM API key"} disabled={disabled} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Endpoint URL <span className="font-normal text-[var(--text3)]">(optional override)</span>
        <input name="baseUrl" defaultValue={integration?.base_url ?? ""} className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-white px-4" placeholder="https://… (defaults to the provider API)" disabled={disabled} />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Status
        <select name="status" defaultValue={integration?.status ?? "active"} className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-white px-4" disabled={disabled}>
          <option value="active">Active — push reports</option>
          <option value="paused">Paused — stop pushing</option>
        </select>
      </label>
      <Button disabled={pending || disabled}>{pending ? "Saving…" : "Save CRM connection"}</Button>
      <p className="text-xs leading-5 text-[var(--text3)]">
        When active, published compliance reports for your properties are pushed to your CRM. Keys are stored securely and
        never shown again.
      </p>
    </form>
  );
}
