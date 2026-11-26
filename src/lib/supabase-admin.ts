import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const globalForSupabaseAdmin = globalThis as unknown as { supabaseAdmin: SupabaseClient | null };

export const supabaseAdmin = globalForSupabaseAdmin.supabaseAdmin || (supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null);

if (process.env.NODE_ENV !== "production") globalForSupabaseAdmin.supabaseAdmin = supabaseAdmin;

if (!supabaseAdmin) {
  console.warn("SUPABASE_SERVICE_ROLE_KEY is missing! Admin features will not work.");
}

