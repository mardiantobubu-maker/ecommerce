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

    const [{ data: product }, { data: testimonialsData }] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .eq('id', lookupId)
        .maybeSingle(),
      supabase
        .from('testimonials')
        .select('name, rating, comment, created_at')
        .eq('product_id', lookupId)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    if (product) {
      initialProduct = normalizeProduct(product);
      const formattedReviews = (testimonialsData || [])
        .filter((r: any) => r.name && r.rating > 0 && r.comment)
        .map((r: any) => ({
          author: r.name,
          rating: Number(r.rating),
          comment: r.comment,
          datePublished: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : undefined,
        }));

      const reviewCount = formattedReviews.length > 0 ? formattedReviews.length : Number(product.reviews || 0);
      const ratingValue = formattedReviews.length > 0
        ? Number((formattedReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / formattedReviews.length).toFixed(1))
        : Number(product.rating || 0);

      productSchema = generateProductSchema({
        id: product.id,
        name: product.title,
        description: product.description?.replace(/<[^>]*>/g, '') || "",
        image: product.image_url,
        price: product.price || product.price_panjang || 0,
        sku: `SRG-${product.id}`,
        inStock: (product.stock || 0) > 0,
        ratingValue,
        reviewCount,
        reviews: formattedReviews,
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
