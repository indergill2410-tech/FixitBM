import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseServerConfigured } from "@/lib/supabase/config";

// Notifications for the signed-in user: latest items + unread count.
export async function GET() {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (!isSupabaseServerConfigured()) return NextResponse.json({ notifications: [], unread: 0 });
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ notifications: [], unread: 0 });

  const [{ data: notifications }, { count }] = await Promise.all([
    supabase
      .from("notifications")
      .select("id, title, body, link, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null)
  ]);

  return NextResponse.json({ notifications: notifications ?? [], unread: count ?? 0 });
}

// Mark all of the user's notifications read.
export async function POST() {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  if (!isSupabaseServerConfigured()) return NextResponse.json({ ok: true });
  const supabase = createSupabaseAdminClient();
  if (!supabase) return NextResponse.json({ ok: true });

  await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .is("read_at", null);

  return NextResponse.json({ ok: true });
}
