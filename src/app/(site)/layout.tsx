import { Metadata } from "next";
import localFont from "next/font/local";
import "../css/style.css";
import ClientLayoutWrapper from "@/components/Common/ClientLayoutWrapper";

const euclid = localFont({
  src: [
    {
      path: "../fonts/EuclidCircularA-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/EuclidCircularA-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-euclid-circular-a",
  display: "optional",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.seragamsekolah.com"),
  title: {
    default: "Grosir Seragam Sekolah SD SMP SMA - Supplier Tangan Pertama Harga Pabrik",
    template: "%s | Seragam Sekolah Premium",
  },
  description: "Supplier seragam sekolah tangan pertama terlengkap. Sedia grosir seragam sekolah SD, SMP, SMA kualitas premium harga pabrik. Konveksi terpercaya untuk pesanan sekolah & yayasan ke seluruh Indonesia.",
  keywords: [
    "Grosir seragam sekolah SD SMP SMA",
    "Supplier seragam sekolah tangan pertama",
    "Konveksi seragam sekolah harga pabrik",
    "seragam sekolah kualitas premium", 
    "grosir seragam sekolah murah", 
    "toko seragam sekolah terdekat", 
    "seragam sd smp sma", 
    "konveksi seragam sekolah terpercaya",
  ],
  authors: [{ name: "Toko Seragam Sekolah Premium" }],
  creator: "Toko Seragam Sekolah",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.seragamsekolah.com",
    title: "Seragam Sekolah Kualitas Premium - Grosir Terpercaya",
    description: "Koleksi seragam sekolah premium SD, SMP, SMA dengan harga grosir terbaik. Bahan nyaman, warna tidak pudar, dan ukuran lengkap.",
    siteName: "Seragam Sekolah Premium",
  },
  twitter: {
    card: "summary_large_image",
    title: "Seragam Sekolah Kualitas Premium - Grosir Terpercaya",
    description: "Seragam sekolah kualitas terbaik dengan pengiriman cepat ke seluruh Indonesia. Pesan sekarang untuk harga promo!",
  },
  other: {
    "google": "notranslate",
  },
};

import { SpeedInsights } from "@vercel/speed-insights/next";
import { supabase } from "@/lib/supabase";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch categories on the server to pass down to client components
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  return (
    <html lang="id" translate="no" suppressHydrationWarning={true} className={`${euclid.variable} overscroll-y-none`}>
      <head>
        <link rel="preconnect" href="https://nrunbiazgozefdxixxib.supabase.co" />
        <link rel="dns-prefetch" href="https://nrunbiazgozefdxixxib.supabase.co" />

      </head>

      <body suppressHydrationWarning={true} className="font-euclid-circular-a overscroll-y-none">
        <ClientLayoutWrapper initialCategories={categories || []}>{children}</ClientLayoutWrapper>
        <SpeedInsights />
      </body>
    </html>
  );
}
