import Contact from "@/components/Contact";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Hubungi Kami | Toko Seragam Sekolah",
  description: "Punya pertanyaan tentang seragam sekolah? Hubungi tim kami sekarang.",
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
