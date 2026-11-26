import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const ALLOWED_TABLES = new Set([
  "products",
  "categories",
  "blogs",
  "promos",
  "coupons",
  "home_banners",
  "orders",
  "subscribers",
  "testimonials",
]);

const ALLOWED_RPCS = new Set(["broadcast_promo_notification"]);

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "Supabase Admin not configured" },
      { status: 500 }
    );
  }

  try {
    const {
      table,
      action,
      data,
      match,
      inFilter,
      neqFilter,
      rpcName,
      rpcParams,
      upsertOptions,
      columns,
      orderBy,
      limit,
    } = await request.json();

    if (action === "rpc") {
      if (!rpcName || !ALLOWED_RPCS.has(rpcName)) {
        return NextResponse.json({ error: "RPC tidak diizinkan" }, { status: 403 });
      }
      const { data: rpcData, error } = await supabaseAdmin.rpc(rpcName, rpcParams || {});
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ data: rpcData });
    }

    if (!table || !ALLOWED_TABLES.has(table)) {
      return NextResponse.json({ error: "Tabel tidak diizinkan" }, { status: 403 });
    }

    const adminClient = supabaseAdmin as any;
    let query: any;

    if (action === "select") {
      query = adminClient.from(table).select(columns || "*");
      if (match?.column && match?.value !== undefined) {
        query = query.eq(match.column, match.value);
      }
      if (orderBy?.column) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? false });
      }
      if (limit) {
        query = query.limit(limit);
      }
    } else if (action === "insert") {
      const payload = Array.isArray(data) ? data : [data];
      query = adminClient.from(table).insert(payload).select();
    } else if (action === "upsert") {
      const payload = Array.isArray(data) ? data : [data];
      query = adminClient.from(table).upsert(payload, upsertOptions).select();
    } else if (action === "update") {
      if (neqFilter?.column && neqFilter?.value !== undefined) {
        query = adminClient
          .from(table)
          .update(data)
          .neq(neqFilter.column, neqFilter.value)
          .select();
      } else if (match?.column && match?.value !== undefined) {
        query = adminClient
          .from(table)
          .update(data)
          .eq(match.column, match.value)
          .select();
      } else {
        return NextResponse.json(
          { error: "Parameter match atau neqFilter diperlukan untuk update" },
          { status: 400 }
        );
      }
    } else if (action === "delete") {
      if (inFilter?.column && Array.isArray(inFilter?.values)) {
        query = adminClient
          .from(table)
          .delete()
          .in(inFilter.column, inFilter.values)
          .select();
      } else if (match?.column && match?.value !== undefined) {
        query = adminClient
          .from(table)
          .delete()
          .eq(match.column, match.value)
          .select();
      } else {
        return NextResponse.json(
          { error: "Parameter match atau inFilter diperlukan untuk delete" },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
    }

    const { data: resData, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if ((action === "update" || action === "delete") && match?.column && (!resData || resData.length === 0)) {
      return NextResponse.json(
        { error: "Data tidak ditemukan atau tidak ada perubahan yang tersimpan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: resData });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
