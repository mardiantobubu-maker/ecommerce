import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Keranjang Belanja",
  description: "Lihat item yang Anda pilih dan lanjutkan ke pembayaran.",
  robots: { index: false, follow: false },
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
