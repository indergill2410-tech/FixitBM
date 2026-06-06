"use client";

import { useActionState } from "react";
import { submitSupportTicketAction, type SupportTicketState } from "@/app/dashboard/support/actions";
import { Button } from "@/components/ui";

const initialState: SupportTicketState = {};

export function SupportTicketForm() {
  const [state, action, pending] = useActionState(submitSupportTicketAction, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white p-5 shadow-[var(--shadow)]">
      {state.message ? (
        <div className={`rounded-xl p-3 text-sm font-bold ${state.ok ? "bg-[var(--green-light)] text-[var(--green)]" : "bg-[var(--red-light)] text-[var(--red)]"}`}>
          {state.message}
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-black text-[var(--text)]">
        Subject
        <input
          name="subject"
          className="min-h-12 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-4 font-medium"
          placeholder="Billing, request, membership, verification, or account help"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-black text-[var(--text)]">
        Message
        <textarea
          name="message"
          className="min-h-36 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-4 font-medium"
          placeholder="Tell us what happened, which request it relates to, and the best next step."
          required
        />
      </label>
      <Button disabled={pending}>{pending ? "Sending..." : "Send support request"}</Button>
    </form>
  );
}
