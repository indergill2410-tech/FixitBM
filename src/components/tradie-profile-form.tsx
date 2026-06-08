"use client";

import { BriefcaseBusiness, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";
import type { TradieProfileDetail } from "@/lib/jobs";

export function TradieProfileForm({ profile }: { profile: TradieProfileDetail }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setMessage(null);
    setIsSaving(true);

    const response = await fetch("/api/tradie/profile", {
      method: "POST",
      body: new FormData(form)
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setIsSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Profile could not be saved.");
      return;
    }

    setMessage("Profile saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="businessName" label="Business name" defaultValue={profile.business_name ?? ""} required />
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="tradeCategory" label="Trade category" defaultValue={profile.trade_category ?? ""} required />
        <Field name="serviceArea" label="Service area" defaultValue={profile.service_area ?? ""} required />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="abn" label="ABN" defaultValue={profile.abn ?? ""} />
        <Field name="licenceNumber" label="Licence number" defaultValue={profile.licence_number ?? ""} />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          name="publicLiabilityInsurance"
          label="Public liability insurance"
          defaultValue={profile.public_liability_insurance ?? "not_supplied"}
          options={[
            ["not_supplied", "Not supplied"],
            ["yes", "Yes"],
            ["no", "No"]
          ]}
        />
        <Field
          name="yearsExperience"
          label="Years of experience"
          type="number"
          defaultValue={profile.years_experience?.toString() ?? ""}
        />
      </div>
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">Short description of services</span>
        <textarea
          name="servicesDescription"
          defaultValue={profile.services_description ?? ""}
          className="focus-ring min-h-28 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-3"
        />
      </label>
      <select
        name="availabilityStatus"
        defaultValue={profile.availability_status ?? "available"}
        className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3"
      >
        <option value="available">Available</option>
        <option value="busy">Busy</option>
        <option value="offline">Offline</option>
      </select>
      <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--text2)]">
        <input name="emergencyAvailable" type="checkbox" defaultChecked={profile.emergency_available} />
        Available for emergency jobs
      </label>
      <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--text2)]">
        <input name="agencyPropertyMaintenanceInterest" type="checkbox" defaultChecked={Boolean(profile.agency_property_maintenance_interest)} />
        Interested in agency and property maintenance work
      </label>
      <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--text2)]">
        <input name="plannedMaintenanceContractsInterest" type="checkbox" defaultChecked={Boolean(profile.planned_maintenance_contracts_interest)} />
        Interested in planned maintenance and contract work
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isSaving}>
          {isSaving ? <Save size={16} /> : <BriefcaseBusiness size={16} />}
          {isSaving ? "Saving" : "Save profile"}
        </Button>
        {message ? <p className="text-sm font-semibold text-[var(--text2)]">{message}</p> : null}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  defaultValue,
  type = "text",
  required
}: {
  name: string;
  label: string;
  defaultValue: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3"
      />
    </label>
  );
}

function Select({
  name,
  label,
  defaultValue,
  options
}: {
  name: string;
  label: string;
  defaultValue: string;
  options: Array<[string, string]>;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3"
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
