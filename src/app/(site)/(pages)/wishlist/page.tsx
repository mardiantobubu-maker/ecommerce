import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Keinginan | Toko Seragam Sekolah",
  description: "Simpan seragam sekolah favorit Anda untuk nanti.",
};

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
