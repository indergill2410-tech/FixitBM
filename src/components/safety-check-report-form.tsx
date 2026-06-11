"use client";

import { useActionState, useState, type FormEvent } from "react";
import { Camera, CheckCircle2 } from "lucide-react";
import { submitSafetyCheckReportAction, type SafetyCheckReportState } from "@/app/dashboard/tradie/safety-checks/actions";
import { Button } from "@/components/ui";
import {
  getCategoriesForCheck,
  inspectionItemStatuses,
  type InspectionCategoryTemplate
} from "@/lib/inspection-templates";

const initialState: SafetyCheckReportState = {};

const legacyStatuses = [
  { value: "ok", label: "OK" },
  { value: "attention", label: "Needs attention" },
  { value: "recommended", label: "Recommended fix" },
  { value: "not_checked", label: "Not checked" }
];

const priorities = ["low", "medium", "high", "urgent"];

function statusesForCategory(category: InspectionCategoryTemplate) {
  return category.key === "general_readiness" ? legacyStatuses : inspectionItemStatuses;
}

function defaultStatusFor(category: InspectionCategoryTemplate) {
  return category.key === "general_readiness" ? "ok" : "pass";
}

function ItemPhotoButton({ safetyCheckId, categoryKey, caption }: { safetyCheckId: string; categoryKey: string; caption: string }) {
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const inputId = `photo-${categoryKey}-${caption}`.replace(/[^a-zA-Z0-9_-]/g, "-");

  async function onChange(event: FormEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.set("safetyCheckId", safetyCheckId);
    formData.set("categoryKey", categoryKey);
    formData.set("caption", caption);
    formData.set("file", file);
    setBusy(true);
    const response = await fetch("/api/uploads/safety-check-photo", { method: "POST", body: formData });
    setBusy(false);
    input.value = "";
    if (response.ok) setCount((value) => value + 1);
  }

  return (
    <label
      htmlFor={inputId}
      className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--border)] bg-white px-2.5 py-2 text-xs font-bold text-[var(--text2)] hover:border-amber-300"
    >
      <Camera size={14} />
      {busy ? "Uploading…" : count ? `${count} photo${count > 1 ? "s" : ""}` : "Photo"}
      <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} />
    </label>
  );
}

export function SafetyCheckReportForm({
  safetyCheckId,
  checkType = "home",
  requestedCategories = []
}: {
  safetyCheckId: string;
  checkType?: string;
  requestedCategories?: string[];
}) {
  const [state, action, pending] = useActionState(submitSafetyCheckReportAction, initialState);
  const categories = getCategoriesForCheck(checkType, requestedCategories);
  const isCompliance = categories.some((category) => category.key !== "general_readiness");

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      {state.message ? (
        <div className={`rounded-lg p-3 text-sm font-semibold ${state.ok ? "bg-green-500/15 text-[var(--green)]" : "bg-red-500/15 text-[var(--red)]"}`}>
          {state.message}
        </div>
      ) : null}
      <input type="hidden" name="safetyCheckId" value={safetyCheckId} />

      {isCompliance ? (
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
            Inspector name
            <input name="inspectorName" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Full name of attending inspector" />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
            Licence number
            <input name="inspectorLicenceNo" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Required for gas / electrical" />
          </label>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
          Score before <span className="font-normal text-[var(--text3)]">(optional)</span>
          <input name="scoreBefore" type="number" min="0" max="100" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]" />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
          Score after <span className="font-normal text-[var(--text3)]">(optional)</span>
          <input name="scoreAfter" type="number" min="0" max="100" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
        Report summary
        <textarea
          name="summary"
          className="min-h-28 rounded-lg border border-[var(--border)] bg-white p-3 text-[var(--text)] placeholder:text-[var(--text3)]"
          placeholder="Summarise the findings, any defects, and recommended rectification."
          required
        />
      </label>

      {categories.map((category, categoryIndex) => {
        const statuses = statusesForCategory(category);
        const defaultStatus = defaultStatusFor(category);
        return (
          <details
            key={category.key}
            open={categoryIndex === 0 || categories.length === 1}
            className="group rounded-xl border border-[var(--border)] bg-white"
          >
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-black text-[var(--text)]">{category.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--text3)]">
                  {category.frequencyLabel} · {category.items.length} items
                </p>
                {category.requiresLicence ? (
                  <p className="mt-1 text-xs font-bold text-[var(--amber2)]">Requires a {category.licenceTrade}.</p>
                ) : null}
              </div>
              <span className="shrink-0 text-xs font-black text-[var(--text3)] group-open:hidden">Open</span>
              <span className="hidden shrink-0 text-xs font-black text-[var(--text3)] group-open:inline">Close</span>
            </summary>
            <div className="grid gap-3 px-4 pb-4">
            <p className="text-xs leading-5 text-[var(--text3)]">{category.regulatoryNote}</p>
            {category.items.map((item) => (
              <div key={item.key} className="grid gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-3">
                <input type="hidden" name="itemCategory" value={category.key} />
                <input type="hidden" name="itemCategoryLabel" value={category.label} />
                <input type="hidden" name="itemLabel" value={item.label} />
                <input type="hidden" name="itemCritical" value={item.critical ? "1" : "0"} />
                <p className="text-sm font-semibold text-[var(--text2)]">
                  {item.label}
                  {item.critical ? <span className="ml-2 rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-black uppercase text-[var(--red)]">Critical</span> : null}
                </p>
                <div className="grid gap-2 sm:grid-cols-[150px_1fr_auto] sm:items-center">
                  <select name="itemStatus" defaultValue={defaultStatus} className="min-h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--text)]">
                    {statuses.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                  <input name="itemNotes" className="min-h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Notes (optional)" />
                  <ItemPhotoButton safetyCheckId={safetyCheckId} categoryKey={category.key} caption={item.label} />
                </div>
              </div>
            ))}
            </div>
          </details>
        );
      })}

      <div className="grid gap-3">
        <p className="text-sm font-black text-[var(--text)]">Recommended rectification / follow-up work</p>
        {[0, 1, 2].map((index) => (
          <div key={index} className="grid gap-2 rounded-xl border border-[var(--border)] bg-white p-3">
            <input name="recommendationTitle" className="min-h-10 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Recommended fix title" />
            <div className="grid gap-2 md:grid-cols-3">
              <input name="recommendationCategory" className="min-h-10 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Category" />
              <input name="recommendationTradeType" className="min-h-10 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Trade type" />
              <select name="recommendationPriority" className="min-h-10 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 text-[var(--text)]">
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <textarea name="recommendationDescription" className="min-h-20 rounded-lg border border-[var(--border)] bg-[var(--bg2)] p-3 text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Why this is recommended" />
          </div>
        ))}
      </div>

      <p className="flex items-start gap-2 text-xs leading-5 text-[var(--text3)]">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-[var(--green)]" />
        {isCompliance
          ? "Publishing issues a compliance certificate and updates the PropertySafe record. Critical failures set the result to non-compliant."
          : "Publishing updates the member's readiness report and PropertySafe record."}
      </p>
      <div className="safe-bottom sticky bottom-0 -mx-4 -mb-4 border-t border-[var(--border)] bg-[var(--bg2)] px-4 pt-3">
        <Button disabled={pending} className="w-full">
          {pending ? "Publishing…" : isCompliance ? "Publish compliance report & certificate" : "Publish Safety Check report"}
        </Button>
      </div>
    </form>
  );
}
