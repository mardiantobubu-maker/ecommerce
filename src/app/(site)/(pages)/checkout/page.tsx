import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Halaman Pembayaran | Toko Seragam Sekolah",
  description: "Selesaikan pesanan seragam sekolah Anda dengan aman.",
};

const CheckoutPage = () => {
  return (
    <main>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
