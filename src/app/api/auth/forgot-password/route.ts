import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ message: "SUPABASE_SERVICE_ROLE_KEY is missing or invalid in environment variables" }, { status: 500 });
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_HOST) {
      return NextResponse.json({ message: "SMTP credentials are missing in environment variables" }, { status: 500 });
    }

    // Detect origin more reliably
    const referer = request.headers.get("referer");
    let origin = new URL(request.url).origin;
    if (referer) {
      try {
        origin = new URL(referer).origin;
      } catch (e) {}
    }
    
    console.log("DEBUG: Detecting Origin:", origin);
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${origin}/reset-password`,
      },
    });

    if (error) {
      console.error("Error generating reset link:", error.message);
      return NextResponse.json({ message: `Supabase Error: ${error.message}` }, { status: 400 });
    }

    const resetLink = data.properties.action_link;
    console.log("DEBUG: Generated Reset Link:", resetLink);

    // Send email using Vercel SMTP (Nodemailer)
    const emailResult = await sendEmail({
      to: email,
      subject: "Atur Ulang Kata Sandi - Toko Seragam Sekolah",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
          <h2 style="color: #212121; text-align: center;">Atur Ulang Kata Sandi</h2>
          <p>Halo,</p>
          <p>Kami menerima permintaan untuk mengatur ulang kata sandi akun Anda. Silakan klik tombol di bawah ini untuk melanjutkan:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #212121; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Atur Ulang Kata Sandi</a>
          </div>
          <p>Tautan ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} Toko Seragam Sekolah. Semua hak dilindungi.</p>
        </div>
      `,
    });

    if (emailResult.success) {
      return NextResponse.json({ message: "Reset email sent successfully" }, { status: 200 });
    } else {
      const errorMsg = (emailResult.error as Error)?.message || "Unknown SMTP error";
      return NextResponse.json({ message: `SMTP Error: ${errorMsg}` }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Forgot password internal error:", error);
    return NextResponse.json({ message: `System Error: ${error.message}` }, { status: 500 });
  }
}
