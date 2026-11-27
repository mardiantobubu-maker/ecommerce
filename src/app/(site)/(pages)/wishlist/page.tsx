import React from "react";
import { Wishlist } from "@/components/Wishlist";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Daftar Keinginan",
  description: "Simpan seragam sekolah favorit Anda untuk nanti.",
  robots: { index: false, follow: false },
};

const WishlistPage = () => {
  return (
    <main>
      <Wishlist />
    </main>
  );
};

export default WishlistPage;
