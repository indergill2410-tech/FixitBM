"use client";

import { useActionState } from "react";
import { AlertCircle, BriefcaseBusiness, Building2, Home, Loader2 } from "lucide-react";
import type { AuthActionState } from "@/app/auth/actions";
import { registerAgencyAction, registerCustomerAction, registerTradieAction, signInAction } from "@/app/auth/actions";
import { Button } from "@/components/ui";

const initialState: AuthActionState = {};

export function LoginForm({
  redirectTo,
  secondaryAction = "request"
}: {
  redirectTo?: string;
  secondaryAction?: "request" | "agency";
}) {
  const [state, action, pending] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-3">
      <FormMessage message={state.message} />
      {redirectTo ? <input type="hidden" name="redirectTo" value={redirectTo} /> : null}
      <Input name="email" label="Email" type="email" />
      <Input name="password" label="Password" type="password" />
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : null}
        Continue
      </Button>
      {secondaryAction === "agency" ? (
        <Button href="/agency/register" variant="ghost">
          Create agency account
        </Button>
      ) : (
        <Button href="/post-job" variant="ghost">
          Start a request without logging in
        </Button>
      )}
    </form>
  );
}

export function CustomerRegisterForm({ intent }: { intent?: string }) {
  const [state, action, pending] = useActionState(registerCustomerAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-3">
      <FormMessage message={state.message} />
      {intent ? <input type="hidden" name="intent" value={intent} /> : null}
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="firstName" label="First name" />
        <Input name="lastName" label="Last name" />
      </div>
      <Input name="phone" label="Phone" />
      <Input name="email" label="Email" type="email" />
      <Input name="password" label="Password" type="password" />
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <Home size={17} />}
        {intent === "agency" ? "Create agency account" : "Create customer account"}
      </Button>
    </form>
  );
}

export function AgencyRegisterForm() {
  const [state, action, pending] = useActionState(registerAgencyAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-3">
      <FormMessage message={state.message} />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="firstName" label="First name" />
        <Input name="lastName" label="Last name" />
      </div>
      <Input name="agencyName" label="Agency or portfolio name" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="phone" label="Phone" />
        <Input name="email" label="Work email" type="email" />
      </div>
      <Input name="password" label="Password" type="password" />
      <div className="grid gap-3 md:grid-cols-2">
        <Select
          name="contactRole"
          label="Your role"
          options={[
            ["principal", "Principal"],
            ["property_manager", "Property manager"],
            ["operations", "Operations"],
            ["owner", "Owner"],
            ["landlord", "Landlord"],
            ["other", "Other"]
          ]}
        />
        <Select
          name="portfolioSize"
          label="Managed properties"
          options={[
            ["1-10", "1-10"],
            ["11-50", "11-50"],
            ["51-150", "51-150"],
            ["151-500", "151-500"],
            ["500+", "500+"]
          ]}
        />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="serviceArea" label="Service area" />
        <Input name="abn" label="ABN optional" />
      </div>
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <Building2 size={17} />}
        Create agency account
      </Button>
    </form>
  );
}

export function TradieRegisterForm() {
  const [state, action, pending] = useActionState(registerTradieAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-5">
      <FormMessage message={state.message} />
      <FormSection title="Account contact">
        <div className="grid gap-3 md:grid-cols-2">
          <Input name="firstName" label="First name" />
          <Input name="lastName" label="Last name" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <Input name="phone" label="Phone" />
          <Input name="email" label="Email" type="email" />
        </div>
        <Input name="password" label="Password" type="password" />
      </FormSection>

      <FormSection title="Business details">
        <Input name="businessName" label="Business name" />
        <div className="grid gap-3 md:grid-cols-2">
          <Input name="abn" label="ABN optional" />
          <Input name="licenceNumber" label="Licence number optional" />
        </div>
      </FormSection>

      <FormSection title="Trade and coverage">
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            name="tradeCategory"
            label="Trade category"
            options={[
              ["Plumbing", "Plumbing"],
              ["Electrical", "Electrical"],
              ["Locksmith", "Locksmith"],
              ["Handyman", "Handyman"],
              ["Painting", "Painting"],
              ["Carpentry", "Carpentry"],
              ["Roof and gutter repairs", "Roof and gutter repairs"],
              ["Heating and cooling", "Heating and cooling"],
              ["Gardening and landscaping", "Gardening and landscaping"],
              ["Cleaning and end-of-lease repairs", "Cleaning and end-of-lease repairs"],
              ["General property maintenance", "General property maintenance"]
            ]}
          />
          <Input name="serviceArea" label="Service area" helper="Suburbs, regions, or postcodes you service" />
        </div>
      </FormSection>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-4">
        <label className="flex gap-3 text-sm text-[var(--text2)]">
          <input name="emergencyAvailable" type="checkbox" className="mt-1" />
          <span>
            <strong className="block text-[var(--text)]">Available for emergency requests</strong>
            Let Fixit 247 know if you can support urgent or after-hours repair demand.
          </span>
        </label>
      </div>

      <div>
        <Button disabled={pending} className="min-h-12 w-full md:w-auto">
          {pending ? <Loader2 className="animate-spin" size={17} /> : <BriefcaseBusiness size={17} />}
          Create Your Fixer Account
        </Button>
        <p className="mt-3 text-xs font-semibold leading-5 text-[var(--text3)]">
          After signup, you&apos;ll go straight to your Fixer dashboard to complete insurance, service preferences, and
          verification details.
        </p>
      </div>
    </form>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-1 text-sm font-black text-[var(--text)]">{title}</legend>
      {children}
    </fieldset>
  );
}

function Select({
  name,
  label,
  options
}: {
  name: string;
  label: string;
  options: Array<[string, string]>;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <select
        name={name}
        required
        className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4"
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

function Input({
  name,
  label,
  type = "text",
  helper
}: {
  name: string;
  label: string;
  type?: string;
  helper?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <input
        name={name}
        type={type}
        required={!label.includes("optional")}
        className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4"
      />
      {helper ? <span className="text-xs font-semibold text-[var(--text3)]">{helper}</span> : null}
    </label>
  );
}

function FormMessage({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="flex gap-2 rounded-xl border border-red-200 bg-[var(--red-light)] p-3 text-sm font-semibold text-[var(--red)]">
      <AlertCircle size={17} />
      {message}
    </div>
  );
}
