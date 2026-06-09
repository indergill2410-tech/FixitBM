"use client";

import { useActionState } from "react";
import { submitSafetyCheckReportAction, type SafetyCheckReportState } from "@/app/dashboard/tradie/safety-checks/actions";
import { Button } from "@/components/ui";

const initialState: SafetyCheckReportState = {};
const checklist = [
  "Water shutoff and visible leak readiness",
  "Electrical visible concern awareness",
  "Fire and smoke alarm reminders",
  "Lockout and access readiness",
  "Roof, gutter, and storm readiness",
  "Appliance, hot water, and HVAC visual concerns",
  "Home profile completion",
  "Vehicle readiness for Complete members"
];
const statuses = [
  ["ok", "OK"],
  ["attention", "Needs attention"],
  ["recommended", "Recommended fix"],
  ["not_checked", "Not checked"]
];
const priorities = ["low", "medium", "high", "urgent"];

export function SafetyCheckReportForm({ safetyCheckId }: { safetyCheckId: string }) {
  const [state, action, pending] = useActionState(submitSafetyCheckReportAction, initialState);

  return (
    <form action={action} className="grid gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      {state.message ? (
        <div className={`rounded-lg p-3 text-sm font-semibold ${state.ok ? "bg-green-500/15 text-[var(--green)]" : "bg-red-500/15 text-[var(--red)]"}`}>
          {state.message}
        </div>
      ) : null}
      <input type="hidden" name="safetyCheckId" value={safetyCheckId} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
          Score before
          <input name="scoreBefore" type="number" min="0" max="100" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)] placeholder:text-[var(--text3)]" required />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
          Score after
          <input name="scoreAfter" type="number" min="0" max="100" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)] placeholder:text-[var(--text3)]" required />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold text-[var(--text)]">
        Report summary
        <textarea
          name="summary"
          className="min-h-28 rounded-lg border border-[var(--border)] bg-white p-3 text-[var(--text)] placeholder:text-[var(--text3)]"
          placeholder="Summarise visible concerns, readiness improvements, and practical next steps."
          required
        />
      </label>
      <div className="grid gap-3">
        <p className="text-sm font-black text-[var(--text)]">Checklist</p>
        {checklist.map((item) => (
          <div key={item} className="grid gap-2 rounded-xl border border-[var(--border)] bg-white p-3 md:grid-cols-[1fr_170px_1fr]">
            <input type="hidden" name="itemLabel" value={item} />
            <input type="hidden" name="itemCategory" value="Readiness" />
            <p className="text-sm font-semibold text-[var(--text2)]">{item}</p>
            <select name="itemStatus" className="min-h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input name="itemNotes" className="min-h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)] placeholder:text-[var(--text3)]" placeholder="Notes optional" />
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        <p className="text-sm font-black text-[var(--text)]">Recommended fixes</p>
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
      <Button disabled={pending}>{pending ? "Publishing..." : "Publish Safety Check Report"}</Button>
    </form>
  );
}
