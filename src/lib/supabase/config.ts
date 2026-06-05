export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export function isSupabasePublicConfigured() {
  return Boolean(supabaseUrl && supabasePublishableKey);
}

export function isSupabaseServerConfigured() {
  return Boolean(supabaseUrl && supabaseSecretKey);
}
