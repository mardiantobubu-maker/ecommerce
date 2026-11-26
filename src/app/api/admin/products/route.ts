import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase Admin not configured" }, { status: 500 });
  }

  try {
    const body = await request.json();
    const payload = Array.isArray(body) ? body : [body];

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(payload)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase Admin not configured" }, { status: 500 });
  }

  try {
    const { id, ...productData } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID produk diperlukan" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('products')
      .update(productData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Produk tidak ditemukan atau gagal diperbarui" }, { status: 404 });
    }

    return NextResponse.json({ data: data[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase Admin not configured" }, { status: 500 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "ID produk diperlukan" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
