import { createClient } from "@supabase/supabase-js";
import { supabaseSecretKey, supabaseUrl } from "./config";

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    return null;
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
