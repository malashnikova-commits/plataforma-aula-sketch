import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const key = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ""
).trim();

export function supabaseConfigurado(): boolean {
  return Boolean(
    url &&
      key &&
      url.startsWith("https://") &&
      !url.includes("xxxx") &&
      !key.includes("xxxx")
  );
}

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigurado()) return null;
  return createClient(url!, key!);
}
