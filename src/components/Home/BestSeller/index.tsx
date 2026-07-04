"use client";
import React, { useEffect, useState } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import ProductSkeleton from "@/components/Common/ProductSkeleton";

const BestSeller = ({ initialBestSellers }: { initialBestSellers?: Product[] }) => {
  const [products, setProducts] = useState<Product[]>(initialBestSellers || []);
  const [loading, setLoading] = useState(!initialBestSellers || initialBestSellers.length === 0);

  useEffect(() => {
    let isMounted = true;

    const fetchProductsSafe = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_best', true)
        .order('rating', { ascending: false })
        .limit(6);

      if (!isMounted) return;

      if (data) {
        const mappedProducts = data.map((item: any) => {
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
            price: normalPrice
          };
        });
        if (isMounted) setProducts(mappedProducts);
      }
      if (isMounted) setLoading(false);
    };

    fetchProductsSafe();

    const channel = supabase
      .channel("best-seller-products-realtime-v2")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          if (isMounted) fetchProductsSafe();
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section className="overflow-hidden mt-0 pt-4 pb-0 lg:pt-15">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-[16px] text-dark mb-1.5">
              <Image src="/images/icons/icon-07.svg" alt="" width={20} height={20} />
              Bulan Ini
            </span>
            <h2 className="font-semibold text-[20px] lg:text-[28px] text-dark">Produk Terlaris</h2>
          </div>
          <Link href="/shop-without-sidebar" className="inline-flex font-medium text-sm py-2 px-6 rounded-md border-gray-3 border bg-white text-dark ease-out duration-200 hover:bg-blue hover:text-white hover:border-blue shadow-sm">
            Lihat Semua
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-7">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i}>
                <ProductSkeleton />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((item, key) => (
              <div key={key}>
                <SingleItem item={item} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-dark">Produk unggulan sedang disiapkan...</div>
          )}
        </div>

      </div>
    </section>
  );
};

export default BestSeller;
