"use client";

import { useActionState } from "react";
import {
  assignSafetyCheckFixerAction,
  assignTradieAction,
  invitePropertySafeParticipantAction,
  refundLeadCreditsAction,
  reviewVerificationAction,
  updateDisputeStatusAction,
  updateSafetyCheckStatusAction,
  updateMembershipStatusAction,
  updateSupportTicketStatusAction,
  updateJobStatusAction,
  type AdminActionState
} from "@/app/admin/actions";
import { Button } from "@/components/ui";
import type { AdminAssignableTradie, AdminSuggestedFixer } from "@/lib/jobs";

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
const supportStatuses = ["open", "waiting", "resolved", "closed"];
const disputeStatuses = ["open", "under_review", "resolved_customer", "resolved_tradie", "closed"];
const membershipStatuses = ["active", "pending_activation", "inactive", "cancelled"];
const propertySafeRelationships = ["owner", "landlord", "agency_manager", "property_manager", "tenant_viewer", "viewer"];

export function JobStatusForm({ jobId }: { jobId: string }) {
  const [state, action, pending] = useActionState(updateJobStatusAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="jobId" value={jobId} />
      <select name="status" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
        {statuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="note"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Admin note optional"
      />
      <Button disabled={pending}>Update status</Button>
    </form>
  );
}

export function AssignTradieForm({
  jobId,
  tradies = []
}: {
  jobId: string;
  tradies?: (AdminAssignableTradie | AdminSuggestedFixer)[];
}) {
  const [state, action, pending] = useActionState(assignTradieAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="jobId" value={jobId} />
      {tradies.length ? (
        <select name="tradieId" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]" required>
          <option value="">Choose Fixer</option>
          {tradies.map((tradie) => {
            const score = "match_score" in tradie ? tradie.match_score : null;
            return (
              <option key={tradie.id} value={tradie.id}>
                {score !== null ? `[${score}] ` : ""}
                {tradie.business_name || tradie.trade_category} - {tradie.trade_category}
                {tradie.service_area ? ` - ${tradie.service_area}` : ""}
              </option>
            );
          })}
        </select>
      ) : (
        <input
          name="tradieId"
          className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
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
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      {documentId ? (
        <input type="hidden" name="documentId" value={documentId} />
      ) : (
        <input
          name="documentId"
          className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
          placeholder="Verification document UUID"
          required
        />
      )}
      <select name="status" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
        <option value="approved">Approve</option>
        <option value="rejected">Reject</option>
      </select>
      <input
        name="notes"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Review notes"
      />
      <Button disabled={pending}>Save decision</Button>
    </form>
  );
}

export function RefundLeadCreditsForm() {
  const [state, action, pending] = useActionState(refundLeadCreditsAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input
        name="leadClaimId"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Lead claim UUID"
        required
      />
      <input
        name="reason"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Refund reason"
        required
      />
      <Button disabled={pending}>Refund credits</Button>
    </form>
  );
}

export function SupportTicketStatusForm({ ticketId, currentStatus }: { ticketId: string; currentStatus?: string | null }) {
  const [state, action, pending] = useActionState(updateSupportTicketStatusAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="ticketId" value={ticketId} />
      <select name="status" defaultValue={currentStatus ?? "open"} className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
        {supportStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="note"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Internal note optional"
      />
      <Button disabled={pending}>Update ticket</Button>
    </form>
  );
}

export function DisputeStatusForm({ disputeId, currentStatus }: { disputeId: string; currentStatus?: string | null }) {
  const [state, action, pending] = useActionState(updateDisputeStatusAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="disputeId" value={disputeId} />
      <select name="status" defaultValue={currentStatus ?? "open"} className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
        {disputeStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="note"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Resolution note optional"
      />
      <Button disabled={pending}>Update dispute</Button>
    </form>
  );
}

export function MembershipStatusForm({ membershipId, currentStatus }: { membershipId: string; currentStatus?: string | null }) {
  const [state, action, pending] = useActionState(updateMembershipStatusAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="membershipId" value={membershipId} />
      <select name="status" defaultValue={currentStatus ?? "pending_activation"} className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
        {membershipStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="note"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Member note optional"
      />
      <Button disabled={pending}>Update membership</Button>
    </form>
  );
}

export function SafetyCheckStatusForm({ safetyCheckId, currentStatus }: { safetyCheckId: string; currentStatus: string }) {
  const [state, action, pending] = useActionState(updateSafetyCheckStatusAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="safetyCheckId" value={safetyCheckId} />
      <select name="status" defaultValue={currentStatus} className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
        {safetyCheckStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="note"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Status note optional"
      />
      <Button disabled={pending}>Update Safety Check</Button>
    </form>
  );
}

export function AssignSafetyCheckFixerForm({ safetyCheckId, tradies = [] }: { safetyCheckId: string; tradies?: AdminAssignableTradie[] }) {
  const [state, action, pending] = useActionState(assignSafetyCheckFixerAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="safetyCheckId" value={safetyCheckId} />
      <select name="fixerId" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]" required>
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

export function PropertySafeInviteForm({ profileId }: { profileId: string }) {
  const [state, action, pending] = useActionState(invitePropertySafeParticipantAction, initialState);

  return (
    <form action={action} className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg2)] p-4">
      <FormMessage state={state} />
      <input type="hidden" name="profileId" value={profileId} />
      <input
        name="email"
        type="email"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Owner, landlord, or agency email"
        required
      />
      <select name="relationship" className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]">
        {propertySafeRelationships.map((relationship) => (
          <option key={relationship} value={relationship}>
            {relationship.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <input
        name="agencyName"
        className="min-h-11 rounded-lg border border-[var(--border)] bg-white px-3 text-[var(--text)]"
        placeholder="Agency name optional"
      />
      <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm font-bold text-[var(--text2)]">
        <input name="canRequestWork" type="checkbox" className="size-4" />
        Can start maintenance requests
      </label>
      <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm font-bold text-[var(--text2)]">
        <input name="canManageRecord" type="checkbox" className="size-4" />
        Can manage PropertySafe record
      </label>
      <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg2)] px-3 py-2 text-sm font-bold text-[var(--text2)]">
        <input name="canViewFinancials" type="checkbox" className="size-4" />
        Can view financial details
      </label>
      <Button disabled={pending}>Share PropertySafe access</Button>
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
