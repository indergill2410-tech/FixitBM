"use client";

import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

export function JobReviewForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSending(true);

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, rating: Number(rating), comment })
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setIsSending(false);

    if (!response.ok) {
      setStatus(result.error ?? "Review could not be saved.");
      return;
    }

    setComment("");
    setStatus("Review saved.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <select value={rating} onChange={(event) => setRating(event.target.value)} className="rounded-xl border border-[var(--border)] bg-white p-3 text-sm font-semibold">
        {[5, 4, 3, 2, 1].map((value) => (
          <option key={value} value={value}>
            {value} star{value === 1 ? "" : "s"}
          </option>
        ))}
      </select>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        className="min-h-24 rounded-xl border border-[var(--border)] bg-white p-3 text-sm outline-none focus:border-[var(--amber)]"
        placeholder="How did the job go?"
        maxLength={800}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isSending} className="min-h-10 px-4">
          <Star size={16} />
          {isSending ? "Saving" : "Save review"}
        </Button>
        {status ? <p className="text-sm font-semibold text-[var(--text2)]">{status}</p> : null}
      </div>
    </form>
  );
}
