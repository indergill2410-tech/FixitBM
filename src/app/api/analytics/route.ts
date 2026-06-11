import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

// Allowed event names: keeps the table clean and prevents junk injection.
const allowedEvents = new Set([
  "cta_click",
  "wizard_step",
  "wizard_submit",
  "booking_started",
  "booking_submitted",
  "membership_view",
  "compliance_view"
]);

export async function POST(request: Request) {
  // Analytics must never break the page: respond 204 on every failure path.
  try {
    const body = (await request.json().catch(() => null)) as {
      event?: string;
      path?: string;
      sessionId?: string;
      properties?: Record<string, unknown>;
    } | null;

    if (!body?.event || !allowedEvents.has(body.event) || !isSupabaseServerConfigured()) {
      return new NextResponse(null, { status: 204 });
    }

    const supabase = createSupabaseAdminClient();
    if (!supabase) return new NextResponse(null, { status: 204 });

    await supabase.from("analytics_events").insert({
      event: body.event,
      path: typeof body.path === "string" ? body.path.slice(0, 300) : null,
      session_id: typeof body.sessionId === "string" ? body.sessionId.slice(0, 80) : null,
      properties: body.properties && typeof body.properties === "object" ? body.properties : {}
    });
  } catch {
    // Swallow everything — telemetry is best-effort.
  }

  return new NextResponse(null, { status: 204 });
}
