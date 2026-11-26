import RefundPolicy from "@/components/RefundPolicy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kebijakan Pengembalian Dana | Toko Seragam Sekolah",
  description: "Pelajari kebijakan pengembalian dana dan penukaran produk di Toko Seragam Sekolah.",
};

const RefundPolicyPage = () => {
  return (
    <main>
      <RefundPolicy />
    </main>
  );
};

export default RefundPolicyPage;
