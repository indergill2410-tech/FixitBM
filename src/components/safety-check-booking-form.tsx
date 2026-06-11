"use client";

import { useActionState } from "react";
import { bookSafetyCheckAction, type SafetyCheckBookingState } from "@/app/dashboard/customer/safety-checks/actions";
import { Button } from "@/components/ui";
import { bookableComplianceCategories } from "@/lib/inspection-templates";
import type { SavedProperty } from "@/lib/jobs";

const initialState: SafetyCheckBookingState = {};

export function SafetyCheckBookingForm({ properties }: { properties: SavedProperty[] }) {
  const [state, action, pending] = useActionState(bookSafetyCheckAction, initialState);

  return (
    <form action={action} className="mt-6 grid gap-4">
      {state.message ? (
        <div className={`rounded-xl p-3 text-sm font-semibold ${state.ok ? "bg-green-50 text-[var(--green)]" : "bg-red-50 text-[var(--red)]"}`}>
          {state.message}
        </div>
      ) : null}
      <label className="grid gap-2 text-sm font-bold">
        Saved property
        <select name="propertyId" className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-white px-4" required>
          <option value="">Choose property</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.label || property.address}
              {property.suburb ? ` - ${property.suburb}` : ""}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="grid gap-2 text-sm font-bold">
        Compliance checks to include
        <p className="text-xs font-normal text-[var(--text2)]">
          Leave all unticked for a standard home readiness check, or select the rental compliance checks you need.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {bookableComplianceCategories.map((category) => (
            <label key={category.key} className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-white p-3 font-normal">
              <input type="checkbox" name="categories" value={category.key} className="mt-1" />
              <span>
                <span className="font-bold">{category.shortLabel}</span>
                <span className="block text-xs text-[var(--text3)]">{category.frequencyLabel}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-bold">
        Preferred window
        <input
          name="preferredWindow"
          className="focus-ring min-h-12 rounded-xl border border-[var(--border)] bg-white px-4"
          placeholder="Weekday morning, next Tuesday afternoon, or first available"
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold">
        Key concerns
        <textarea
          name="concerns"
          className="focus-ring min-h-28 rounded-xl border border-[var(--border)] bg-white p-4"
          placeholder="Leaks, smoke alarms, switchboard access, roof, gutters, locks, hot water, or anything worrying you"
        />
      </label>
      <Button disabled={pending}>{pending ? "Requesting..." : "Request Safety Check Booking"}</Button>
    </form>
  );
}
