import PrivacyPolicy from "@/components/PrivacyPolicy";
import { domain } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description: "Baca kebijakan privasi Seragam Grosir tentang bagaimana kami melindungi data pribadi Anda.",
  alternates: { canonical: `${domain}/privacy-policy` },
};

const PrivacyPolicyPage = () => {
  return (
    <main>
      <PrivacyPolicy />
    </main>
  );
};

export default PrivacyPolicyPage;
