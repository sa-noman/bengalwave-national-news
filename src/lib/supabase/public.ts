import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseConfig } from "./config";

export function createSupabasePublicClient() {
  if (!isSupabaseConfigured()) return null;
  const {url,key} = supabaseConfig();
  return createClient(url,key,{
    auth: {persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}
  });
}
