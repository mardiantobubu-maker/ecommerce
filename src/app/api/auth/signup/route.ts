import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email, password, metadata } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: "Email dan password wajib diisi" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ message: "Konfigurasi Supabase Admin tidak ditemukan" }, { status: 500 });
    }

    // 1. Cek apakah user sudah ada
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = (users as any[]).find(u => u.email === email);

    if (existingUser) {
      return NextResponse.json({ message: "Alamat Email ini sudah terdaftar!" }, { status: 400 });
    }

    // 2. Buat user baru dengan email_confirm: false
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: metadata,
      email_confirm: false,
    });

    if (createError) {
      console.error("Error creating user:", createError.message);
      return NextResponse.json({ message: `Gagal membuat akun: ${createError.message}` }, { status: 400 });
    }

    console.log("DEBUG: User created with email_confirm=false, id:", newUser.user.id);
    console.log("DEBUG: email_confirmed_at:", newUser.user.email_confirmed_at);

    // 3. Generate Link Verifikasi menggunakan tipe 'magiclink'
    // Kita gunakan magiclink karena user sudah dibuat via createUser
    const referer = request.headers.get("referer");
    let origin = new URL(request.url).origin;
    if (referer) {
      try { origin = new URL(referer).origin; } catch (e) {}
    }

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: email,
      options: {
        redirectTo: `${origin}/signin?verified=true`,
      },
    });

    if (linkError) {
      console.error("Error generating link:", linkError.message);
      // Akun sudah dibuat tapi gagal buat link - tetap kembalikan sukses
      // User bisa request resend nanti
      return NextResponse.json({ 
        message: "Akun berhasil dibuat, silakan gunakan tombol kirim ulang verifikasi.",
      }, { status: 200 });
    }

    const verificationLink = linkData.properties.action_link;
    console.log("DEBUG: Verification link generated successfully");

    // 4. Kirim Email menggunakan Nodemailer (SMTP)
    console.log("DEBUG: Sending email via SMTP to:", email);
    console.log("DEBUG: SMTP Config:", {
      host: process.env.SMTP_HOST || "(MISSING)",
      user: process.env.SMTP_USER || "(MISSING)",
      port: process.env.SMTP_PORT || "(MISSING)",
      hasPass: !!process.env.SMTP_PASSWORD
    });

    const emailResult = await sendEmail({
      to: email,
      subject: "Verifikasi Akun Mitra - Toko Seragam Sekolah",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${origin}/images/logo/logo.svg" alt="Seragam Sekolah" style="height: 45px; margin-bottom: 10px;" />
            <p style="color: #6b7280; font-size: 14px;">Mitra Bisnis Platform</p>
          </div>
          
          <h2 style="color: #1f2937; text-align: center;">Selamat Datang, ${metadata?.full_name || "Mitra"}!</h2>
          
          <p style="color: #4b5563; line-height: 1.6;">
            Terima kasih telah mendaftar sebagai Mitra Bisnis di Toko Seragam Sekolah. 
            Satu langkah lagi untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini untuk memverifikasi alamat email Anda:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Verifikasi Email Sekarang</a>
          </div>
          
          <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
            Jika tombol di atas tidak berfungsi, salin dan tempel tautan berikut ke browser Anda:
            <br />
            <span style="color: #2563eb; word-break: break-all;">${verificationLink}</span>
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
          
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            &copy; ${new Date().getFullYear()} Toko Seragam Sekolah. Semua hak dilindungi.<br />
            Jika Anda tidak merasa melakukan pendaftaran ini, silakan abaikan email ini.
          </p>
        </div>
      `,
    });

    if (emailResult.success) {
      console.log("DEBUG: Verification email sent successfully to:", email);
      return NextResponse.json({ message: "Akun berhasil dibuat, email verifikasi telah dikirim" }, { status: 200 });
    } else {
      console.error("SMTP Error:", JSON.stringify(emailResult.error));
      return NextResponse.json({ 
        message: "Akun berhasil dibuat, namun gagal mengirim email verifikasi. Silakan coba kirim ulang.",
      }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Signup API error:", error);
    return NextResponse.json({ message: `Terjadi kesalahan sistem: ${error.message}` }, { status: 500 });
  }
}
