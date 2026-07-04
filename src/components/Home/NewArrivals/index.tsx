"use client";
import React, { useEffect, useState } from "react";
import ProductItem from "@/components/Common/ProductItem";
import ProductSkeleton from "@/components/Common/ProductSkeleton";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types/product";
import Link from "next/link";

const NewArrival = ({ initialNewArrivals }: { initialNewArrivals?: Product[] }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProductsSafe = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_new', true)
        .order('created_at', { ascending: false })
        .limit(4);

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
      .channel("new-arrivals-products-realtime-v2")
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
    <section className="overflow-hidden mt-0 pt-4 lg:pt-15">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
        <div className="mb-7 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3.11826 15.4622C4.11794 16.6668 5.97853 16.6668 9.69971 16.6668H10.3007C14.0219 16.6668 15.8825 16.6668 16.8821 15.4622M3.11826 15.4622C2.11857 14.2577 2.46146 12.429 3.14723 8.77153C3.63491 6.17055 3.87875 4.87006 4.8045 4.10175M3.11826 15.4622C3.11826 15.4622 3.11826 15.4622 3.11826 15.4622ZM16.8821 15.4622C17.8818 14.2577 17.5389 12.429 16.8532 8.77153C16.3655 6.17055 16.1216 4.87006 15.1959 4.10175M16.8821 15.4622C16.8821 15.4622 16.8821 15.4622 16.8821 15.4622ZM15.1959 4.10175C14.2701 3.33345 12.947 3.33345 10.3007 3.33345H9.69971C7.0534 3.33345 5.73025 3.33345 4.8045 4.10175M15.1959 4.10175C15.1959 4.10175 15.1959 4.10175 15.1959 4.10175ZM4.8045 4.10175C4.8045 4.10175 4.8045 4.10175 4.8045 4.10175Z" stroke="#3C50E0" strokeWidth="1.5" />
                <path d="M7.64258 6.66678C7.98578 7.63778 8.91181 8.33345 10.0003 8.33345C11.0888 8.33345 12.0149 7.63778 12.3581 6.66678" stroke="#3C50E0" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Minggu Ini
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">Produk Baru</h2>
          </div>
          <Link href="/shop-with-sidebar" className="inline-flex font-medium text-custom-sm py-2.5 px-7 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-blue hover:text-white hover:border-blue">
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
                <ProductItem item={item} />
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">Produk sedang disiapkan...</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewArrival;
