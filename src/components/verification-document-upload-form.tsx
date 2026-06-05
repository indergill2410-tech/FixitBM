"use client";

import { FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui";

const documentTypes = [
  ["licence", "Trade licence"],
  ["insurance", "Insurance"],
  ["abn", "ABN"],
  ["id", "Identity"],
  ["police_check", "Police check"]
];

export function VerificationDocumentUploadForm() {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setStatus(null);
    setIsUploading(true);

    const response = await fetch("/api/uploads/verification-document", {
      method: "POST",
      body: formData
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };

    setIsUploading(false);

    if (!response.ok) {
      setStatus(result.error ?? "Document could not be uploaded.");
      return;
    }

    form.reset();
    setStatus("Document uploaded for review.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-5 grid gap-3">
      <select name="documentType" className="rounded-xl border border-[var(--border)] bg-white p-3 text-sm font-semibold" defaultValue="licence">
        {documentTypes.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        name="file"
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        className="rounded-xl border border-dashed border-[var(--border)] bg-white p-3 text-sm"
        required
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={isUploading} className="min-h-10 px-4">
          <FileUp size={16} />
          {isUploading ? "Uploading" : "Upload document"}
        </Button>
        {status ? <p className="text-sm font-semibold text-[var(--text2)]">{status}</p> : null}
      </div>
    </form>
  );
}
