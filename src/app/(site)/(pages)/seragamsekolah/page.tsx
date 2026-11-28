import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { supabase } from "@/lib/supabase";
import { domain } from "@/lib/seo";
import { normalizeProduct } from "@/lib/product-format";

import { Metadata } from "next";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Toko Seragam Sekolah | Pilihan Lengkap & Berkualitas",
  description: "Beli seragam sekolah SD, SMP, SMA, Pramuka, dan Batik berkualitas tinggi dengan harga terjangkau di Toko Seragam kami.",
  alternates: {
    canonical: `${domain}/seragamsekolah`,
  },
};

const SeragamSekolahPage = async () => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  const initialProducts = (data || []).map((item: any) => normalizeProduct(item)).filter(Boolean);

  return (
    <React.Suspense fallback={null}>
      <ShopWithSidebar initialProducts={initialProducts} />
    </React.Suspense>
  );
};

export default SeragamSekolahPage;
