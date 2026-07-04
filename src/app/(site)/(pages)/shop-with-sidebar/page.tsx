import React from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";
import { supabase } from "@/lib/supabase";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Toko Seragam Sekolah | Pilihan Lengkap & Berkualitas",
  description: "Beli seragam sekolah SD, SMP, SMA, Pramuka, dan Batik berkualitas tinggi dengan harga terjangkau di Toko Seragam kami.",
};

const ShopWithSidebarPage = async () => {
  const { data } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(12);

  const initialProducts = data?.map((item: any) => {
    const allPrices = [
      item.discounted_price, 
      item.price, 
      item.discounted_price_panjang, 
      item.price_panjang
    ].filter(p => p && p > 0);
    
    const displayPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const normalPrice = item.price || item.price_panjang || displayPrice;

    return {
      ...item,
      imgs: {
        thumbnails: item.thumbnails || [item.image_url],
        previews: item.previews || [item.image_url]
      },
      discountedPrice: displayPrice,
      price: normalPrice,
      colors: typeof item.colors === 'string' ? item.colors.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.colors) ? item.colors : []),
      sizes: typeof item.sizes === 'string' ? item.sizes.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.sizes) ? item.sizes : []),
      sleeves: typeof item.sleeves === 'string' ? item.sleeves.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.sleeves) ? item.sleeves : []),
    };
  }) || [];

  return (
    <main>
      <React.Suspense fallback={null}>
        <ShopWithSidebar initialProducts={initialProducts} />
      </React.Suspense>
    </main>
  );
};

export default ShopWithSidebarPage;
