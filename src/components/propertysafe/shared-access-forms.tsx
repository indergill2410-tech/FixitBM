"use client";

import { useActionState } from "react";
import {
  acceptPropertySafeInviteAction,
  declinePropertySafeInviteAction,
  type PropertySafeInviteActionState
} from "@/app/dashboard/customer/propertysafe/actions";
import { Button } from "@/components/ui";

const initialState: PropertySafeInviteActionState = {};

export function PropertySafeInviteActions({ participantId }: { participantId: string }) {
  const [acceptState, acceptAction, accepting] = useActionState(acceptPropertySafeInviteAction, initialState);
  const [declineState, declineAction, declining] = useActionState(declinePropertySafeInviteAction, initialState);
  const message = acceptState.message ?? declineState.message;
  const ok = acceptState.ok ?? declineState.ok;

  return (
    <div className="grid gap-2">
      {message ? (
        <p className={`text-sm font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>{message}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <form action={acceptAction}>
          <input type="hidden" name="participantId" value={participantId} />
          <Button disabled={accepting} className="w-full">
            {accepting ? "Accepting…" : "Accept access"}
          </Button>
        </form>
        <form action={declineAction}>
          <input type="hidden" name="participantId" value={participantId} />
          <Button variant="ghost" disabled={declining}>
            {declining ? "Declining…" : "Decline"}
          </Button>
        </form>
      </div>
    </div>
  );
}
