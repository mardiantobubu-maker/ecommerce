import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Supabase Admin not configured" }, { status: 500 });
  }

  // 1. Ambil semua data profil
  const { data: profiles, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // 2. Ambil semua user dari auth untuk cek status verifikasi
  // Catatan: listUsers() memiliki limit default 50. Untuk skala besar perlu pagination.
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    console.error("Error fetching auth users:", authError);
    // Kita tetap kembalikan data profil meskipun gagal ambil status verifikasi
    return NextResponse.json(profiles);
  }

  // 3. Gabungkan status verifikasi ke data profil
  const customersWithStatus = (profiles as any[]).map(profile => {
    const authUser = (users as any[]).find(u => u.id === profile.id);
    return {
      ...profile,
      email_verified: !!authUser?.email_confirmed_at,
      email_confirmed_at: authUser?.email_confirmed_at || null,
      last_sign_in: authUser?.last_sign_in_at || null
    };
  });

  return NextResponse.json(customersWithStatus);
}
