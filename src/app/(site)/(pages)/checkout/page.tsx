import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Pembayaran",
  description: "Selesaikan pesanan seragam sekolah Anda dengan aman.",
  robots: { index: false, follow: false },
};

const CheckoutPage = () => {
  return (
    <main>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
