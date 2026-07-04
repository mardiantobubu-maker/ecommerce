import PrivacyPolicy from "@/components/PrivacyPolicy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Toko Seragam Sekolah",
  description: "Baca kebijakan privasi Toko Seragam Sekolah tentang bagaimana kami melindungi data pribadi Anda.",
};

const PrivacyPolicyPage = () => {
  return (
    <main>
      <PrivacyPolicy />
    </main>
  );
};

export default PrivacyPolicyPage;
