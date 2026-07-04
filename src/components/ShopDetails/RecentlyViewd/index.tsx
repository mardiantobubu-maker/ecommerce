"use client";
import React from "react";
import ProductItem from "@/components/Common/ProductItem";
import Image from "next/image";
import ProductSkeleton from "@/components/Common/ProductSkeleton";
import Link from "next/link";
import PreLoader from "../../Common/PreLoader";
import { supabase } from "@/lib/supabase";
import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef, useEffect, useState } from "react";
import "swiper/css/navigation";
import "swiper/css";

const RecentlyViewdItems = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(8);

    if (data) {
      const mapped = data.map((item: any) => {
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
      setProducts(mapped);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const sliderRef = useRef(null);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    (sliderRef.current as any).swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  return (
    <section className="overflow-hidden mt-0 pt-[10px]">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0 pb-5 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* <!-- section title --> */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <Image
                  src="/images/icons/icon-05.svg"
                  width={17}
                  height={17}
                  alt="icon"
                />
                Rekomendasi
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                Produk Terkait
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                aria-label="Previous slide"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-3 bg-white text-dark hover:bg-blue hover:text-white hover:border-blue transition-all"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>

              <button
                onClick={handleNext}
                aria-label="Next slide"
                className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-3 bg-white text-dark hover:bg-blue hover:text-white hover:border-blue transition-all"
              >
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={1}
            spaceBetween={20}
            breakpoints={{
              450: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            className="justify-between"
          >
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <SwiperSlide key={i}>
                  <ProductSkeleton />
                </SwiperSlide>
              ))
            ) : products.map((item, key) => (
              <SwiperSlide key={key}>
                <ProductItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewdItems;
