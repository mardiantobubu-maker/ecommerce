import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Keranjang Belanja | Toko Seragam Sekolah",
  description: "Lihat item yang Anda pilih dan lanjutkan ke pembayaran.",
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
