"use client";

import { useActionState } from "react";
import { Building2, Home, Loader2, MailCheck, Settings2 } from "lucide-react";
import {
  addAgencyManagedPropertyAction,
  inviteAgencyOwnerAction,
  saveAgencyProfileAction,
  saveAgencyRulesAction,
  type AgencyActionState
} from "@/app/dashboard/agency/actions";
import { Button } from "@/components/ui";
import type { AgencyMaintenanceRules, AgencyManagedProperty, AgencyProfile } from "@/lib/agency";

const initialState: AgencyActionState = {};

const portfolioSizes = ["1-10", "11-50", "51-150", "151-500", "500+"];

export function AgencyProfileForm({ agency }: { agency: AgencyProfile | null }) {
  const [state, action, pending] = useActionState(saveAgencyProfileAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <FormMessage state={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="name" label="Agency name" defaultValue={agency?.name ?? ""} autoComplete="organization" />
        <Field name="phone" label="Agency phone" defaultValue={agency?.phone ?? ""} autoComplete="tel" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="serviceArea" label="Service area" defaultValue={agency?.service_area ?? ""} placeholder="Sydney inner west" />
        <Select name="portfolioSize" label="Managed properties" options={portfolioSizes.map((value) => [value, value])} defaultValue={agency?.portfolio_size ?? "1-10"} />
      </div>
      <Field name="abn" label="ABN optional" defaultValue={agency?.abn ?? ""} required={false} />
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <Building2 size={17} />}
        {agency ? "Update agency workspace" : "Create agency workspace"}
      </Button>
    </form>
  );
}

export function AgencyManagedPropertyForm({ disabled }: { disabled: boolean }) {
  const [state, action, pending] = useActionState(addAgencyManagedPropertyAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <FormMessage state={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="label" label="Property label" placeholder="Unit 4, King Street" disabled={disabled} />
        <Field name="address" label="Address" placeholder="12 King Street" disabled={disabled} />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field name="suburb" label="Suburb" disabled={disabled} required={false} />
        <Field name="postcode" label="Postcode" disabled={disabled} required={false} />
        <Field name="state" label="State" defaultValue="NSW" disabled={disabled} required={false} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="ownerName" label="Owner name optional" disabled={disabled} required={false} />
        <Field name="ownerEmail" label="Owner email optional" type="email" disabled={disabled} required={false} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          name="managementStatus"
          label="Status"
          options={[
            ["onboarding", "Onboarding"],
            ["active", "Active"],
            ["needs_review", "Needs review"]
          ]}
          disabled={disabled}
        />
        <Select
          name="riskStatus"
          label="Attention"
          options={[
            ["clear", "Clear"],
            ["watch", "Watch"],
            ["needs_review", "Needs review"],
            ["urgent", "Urgent"]
          ]}
          disabled={disabled}
        />
      </div>
      <Textarea
        name="notes"
        label="Helpful context optional"
        placeholder="Access notes, regular issues, owner preference, tenant handover context."
        disabled={disabled}
      />
      <Button disabled={disabled || pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <Home size={17} />}
        Add managed property
      </Button>
    </form>
  );
}

export function AgencyOwnerInviteForm({ properties, disabled }: { properties: AgencyManagedProperty[]; disabled: boolean }) {
  const [state, action, pending] = useActionState(inviteAgencyOwnerAction, initialState);
  const options = properties.map((property) => [
    property.id,
    property.label || [property.address, property.suburb, property.postcode, property.state].filter(Boolean).join(" ")
  ]);

  return (
    <form action={action} className="grid gap-4">
      <FormMessage state={state} />
      <Select name="managedPropertyId" label="Property" options={options} disabled={disabled || !options.length} />
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="ownerName" label="Owner name optional" disabled={disabled || !options.length} required={false} />
        <Field name="ownerEmail" label="Owner email" type="email" disabled={disabled || !options.length} />
      </div>
      <Select
        name="accessLevel"
        label="Access level"
        options={[
          ["view_record", "View record"],
          ["request_work", "View and request work"],
          ["manage_record", "Manage property record"]
        ]}
        disabled={disabled || !options.length}
      />
      <Button disabled={disabled || !options.length || pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <MailCheck size={17} />}
        Prepare owner access
      </Button>
    </form>
  );
}

export function AgencyRulesForm({ rules, disabled }: { rules: AgencyMaintenanceRules | null; disabled: boolean }) {
  const [state, action, pending] = useActionState(saveAgencyRulesAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <FormMessage state={state} />
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          name="ownerUpdatePolicy"
          label="Owner update policy"
          defaultValue={rules?.owner_update_policy ?? "urgent_and_recommended"}
          options={[
            ["urgent_only", "Urgent only"],
            ["urgent_and_recommended", "Urgent and recommended"],
            ["all_requests", "All requests"]
          ]}
          disabled={disabled}
        />
        <Select
          name="defaultContactMethod"
          label="Default contact"
          defaultValue={rules?.default_contact_method ?? "email"}
          options={[
            ["email", "Email"],
            ["phone", "Phone"],
            ["sms", "SMS"]
          ]}
          disabled={disabled}
        />
      </div>
      <Textarea
        name="afterHoursNotes"
        label="After-hours notes"
        defaultValue={rules?.after_hours_notes ?? ""}
        placeholder="Who should be contacted when an urgent request arrives after hours?"
        disabled={disabled}
      />
      <Textarea
        name="urgentAuthorityNotes"
        label="Urgent authority notes"
        defaultValue={rules?.urgent_authority_notes ?? ""}
        placeholder="Example: call the manager first, then notify the owner when cost or safety needs approval."
        disabled={disabled}
      />
      <Textarea
        name="preferredTradesNotes"
        label="Preferred Fixer notes"
        defaultValue={rules?.preferred_trades_notes ?? ""}
        placeholder="Preferred trades, excluded suppliers, access requirements, or quote thresholds."
        disabled={disabled}
      />
      <Button disabled={disabled || pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <Settings2 size={17} />}
        Save rules
      </Button>
    </form>
  );
}

function FormMessage({ state }: { state: AgencyActionState }) {
  if (!state.message) return null;

  return (
    <div
      className={`rounded-xl p-3 text-sm font-black ${
        state.ok ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"
      }`}
    >
      {state.message}
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  autoComplete,
  required = true,
  disabled = false
}: {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  autoComplete?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--text)]">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 font-medium disabled:opacity-60"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  defaultValue,
  disabled = false
}: {
  name: string;
  label: string;
  options: string[][];
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--text)]">
      {label}
      <select
        name={name}
        required
        defaultValue={defaultValue}
        disabled={disabled}
        className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 font-medium disabled:opacity-60"
      >
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function Textarea({
  name,
  label,
  placeholder,
  defaultValue,
  disabled = false
}: {
  name: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--text)]">
      {label}
      <textarea
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        disabled={disabled}
        className="focus-ring min-h-28 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 font-medium disabled:opacity-60"
      />
    </label>
  );
}
