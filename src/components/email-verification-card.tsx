"use client";

import { MailCheck, Send } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui";

export function EmailVerificationCard({ email }: { email: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function sendVerification() {
    setIsSending(true);
    setMessage(null);

    const response = await fetch("/api/account/email-verification", { method: "POST" });
    const result = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

    setIsSending(false);
    setMessage(result.message || result.error || "Verification email request finished.");
  }

  return (
    <Card className="mt-5 border-amber-200 bg-amber-50">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <MailCheck className="mt-1 shrink-0 text-[var(--amber2)]" size={20} />
          <div>
            <h2 className="text-lg font-black">Verify your email</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--text2)]">
              Your dashboard is open. Verify {email} when you are ready so onboarding and support updates reach the
              right inbox.
            </p>
            {message ? <p className="mt-2 text-sm font-semibold text-[var(--text)]">{message}</p> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={sendVerification}
          disabled={isSending}
          className="focus-ring inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--amber)] px-5 py-3 text-sm font-black text-[var(--ink)] shadow-soft transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={16} />
          {isSending ? "Sending" : "Send verification"}
        </button>
      </div>
    </Card>
  );
}
