"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { claimGuestJobAction, type ClaimGuestJobState } from "@/app/dashboard/customer/claim/actions";

const initialState: ClaimGuestJobState = {};

export function ClaimGuestJobForm() {
  const [state, action, pending] = useActionState(claimGuestJobAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-3">
      {state.message ? (
        <div
          className={`rounded-xl border p-3 text-sm font-semibold ${
            state.ok
              ? "border-green-200 bg-[var(--green-light)] text-[var(--green)]"
              : "border-red-200 bg-[var(--red-light)] text-[var(--red)]"
          }`}
        >
          {state.message}
        </div>
      ) : null}
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">Request reference</span>
        <input
          name="reference"
          className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4"
          placeholder="FXT123456"
          required
        />
      </label>
      <label className="grid gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-[var(--text3)]">Phone number used</span>
        <input
          name="phone"
          className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4"
          placeholder="04..."
          required
        />
      </label>
      <Button disabled={pending}>
        {pending ? <Loader2 size={17} className="animate-spin" /> : <CheckCircle2 size={17} />}
        Claim guest request
      </Button>
    </form>
  );
}
