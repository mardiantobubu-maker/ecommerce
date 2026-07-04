"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const PromoBanner = () => {
  const [banners, setBanners] = useState<any[]>([]);

  useEffect(() => {
    const fetchBanners = async () => {
      const { data } = await supabase
        .from('home_banners')
        .select('*')
        .order('id', { ascending: true });
      if (data) setBanners(data);
    };
    fetchBanners();
  }, []);

  if (banners.length === 0) return null;

  const bigBanner = banners.find(b => b.type === 'BIG') || banners[0];
  const smallBanner1 = banners.find(b => b.type === 'SMALL_1') || banners[1];
  const smallBanner2 = banners.find(b => b.type === 'SMALL_2') || banners[2];

  return (
    <section className="overflow-hidden mt-0 pt-4 pb-0 lg:py-20 bg-white">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* promo banner big */}
          <div 
            className="relative z-1 overflow-hidden rounded-[10px] py-12.5 lg:py-17.5 xl:py-22.5 px-4 sm:px-7.5 lg:px-14 xl:px-19 mb-7.5 flex flex-col-reverse sm:block shadow-sm border border-gray-3"
            style={{ backgroundColor: bigBanner?.bg_color || "#F5F5F7" }}
          >
            <div className="max-w-[550px] w-full relative z-10">
              <span className="block font-medium text-xl text-dark mb-3">
                {bigBanner?.title}
              </span>

              <h2 className="font-bold text-xl lg:text-heading-4 xl:text-heading-3 text-dark mb-5 uppercase">
                {bigBanner?.discount_text}
              </h2>

              <p className="text-[#212121]">
                {bigBanner?.subtitle}
              </p>



              <Link
                href={bigBanner?.button_link || "/shop-with-sidebar"}
                className="inline-flex font-medium text-custom-sm text-white bg-blue py-[11px] px-9.5 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
              >
                {bigBanner?.button_text}
              </Link>
            </div>

            <div className="relative sm:absolute sm:bottom-0 sm:right-4 lg:sm:right-10 z-0 sm:-z-1 mb-10 sm:mb-0 w-full sm:w-[450px] h-full flex items-center justify-center sm:justify-end">
              {bigBanner?.image_url && (
                <Image
                  src={bigBanner.image_url}
                  alt={bigBanner.title}
                  className="object-contain object-bottom"
                  width={450}
                  height={450}
                  style={{ width: "auto", height: "auto" }}
                />
              )}
            </div>
          </div>

          <div className="grid gap-7.5 grid-cols-2">
            {/* promo banner small 1 (Desktop) */}
            <div 
              className="relative z-1 overflow-hidden rounded-[10px] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10 flex flex-col sm:block shadow-sm border border-gray-3"
              style={{ backgroundColor: smallBanner1?.bg_color || "#DBF4F3" }}
            >
              <div className="relative sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:left-3 lg:sm:left-10 z-0 sm:-z-1 mt-6 sm:mt-0">
                {smallBanner1?.image_url && (
                  <Image
                    src={smallBanner1.image_url}
                    alt={smallBanner1.title}
                    className="mx-auto sm:mx-0"
                    width={200}
                    height={200}
                    style={{ width: "auto", height: "auto" }}
                  />
                )}
              </div>

              <div className="text-center sm:text-right relative z-10 max-w-[250px] sm:max-w-[280px] lg:max-w-[320px] ml-auto">
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanner1?.subtitle}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  {smallBanner1?.title}
                </h2>

                <p className="font-semibold text-custom-1 text-teal">
                  {smallBanner1?.discount_text}
                </p>

                <Link
                  href={smallBanner1?.button_link || "/shop-with-sidebar"}
                  className="inline-flex font-medium text-custom-sm text-white bg-teal py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-teal-dark mt-9"
                >
                  {smallBanner1?.button_text}
                </Link>
              </div>
            </div>

            {/* promo banner small 2 (Desktop) */}
            <div 
              className="relative z-1 overflow-hidden rounded-[10px] py-10 xl:py-16 px-4 sm:px-7.5 xl:px-10 flex flex-col sm:block shadow-sm border border-gray-3"
              style={{ backgroundColor: smallBanner2?.bg_color || "#FFECE1" }}
            >
              <div className="relative sm:absolute sm:top-1/2 sm:-translate-y-1/2 sm:right-3 lg:sm:right-8.5 z-0 sm:-z-1 mt-6 sm:mt-0">
                {smallBanner2?.image_url && (
                  <Image
                    src={smallBanner2.image_url}
                    alt={smallBanner2.title}
                    className="mx-auto sm:mx-0"
                    width={200}
                    height={200}
                    style={{ width: "auto", height: "auto" }}
                  />
                )}
              </div>

              <div className="relative z-10 max-w-[250px] sm:max-w-[280px] lg:max-w-[320px]">
                <span className="block text-lg text-dark mb-1.5">
                  {smallBanner2?.subtitle}
                </span>

                <h2 className="font-bold text-xl lg:text-heading-4 text-dark mb-2.5">
                  {smallBanner2?.title} <span className="text-orange text-[22px]">{smallBanner2?.discount_text}</span>
                </h2>

                <Link
                  href={smallBanner2?.button_link || "/shop-with-sidebar"}
                  className="inline-flex font-medium text-custom-sm text-white bg-orange py-2.5 px-8.5 rounded-md ease-out duration-200 hover:bg-orange-dark mt-7.5"
                >
                  {smallBanner2?.button_text}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Unified Mobile Swipe Carousel */}
        <div className="lg:hidden -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-4 snap-x snap-mandatory pb-4">
          {banners.map((item) => (
            <div 
              key={item.id} 
              className="min-w-[85%] snap-center relative z-1 overflow-hidden rounded-lg p-6 flex flex-col items-center text-center shadow-sm"
              style={{ backgroundColor: item.bg_color || "#F5F5F7" }}
            >
               <div className="relative z-10">
                  <span className="block text-sm text-dark mb-1 opacity-70">{item.subtitle}</span>
                  <h2 className="font-bold text-base text-dark mb-2 uppercase">{item.discount_text || item.title}</h2>
                  <p className="text-sm text-[#212121] line-clamp-2 mb-3">{item.subtitle}</p>
                  


                  <div className="flex justify-center mb-4">
                    <Link href={item.button_link || "/shop-with-sidebar"} className="inline-flex font-bold text-xs text-white bg-blue py-2.5 px-8 rounded-md shadow-md">{item.button_text}</Link>
                  </div>
               </div>
               <div className="relative w-full h-[180px] mt-2 overflow-hidden">
                  {item.image_url && (
                    <Image 
                      src={item.image_url} 
                      alt={item.title} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 350px"
                      className="object-contain object-center" 
                    />
                  )}
               </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;
