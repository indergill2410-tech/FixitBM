"use client";

import { useActionState } from "react";
import { AlertCircle, BriefcaseBusiness, Home, Loader2 } from "lucide-react";
import type { AuthActionState } from "@/app/auth/actions";
import { registerCustomerAction, registerTradieAction, signInAction } from "@/app/auth/actions";
import { Button } from "@/components/ui";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, action, pending] = useActionState(signInAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-3">
      <FormMessage message={state.message} />
      <Input name="email" label="Email" type="email" />
      <Input name="password" label="Password" type="password" />
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : null}
        Continue
      </Button>
      <Button href="/post-job" variant="ghost">
        Start a request without logging in
      </Button>
    </form>
  );
}

export function CustomerRegisterForm() {
  const [state, action, pending] = useActionState(registerCustomerAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-3">
      <FormMessage message={state.message} />
      <div className="grid gap-3 md:grid-cols-2">
        <Input name="firstName" label="First name" />
        <Input name="lastName" label="Last name" />
      </div>
      <Input name="phone" label="Phone" />
      <Input name="email" label="Email" type="email" />
      <Input name="password" label="Password" type="password" />
      <Button disabled={pending}>
        {pending ? <Loader2 className="animate-spin" size={17} /> : <Home size={17} />}
        Create customer account
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
