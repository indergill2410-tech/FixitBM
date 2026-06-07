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
    <form action={action} className="mt-6 grid gap-3">
      <FormMessage message={state.message} />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="firstName" label="First name" />
        <Input name="lastName" label="Last name" />
      </div>
      <Input name="businessName" label="Business name" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="phone" label="Phone" />
        <Input name="email" label="Email" type="email" />
      </div>
      <Input name="password" label="Password" type="password" />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="abn" label="ABN optional" />
        <Input name="licenceNumber" label="Licence number optional" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="tradeCategory" label="Trade category" />
        <Input name="serviceArea" label="Service area" />
      </div>
      <label className="flex gap-3 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm text-[var(--text2)]">
        <input name="emergencyAvailable" type="checkbox" />
        Available for emergency requests
      </label>
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <BriefcaseBusiness size={17} />}
        Create Fixer account
      </Button>
    </form>
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

function Input({ name, label, type = "text" }: { name: string; label: string; type?: string }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">{label}</span>
      <input
        name={name}
        type={type}
        required={!label.includes("optional")}
        className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4"
      />
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
