export interface AdminDbOptions {
  table?: string;
  action: "select" | "insert" | "update" | "upsert" | "delete" | "rpc";
  data?: any;
  columns?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  match?: { column: string; value: any };
  inFilter?: { column: string; values: any[] };
  neqFilter?: { column: string; value: any };
  upsertOptions?: { onConflict?: string };
  rpcName?: string;
  rpcParams?: Record<string, any>;
}

export async function adminDb(options: AdminDbOptions): Promise<{ data: any; error: { message: string } | null }> {
  try {
    const res = await fetch("/api/admin/db", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(options),
    });
    const result = await res.json();
    if (!res.ok) {
      return { data: null, error: { message: result.error || "Terjadi kesalahan pada server" } };
    }
    return { data: result.data, error: null };
  } catch (err: any) {
    return { data: null, error: { message: err.message || "Gagal terhubung ke server" } };
  }
}
