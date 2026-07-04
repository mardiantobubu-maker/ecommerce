import TermsConditions from "@/components/TermsConditions";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Syarat Penggunaan | Toko Seragam Sekolah",
  description: "Baca syarat dan ketentuan penggunaan layanan Toko Seragam Sekolah.",
};

const TermsConditionsPage = () => {
  return (
    <main>
      <TermsConditions />
    </main>
  );
};

export default TermsConditionsPage;
