import React from "react";
import ShopWithoutSidebar from "@/components/ShopWithoutSidebar";

import { domain } from "@/lib/seo";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Katalog Seragam Sekolah",
  description: "Jelajahi koleksi seragam sekolah SD, SMP, SMA berkualitas harga pabrik.",
  alternates: { canonical: `${domain}/seragamsekolah` },
  robots: { index: false, follow: true },
};

const ShopWithoutSidebarPage = () => {
  return (
    <main>
      <ShopWithoutSidebar />
    </main>
  );
};

export default ShopWithoutSidebarPage;
