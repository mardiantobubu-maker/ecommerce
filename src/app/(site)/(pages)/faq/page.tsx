import FAQ from "@/components/FAQ";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ | Toko Seragam Sekolah",
  description: "Temukan jawaban untuk pertanyaan umum tentang seragam sekolah, pengiriman, pembayaran, dan lainnya.",
};

const FAQPage = () => {
  return (
    <main>
      <FAQ />
    </main>
  );
};

export default FAQPage;
