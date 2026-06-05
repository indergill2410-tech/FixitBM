"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui";

export function NewsletterForm({ source = "site" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source })
    });
    const data = await response.json();

    setMessage(data.message ?? data.error ?? "Thanks. You're on the list.");
    if (response.ok) setEmail("");
    setLoading(false);
  }

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text3)]" size={18} />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            type="email"
            className="focus-ring min-h-12 w-full rounded-xl border border-[var(--border)] bg-white pl-11 pr-4"
          />
        </label>
        <Button onClick={subscribe} disabled={loading || !email.includes("@")} className="sm:min-w-36">
          {loading ? <Loader2 className="animate-spin" size={17} /> : null}
          Join
        </Button>
      </div>
      {message ? <p className="text-sm font-semibold text-[var(--amber2)]">{message}</p> : null}
    </div>
  );
}
