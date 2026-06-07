import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabasePublicConfigured } from "@/lib/supabase/config";

export async function POST(request: Request) {
  if (isSupabasePublicConfigured()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

