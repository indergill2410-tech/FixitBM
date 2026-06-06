"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabasePublishableKey, supabaseUrl } from "./config";

export function createSupabaseBrowserClient() {
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Account access is temporarily unavailable.");
  }

  return createBrowserClient(supabaseUrl, supabasePublishableKey);
}
