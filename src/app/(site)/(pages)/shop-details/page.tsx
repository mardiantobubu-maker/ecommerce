import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";
import { generateProductSchema } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { id } = await searchParams;
  if (!id) return { title: "Detail Produk | Seragam Sekolah" };

  const { data: product } = await supabase
    .from('products')
    .select('title, description, image_url')
    .eq('id', id)
    .single();

  if (!product) return { title: "Produk Tidak Ditemukan | Seragam Sekolah" };

  const fullTitle = `${product.title} - Grosir Seragam Sekolah Premium`;
  const cleanDesc = product.description?.replace(/<[^>]*>/g, '').substring(0, 160) || "Beli Seragam Sekolah kualitas premium harga pabrik.";

  return {
    title: fullTitle,
    description: cleanDesc,
    openGraph: {
      title: fullTitle,
      description: cleanDesc,
      images: [product.image_url],
    },
    alternates: {
      canonical: `https://www.seragamsekolah.com/shop-details?id=${id}`,
    }
  };
}

const ShopDetailsPage = async ({ searchParams }: Props) => {
  const { id } = await searchParams;
  let productSchema = null;

  if (id) {
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (product) {
      productSchema = generateProductSchema({
        name: product.title,
        description: product.description?.replace(/<[^>]*>/g, '') || "",
        image: product.image_url,
        price: product.price || product.price_panjang || 0,
        sku: `SRG-${product.id}`,
        inStock: (product.stock || 0) > 0,
      });
    }
  }

  return (
    <main>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <React.Suspense fallback={null}>
        <ShopDetails />
      </React.Suspense>
    </main>
  );
};

export default ShopDetailsPage;
