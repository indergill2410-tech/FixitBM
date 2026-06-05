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
  required
}: {
  name: string;
  label: string;
  defaultValue: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3"
      />
    </label>
  );
}
