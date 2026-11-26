import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";

// Debug log to check if environment variables are loaded correctly
if (typeof window !== 'undefined') {
  console.log("Supabase URL initialized:", supabaseUrl);
}

if (supabaseUrl === "https://placeholder.supabase.co") {
  console.warn("ATTENTION: Supabase URL is missing! Check your Vercel Environment Variables.");
}

const globalForSupabase = globalThis as unknown as { supabase: SupabaseClient };

export const supabase =
  globalForSupabase.supabase || createClient(supabaseUrl, supabaseAnonKey);

if (process.env.NODE_ENV !== "production") globalForSupabase.supabase = supabase;

// Safe Realtime Teardown Patch
// This handles cases where the connection is still in 'connecting' (0) state
// and ensures callbacks are cleared properly to avoid memory leaks or race conditions.
if (typeof window !== 'undefined') {
  const realtime = (supabase as any).realtime;
  if (realtime && realtime.socket) {
    const socket = realtime.socket;
    socket.teardown = function(callback: any, code: any, reason: any) {
      if (!this.conn) return callback && callback();
      const conn = this.conn;

      // If still connecting (0), we can't close gracefully yet.
      // Set a one-time onopen handler to close it as soon as it connects.
      if (conn.readyState === 0) {
        conn.onopen = () => conn.close(code, reason || "");
      }

      this.waitForBufferDone(conn, () => {
        // Only call close if the socket is not already closing or closed
        if (conn.readyState < 2) {
          code ? conn.close(code, reason || "") : conn.close();
        }
        this.waitForSocketClosed(conn, () => {
          if (this.conn === conn) {
            this.conn.onopen = this.conn.onerror = this.conn.onmessage = this.conn.onclose = function() {};
            this.conn = null;
          }
          callback && callback();
        });
      });
    };
  }
}
