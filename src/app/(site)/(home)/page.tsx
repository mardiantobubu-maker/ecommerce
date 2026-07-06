import Home from "@/components/Home";
import Hero from "@/components/Home/Hero";
import { Metadata } from "next";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo";
import { supabase } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Grosir Seragam Sekolah SD SMP SMA - Supplier Tangan Pertama",
  description: "Selamat datang di Supplier Seragam Sekolah Tangan Pertama. Menyediakan grosir seragam sekolah SD, SMP, SMA berkualitas premium dengan harga pabrik langsung dari konveksi.",
};

export default async function HomePage() {
  const orgSchema = generateOrganizationSchema();
  const webSchema = generateWebSiteSchema();

  // Fetch data on the server for better LCP/FCP
  const [
    { data: categoriesData },
    { data: bestSellersData },
    { data: newArrivalsData },
    { data: bannersData }
  ] = await Promise.all([
    supabase.from('categories').select('*').order('name', { ascending: true }),
    supabase.from('products').select('*').eq('is_best', true).order('rating', { ascending: false }).limit(6),
    supabase.from('products').select('*').eq('is_new', true).order('created_at', { ascending: false }).limit(4),
    supabase.from('home_banners').select('*').order('id', { ascending: true })
  ]);

  const fixImageUrl = (url: string) => {
    if (url === "/images/products/seragam-sd.png") {
      return "/images/products/terbaru-seragam-sd.png";
    }
    return url;
  };

  const categories = categoriesData?.map(cat => ({
    id: cat.id,
    title: cat.name,
    img: fixImageUrl(cat.image_url)
  })) || [];

  const mapProduct = (item: any) => {
    const mainImg = fixImageUrl(item.image_url);
    const thumbnails = (item.thumbnails || [item.image_url]).map(fixImageUrl);
    const previews = (item.previews || [item.image_url]).map(fixImageUrl);

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
      image_url: mainImg,
      imgs: {
        thumbnails,
        previews
      },
      discountedPrice: displayPrice,
      price: normalPrice
    };
  };

  const bestSellers = bestSellersData?.map(mapProduct) || [];
  const newArrivals = newArrivalsData?.map(mapProduct) || [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSchema) }}
      />
      <Hero initialBanners={bannersData || []} />
      <Home 
        initialCategories={categories}
        initialBestSellers={bestSellers}
        initialNewArrivals={newArrivals}
      />
    </>
  );
}
