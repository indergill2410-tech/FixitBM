"use client";

import { Home, Plus, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

export function SavedPropertyForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/customer/properties", {
      method: "POST",
      body: new FormData(form)
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setIsSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Property could not be saved.");
      return;
    }

    form.reset();
    setMessage("Property saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="label" label="Label" placeholder="Home" />
      <Field name="address" label="Address" placeholder="12 King Street" required />
      <div className="grid gap-3 md:grid-cols-3">
        <Field name="suburb" label="Suburb" />
        <Field name="postcode" label="Postcode" />
        <Field name="state" label="State" defaultValue="NSW" />
      </div>
      <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--text2)]">
        <input name="isDefault" type="checkbox" />
        Use as default property
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isSaving}>
          {isSaving ? <Plus size={16} /> : <Home size={16} />}
          {isSaving ? "Saving" : "Save property"}
        </Button>
        {message ? <p className="text-sm font-semibold text-[var(--text2)]">{message}</p> : null}
      </div>
    </form>
  );
}

export function SavedVehicleForm() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSaving(true);
    setMessage(null);

    const response = await fetch("/api/customer/vehicles", {
      method: "POST",
      body: new FormData(form)
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setIsSaving(false);

    if (!response.ok) {
      setMessage(result.error ?? "Vehicle could not be saved.");
      return;
    }

    form.reset();
    setMessage("Vehicle saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <Field name="label" label="Label" placeholder="Family car" />
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="make" label="Make" required />
        <Field name="model" label="Model" required />
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Field name="year" label="Year" type="number" />
        <Field name="registration" label="Registration" />
        <Field name="fuelType" label="Fuel type" placeholder="petrol" />
      </div>
      <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-white p-3 text-sm text-[var(--text2)]">
        <input name="isDefault" type="checkbox" />
        Use as default vehicle
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isSaving}>
          <Car size={16} />
          {isSaving ? "Saving" : "Save vehicle"}
        </Button>
        {message ? <p className="text-sm font-semibold text-[var(--text2)]">{message}</p> : null}
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  placeholder,
  required,
  defaultValue,
  type = "text"
}: {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        className="focus-ring min-h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3"
      />
    </label>
  );
}
