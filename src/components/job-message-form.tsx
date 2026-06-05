"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

export function JobMessageForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSending(true);
    setStatus(null);

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, body })
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setIsSending(false);

    if (!response.ok) {
      setStatus(result.error ?? "Message could not be sent.");
      return;
    }

    setBody("");
    setStatus("Message sent.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <textarea
        className="min-h-28 rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--amber)]"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write an update..."
        maxLength={1200}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isSending || body.trim().length < 2} className="min-h-10 px-4">
          <Send size={16} />
          {isSending ? "Sending" : "Send"}
        </Button>
        {status ? <p className="text-sm font-semibold text-[var(--text2)]">{status}</p> : null}
      </div>
    </form>
  );
}
