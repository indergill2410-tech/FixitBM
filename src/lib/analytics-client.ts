"use client";

// Tiny first-party event tracker. Fire-and-forget: never throws, never blocks.

function sessionId(): string {
  try {
    const key = "fx_sid";
    let value = window.sessionStorage.getItem(key);
    if (!value) {
      value = Math.random().toString(36).slice(2) + Date.now().toString(36);
      window.sessionStorage.setItem(key, value);
    }
    return value;
  } catch {
    return "anon";
  }
}

export function track(event: string, properties: Record<string, unknown> = {}) {
  try {
    const payload = JSON.stringify({
      event,
      path: window.location.pathname,
      sessionId: sessionId(),
      properties
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics", new Blob([payload], { type: "application/json" }));
    } else {
      void fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true
      });
    }
  } catch {
    // Telemetry is best-effort.
  }
}
