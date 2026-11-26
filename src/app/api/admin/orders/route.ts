import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase Admin not configured" }, { status: 500 });
  }

  // Fetch all orders with profiles join using service role key (bypasses RLS)
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, profiles!user_id(full_name, company_name, whatsapp)')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase Admin not configured" }, { status: 500 });
  }

  try {
    const { id, status, cancellation_note } = await request.json();
    console.log("Updating order:", id, "to status:", status, "with note:", cancellation_note);

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status are required" }, { status: 400 });
    }

    // Get order data to get user_id for notification
    const { data: orderData } = await supabaseAdmin.from('orders').select('user_id').eq('id', id).single();

    const updateData: any = { status };
    if (status === 'canceled') {
      updateData.cancellation_note = cancellation_note || null;
    }

    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send notification if user_id exists
    if (orderData?.user_id) {
       const statusText = status === 'delivered' ? 'Selesai' : 
                         status === 'shipping' ? 'Sedang Dikirim' :
                         status === 'processing' ? 'Sedang Diproses' : 
                         status === 'pending' ? 'Menunggu' : 
                         status === 'canceled' ? 'Batal' : status;

       let notificationMessage = `Status pesanan Anda telah diperbarui menjadi: ${statusText.toUpperCase()}.`;
       if (status === 'canceled' && cancellation_note) {
         notificationMessage = `Pesanan Anda DIBATALKAN. Alasan: ${cancellation_note}`;
       }

       await supabaseAdmin.from('notifications').insert([
         {
           user_id: orderData.user_id,
           type: 'order',
           title: `Update Pesanan #${id.slice(-6).toUpperCase()}`,
           message: notificationMessage,
           link: `/my-account?tab=orders&id=${id}`,
           status: statusText
         }
       ]);
    }

    return NextResponse.json(data[0]);
  } catch (err) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase Admin not configured" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
