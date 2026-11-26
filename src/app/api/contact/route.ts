import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, message } = body;

    const result = await sendEmail({
      to: process.env.SMTP_USER || "", // Send to your own email by default
      subject: `Pesan Kontak Baru dari ${name}`,
      text: `Nama: ${name}\nEmail: ${email}\nPesan: ${message}`,
      html: `
        <h3>Pesan Kontak Baru</h3>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Pesan:</strong></p>
        <p>${message}</p>
      `,
    });

    if (result.success) {
      return NextResponse.json({ message: "Email sent successfully" }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Failed to send email" }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
