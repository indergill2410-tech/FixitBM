"use client";

import { CheckCircle2, MapPin, Play, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui";
import type { JobStatus } from "@/lib/jobs";

const actions: Partial<Record<JobStatus, { status: JobStatus; label: string; icon: "accept" | "route" | "start" | "complete" }[]>> = {
  tradie_accepted: [{ status: "en_route", label: "Mark en route", icon: "route" }],
  en_route: [{ status: "on_site", label: "Mark on site", icon: "route" }],
  on_site: [{ status: "work_in_progress", label: "Start work", icon: "start" }],
  quote_provided: [{ status: "work_in_progress", label: "Start approved work", icon: "start" }],
  work_in_progress: [{ status: "completed", label: "Mark completed", icon: "complete" }]
};

const icons = {
  accept: Send,
  route: MapPin,
  start: Play,
  complete: CheckCircle2
};

export function TradieJobActions({ jobId, status }: { jobId: string; status: JobStatus }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<JobStatus | null>(null);
  const availableActions = actions[status] ?? [];

  async function updateStatus(nextStatus: JobStatus) {
    setPendingStatus(nextStatus);
    setMessage(null);

    const response = await fetch("/api/tradie/jobs/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, status: nextStatus })
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setPendingStatus(null);

    if (!response.ok) {
      setMessage(result.error ?? "Status could not be updated.");
      return;
    }

    setMessage("Job status updated.");
    router.refresh();
  }

  if (!availableActions.length) {
    return <p className="text-sm leading-6 text-[var(--text2)]">No tradie action is needed at this status.</p>;
  }

  return (
    <div className="mt-4 grid gap-3">
      {availableActions.map((action) => {
        const Icon = icons[action.icon];
        return (
          <Button key={action.status} disabled={pendingStatus === action.status} onClick={() => updateStatus(action.status)}>
            <Icon size={16} />
            {pendingStatus === action.status ? "Updating" : action.label}
          </Button>
        );
      })}
      {message ? <p className="text-sm font-semibold text-[var(--text2)]">{message}</p> : null}
    </div>
  );
}
