import FAQ from "@/components/FAQ";
import { domain } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ & Pertanyaan Umum",
  description: "Temukan jawaban untuk pertanyaan umum tentang seragam sekolah, pengiriman, pembayaran, dan lainnya.",
  alternates: { canonical: `${domain}/faq` },
};

const FAQPage = () => {
  return (
    <main>
      <FAQ />
    </main>
  );
};

export default FAQPage;
