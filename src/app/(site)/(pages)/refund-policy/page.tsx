import RefundPolicy from "@/components/RefundPolicy";
import { domain } from "@/lib/seo";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian Dana",
  description: "Pelajari kebijakan pengembalian dana dan penukaran produk di Seragam Grosir.",
  alternates: { canonical: `${domain}/refund-policy` },
};

const RefundPolicyPage = () => {
  return (
    <main>
      <RefundPolicy />
    </main>
  );
};

export default RefundPolicyPage;
