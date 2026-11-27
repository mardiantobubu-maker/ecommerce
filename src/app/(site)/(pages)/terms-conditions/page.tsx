import TermsConditions from "@/components/TermsConditions";
import { domain } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan Penggunaan",
  description: "Baca syarat dan ketentuan penggunaan layanan Seragam Grosir.",
  alternates: { canonical: `${domain}/terms-conditions` },
};

const TermsConditionsPage = () => {
  return (
    <main>
      <TermsConditions />
    </main>
  );
};

export default TermsConditionsPage;
