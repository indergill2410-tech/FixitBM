"use client";

import { useActionState } from "react";
import { Building2, Loader2 } from "lucide-react";
import {
  requestPropertySafeWalkthroughAction,
  type PropertySafeOnboardingState
} from "@/app/propertysafe/onboarding/actions";
import { Button } from "@/components/ui";

const initialState: PropertySafeOnboardingState = {};

const roleOptions = [
  ["principal", "Agency principal"],
  ["property_manager", "Property manager"],
  ["landlord", "Landlord"],
  ["owner", "Property owner"],
  ["operations", "Operations team"],
  ["other", "Other"]
];

const portfolioOptions = ["1-10", "11-50", "51-150", "151-500", "500+"];

const priorityOptions = [
  ["tenant_maintenance", "Tenant maintenance clarity"],
  ["owner_visibility", "Owner visibility"],
  ["safety_checks", "Safety Check history"],
  ["repair_history", "Repair records"],
  ["portfolio_growth", "Better portfolio operations"]
];

export function PropertySafeOnboardingForm() {
  const [state, action, pending] = useActionState(requestPropertySafeWalkthroughAction, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-lg)]">
      {state.message ? (
        <div
          className={`rounded-xl p-3 text-sm font-black ${
            state.ok ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"
          }`}
        >
          {state.message}
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="name" label="Your name" autoComplete="name" />
        <Field name="agencyName" label="Agency or portfolio name" autoComplete="organization" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Field name="email" label="Work email" type="email" autoComplete="email" />
        <Field name="phone" label="Best phone" type="tel" autoComplete="tel" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Select name="role" label="I am" options={roleOptions} />
        <Select name="portfolioSize" label="Managed properties" options={portfolioOptions.map((value) => [value, value])} />
      </div>
      <Select name="priority" label="Most useful first" options={priorityOptions} />
      <Field name="suburb" label="Primary suburb or service area" required={false} />
      <label className="grid gap-2 text-sm font-black text-[var(--text)]">
        What should we prepare for?
        <textarea
          name="message"
          className="focus-ring min-h-28 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 font-medium"
          placeholder="Example: We manage 80 rentals and need clearer owner updates after urgent tenant maintenance."
        />
      </label>
      <label className="flex gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 text-sm font-semibold text-[var(--text2)]">
        <input name="consent" type="checkbox" required />
        Fixit247 can contact me about PropertySafe onboarding and agency account setup.
      </label>
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <Building2 size={17} />}
        Request agency walkthrough
      </Button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  required = true
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--text)]">
      {label}
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 font-medium"
      />
    </label>
  );
}

function Select({ name, label, options }: { name: string; label: string; options: string[][] }) {
  return (
    <label className="grid gap-2 text-sm font-black text-[var(--text)]">
      {label}
      <select name={name} required className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 font-medium">
        {options.map(([value, optionLabel]) => (
          <option key={value} value={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
