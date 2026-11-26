import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email wajib diisi" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Konfigurasi Supabase Admin tidak ditemukan" }, { status: 500 });
    }

    // 1. Dapatkan user metadata untuk menyapa di email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    const user = (users as any[]).find(u => u.email === email);

    if (!user) {
      return NextResponse.json({ message: "Email tidak ditemukan" }, { status: 404 });
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ message: "Email sudah terverifikasi" }, { status: 400 });
    }

    const fullName = user.user_metadata?.full_name || "Mitra";

    // 2. Generate Link Verifikasi Baru
    const origin = new URL(request.url).origin;
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "invite", // Gunakan 'invite' untuk resend karena kita tidak simpan password user
      email: email,
      options: {
        redirectTo: `${origin}/signin?verified=true`,
      },
    });

    if (linkError) {
      return NextResponse.json({ message: `Gagal membuat tautan: ${linkError.message}` }, { status: 400 });
    }

    const verificationLink = linkData.properties.action_link;

    // 3. Kirim Email
    console.log("DEBUG: Attempting to RESEND email to:", email);
    console.log("DEBUG: SMTP Config:", {
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      port: process.env.SMTP_PORT,
      hasPass: !!process.env.SMTP_PASSWORD
    });

    const emailResult = await sendEmail({
      to: email,
      subject: "Kirim Ulang Verifikasi Akun - Toko Seragam Sekolah",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${origin}/images/logo/logo.svg" alt="Seragam Sekolah" style="height: 40px; margin-bottom: 10px;" />
          </div>
          <h2 style="color: #1f2937; text-align: center;">Tautan Verifikasi Baru</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Halo ${fullName}, Anda meminta pengiriman ulang tautan verifikasi. 
            Silakan klik tombol di bawah ini untuk mengaktifkan akun Anda:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Verifikasi Akun Sekarang</a>
          </div>
          <p style="color: #6b7280; font-size: 12px; text-align: center;">
            Jika Anda tidak merasa meminta email ini, silakan abaikan.
          </p>
        </div>
      `,
    });

    if (emailResult.success) {
      console.log("DEBUG: Resend email successful");
      return NextResponse.json({ message: "Email verifikasi telah dikirim ulang" }, { status: 200 });
    } else {
      console.error("SMTP Resend Error:", emailResult.error);
      return NextResponse.json({ 
        message: "Gagal mengirim email lewat SMTP",
        debug: process.env.NODE_ENV === 'development' ? emailResult.error : undefined
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
