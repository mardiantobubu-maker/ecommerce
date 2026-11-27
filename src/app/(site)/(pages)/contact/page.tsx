import Contact from "@/components/Contact";
import { domain } from "@/lib/seo";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Hubungi Kami",
  description: "Punya pertanyaan tentang seragam sekolah? Hubungi tim kami sekarang.",
  alternates: { canonical: `${domain}/contact` },
};

const ContactPage = () => {
  return (
    <main>
      <Contact />
    </main>
  );
};

export default ContactPage;
