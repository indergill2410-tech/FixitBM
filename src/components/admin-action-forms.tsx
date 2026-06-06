"use client";

import { useActionState } from "react";
import {
  assignSafetyCheckFixerAction,
  assignTradieAction,
  refundLeadCreditsAction,
  reviewVerificationAction,
  updateSafetyCheckStatusAction,
  updateJobStatusAction,
  type AdminActionState
} from "@/app/admin/actions";
import { Button } from "@/components/ui";
import type { AdminAssignableTradie } from "@/lib/jobs";

const initialState: AdminActionState = {};

const statuses = [
  "received",
  "matching",
  "tradie_accepted",
  "en_route",
  "on_site",
  "quote_provided",
  "work_in_progress",
  "completed",
  "reviewed",
  "closed",
  "cancelled",
  "disputed"
];

const safetyCheckStatuses = ["due", "booked", "assigned", "completed", "cancelled", "overdue"];

export function JobStatusForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(updateJobStatusAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <FormMessage state={state} />
      <input type="hidden" name="jobId" value={jobId} />
      <select name="status" className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white">
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="note"
        className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white"
        placeholder="Admin note optional"
      />
      <Button disabled={pending}>Update status</Button>
    </form>
  );
}

export function AssignTradieForm({ jobId, tradies = [] }: { jobId: string; tradies?: AdminAssignableTradie[] }) {
  const [state, action, pending] = useActionState(assignTradieAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <FormMessage state={state} />
      <input type="hidden" name="jobId" value={jobId} />
      {tradies.length ? (
        <select name="tradieId" className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" required>
          <option value="">Choose Fixer</option>
          {tradies.map((tradie) => (
            <option key={tradie.id} value={tradie.id}>
              {tradie.business_name || tradie.trade_category} - {tradie.trade_category}
              {tradie.service_area ? ` - ${tradie.service_area}` : ""}
            </option>
          ))}
        </select>
      ) : (
        <input
          name="tradieId"
          className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white"
          placeholder="Fixer profile UUID"
          required
        />
      )}
      <Button disabled={pending}>Assign Fixer</Button>
    </form>
  );
}

export function VerificationDecisionForm({ documentId }: { documentId?: string }) {
  const [state, action, pending] = useActionState(reviewVerificationAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <FormMessage state={state} />
      {documentId ? (
        <input type="hidden" name="documentId" value={documentId} />
      ) : (
        <input
          name="documentId"
          className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white"
          placeholder="Verification document UUID"
          required
        />
      )}
      <select name="status" className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white">
        <option value="approved">Approve</option>
        <option value="rejected">Reject</option>
      </select>
      <input
        name="notes"
        className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white"
        placeholder="Review notes"
      />
      <Button disabled={pending}>Save decision</Button>
    </form>
  );
}

export function RefundLeadCreditsForm() {
  const [state, action, pending] = useActionState(refundLeadCreditsAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <FormMessage state={state} />
      <input
        name="leadClaimId"
        className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white"
        placeholder="Lead claim UUID"
        required
      />
      <input
        name="reason"
        className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white"
        placeholder="Refund reason"
        required
      />
      <Button disabled={pending}>Refund credits</Button>
    </form>
  );
}

export function SafetyCheckStatusForm({ safetyCheckId, currentStatus }: { safetyCheckId: string; currentStatus: string }) {
  const [state, action, pending] = useActionState(updateSafetyCheckStatusAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <FormMessage state={state} />
      <input type="hidden" name="safetyCheckId" value={safetyCheckId} />
      <select name="status" defaultValue={currentStatus} className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white">
        {safetyCheckStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="note"
        className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white"
        placeholder="Status note optional"
      />
      <Button disabled={pending}>Update Safety Check</Button>
    </form>
  );
}

export function AssignSafetyCheckFixerForm({ safetyCheckId, tradies = [] }: { safetyCheckId: string; tradies?: AdminAssignableTradie[] }) {
  const [state, action, pending] = useActionState(assignSafetyCheckFixerAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <FormMessage state={state} />
      <input type="hidden" name="safetyCheckId" value={safetyCheckId} />
      <select name="fixerId" className="min-h-11 rounded-lg border border-white/10 bg-[#201915] px-3 text-white" required>
        <option value="">Choose Fixer</option>
        {tradies.map((tradie) => (
          <option key={tradie.id} value={tradie.id}>
            {tradie.business_name || tradie.trade_category} - {tradie.trade_category}
            {tradie.service_area ? ` - ${tradie.service_area}` : ""}
          </option>
        ))}
      </select>
      <Button disabled={pending}>Assign Safety Check</Button>
    </form>
  );
}

function FormMessage({ state }: { state: AdminActionState }) {
  if (!state.message) return null;

  return (
    <div className={`rounded-lg p-3 text-sm font-semibold ${state.ok ? "bg-green-500/15 text-green-200" : "bg-red-500/15 text-red-200"}`}>
      {state.message}
    </div>
  );
}
