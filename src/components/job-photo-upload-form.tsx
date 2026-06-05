"use client";

import { ImagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

export function JobPhotoUploadForm({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("jobId", jobId);
    setStatus(null);
    setIsUploading(true);

    const response = await fetch("/api/uploads/job-photo", {
      method: "POST",
      body: formData
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setIsUploading(false);

    if (!response.ok) {
      setStatus(result.error ?? "Photo could not be uploaded.");
      return;
    }

    form.reset();
    setStatus("Photo uploaded.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 grid gap-3">
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="rounded-xl border border-dashed border-[var(--border)] bg-white p-3 text-sm"
        required
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isUploading} className="min-h-10 px-4">
          <ImagePlus size={16} />
          {isUploading ? "Uploading" : "Add photo"}
        </Button>
        {status ? <p className="text-sm font-semibold text-[var(--text2)]">{status}</p> : null}
      </div>
    </form>
  );
}
