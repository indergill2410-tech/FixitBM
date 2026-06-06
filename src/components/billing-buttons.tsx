"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui";

export function CheckoutButton({
  planCode,
  label,
  variant = "primary"
}: {
  planCode: string;
  label: string;
  variant?: "primary" | "ghost" | "dark";
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planCode })
    });
    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    setMessage(data.message ?? data.error ?? "Checkout is temporarily unavailable.");
    setLoading(false);
  }

  return (
    <div className="grid gap-2">
      <Button onClick={startCheckout} disabled={loading} variant={variant}>
        {loading ? <Loader2 size={17} className="animate-spin" /> : null}
        {label}
      </Button>
      {message ? <p className="text-xs font-semibold text-[var(--amber2)]">{message}</p> : null}
    </div>
  );
}

export function PortalButton() {
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    setMessage(null);

    const response = await fetch("/api/billing/portal", { method: "POST" });
    const data = await response.json();

    if (data.url) {
      window.location.href = data.url;
      return;
    }

    setMessage(data.message ?? data.error ?? "Billing management is temporarily unavailable.");
    setLoading(false);
  }

  return (
    <div className="grid gap-2">
      <Button onClick={openPortal} disabled={loading} variant="ghost">
        {loading ? <Loader2 size={17} className="animate-spin" /> : null}
        Manage billing
      </Button>
      {message ? <p className="text-xs font-semibold text-[var(--amber2)]">{message}</p> : null}
    </div>
  );
}
