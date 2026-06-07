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
    <form action={action} className="grid gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
      {state.message ? (
        <div className={`rounded-lg p-3 text-sm font-semibold ${state.ok ? "bg-green-500/15 text-green-200" : "bg-red-500/15 text-red-200"}`}>
          {state.message}
        </div>
      ) : null}
      <input type="hidden" name="safetyCheckId" value={safetyCheckId} />
      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-bold">
          Score before
          <input name="scoreBefore" type="number" min="0" max="100" className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" required />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Score after
          <input name="scoreAfter" type="number" min="0" max="100" className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" required />
        </label>
      </div>
      <label className="grid gap-2 text-sm font-bold">
        Report summary
        <textarea
          name="summary"
          className="min-h-28 rounded-lg border border-white/10 bg-[#201915] p-3 text-white"
          placeholder="Summarise visible concerns, readiness improvements, and practical next steps."
          required
        />
      </label>
      <div className="grid gap-3">
        <p className="text-sm font-black">Checklist</p>
        {checklist.map((item) => (
          <div key={item} className="grid gap-2 rounded-xl bg-white/5 p-3 md:grid-cols-[1fr_170px_1fr]">
            <input type="hidden" name="itemLabel" value={item} />
            <input type="hidden" name="itemCategory" value="Readiness" />
            <p className="text-sm font-semibold text-white/80">{item}</p>
            <select name="itemStatus" className="min-h-10 rounded-lg border border-white/10 bg-[#201915] px-3 text-white">
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <input name="itemNotes" className="min-h-10 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" placeholder="Notes optional" />
          </div>
        ))}
      </div>
      <div className="grid gap-3">
        <p className="text-sm font-black">Recommended fixes</p>
        {[0, 1, 2].map((index) => (
          <div key={index} className="grid gap-2 rounded-xl bg-white/5 p-3">
            <input name="recommendationTitle" className="min-h-10 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" placeholder="Recommended fix title" />
            <div className="grid gap-2 md:grid-cols-3">
              <input name="recommendationCategory" className="min-h-10 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" placeholder="Category" />
              <input name="recommendationTradeType" className="min-h-10 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" placeholder="Trade type" />
              <select name="recommendationPriority" className="min-h-10 rounded-lg border border-white/10 bg-[#201915] px-3 text-white">
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            <textarea name="recommendationDescription" className="min-h-20 rounded-lg border border-white/10 bg-[#201915] p-3 text-white" placeholder="Why this is recommended" />
          </div>
        ))}
      </div>
      <Button disabled={pending}>{pending ? "Publishing..." : "Publish Safety Check Report"}</Button>
    </form>
  );
}
