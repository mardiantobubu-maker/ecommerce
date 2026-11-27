import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";
import { domain, generateProductSchema } from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import { normalizeProduct } from "@/lib/product-format";

export const dynamic = 'force-dynamic';

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

  const fullTitle = `${product.title} - Harga Grosir Pabrik`;
  const cleanDesc = product.description?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 155) || "Beli Seragam Sekolah kualitas premium harga pabrik.";

  return {
    title: fullTitle,
    description: cleanDesc,
    openGraph: {
      title: fullTitle,
      description: cleanDesc,
      images: [product.image_url],
    },
    alternates: {
      canonical: `${domain}/seragamsekolah-details?id=${id}`,
    }
  };
}

const SeragamSekolahDetailsPage = async ({ searchParams }: Props) => {
  const { id } = await searchParams;
  let productSchema = null;
  let initialProduct = null;

  if (id) {
    const normalizedId = Number(id);
    const lookupId = Number.isNaN(normalizedId) ? id : normalizedId;

    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', lookupId)
      .maybeSingle();

    if (product) {
      initialProduct = normalizeProduct(product);
      productSchema = generateProductSchema({
        id: product.id,
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
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      <React.Suspense fallback={null}>
        <ShopDetails initialProduct={initialProduct} />
      </React.Suspense>
    </>
  );
};

export default SeragamSekolahDetailsPage;
