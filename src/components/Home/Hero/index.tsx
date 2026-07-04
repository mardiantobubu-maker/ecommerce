import React from "react";
import HeroCarousel from "./HeroCarousel";
import Image from "next/image";
import Link from "next/link";

const Hero = ({ initialBanners = [] }: { initialBanners?: any[] }) => {
  const mainBanners = initialBanners.filter(b => b.type === 'HERO_MAIN');
  const sidebarTop = initialBanners.find(b => b.type === 'HERO_SIDEBAR_TOP');
  const sidebarBottom = initialBanners.find(b => b.type === 'HERO_SIDEBAR_BOTTOM');

  return (
    <section className="overflow-hidden pt-[170px] px-0 pb-[16px] sm:pt-[100px] lg:pt-[160px] xl:pt-[190px] bg-white">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:h-[480px]">
          {/* Mobile + Tablet Slider (< lg) */}
          <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-5 -mx-4 px-4 snap-x snap-mandatory pb-4">
            <div className="min-w-[85%] sm:min-w-[60%] snap-center relative rounded-[10px] bg-white overflow-hidden shadow-sm border border-gray-3 h-[300px] sm:h-[400px]">
              <HeroCarousel banners={mainBanners} />
            </div>
            <div
              className="min-w-[85%] sm:min-w-[60%] h-[300px] sm:h-[400px] snap-center relative rounded-[10px] pt-4 pb-3 px-6 flex flex-col justify-center shadow-sm border border-gray-3"
              style={{ backgroundColor: sidebarTop?.bg_color || "#ffffff" }}
            >
              <div className="flex flex-col-reverse items-center gap-3 h-full">
                <div className="text-center w-full">
                  <h2 className="font-semibold text-dark text-[18px] mb-2 line-clamp-2 leading-tight">
                    <Link href={sidebarTop?.button_link || "/shop-with-sidebar"}>{sidebarTop?.title || "Paket Seragam Lengkap"}</Link>
                  </h2>
                  <p className="font-medium text-[#212121] text-[16px] mb-1 opacity-70">{sidebarTop?.subtitle || "Promo Terbatas"}</p>
                  <span className="font-bold text-xl text-red">{sidebarTop?.discount_text || "Harga Spesial"}</span>
                </div>
                <div className="flex-1 w-full relative">
                  <Image src={sidebarTop?.image_url || "/images/products/terbaru-seragam-sd.png"} alt="promo" fill sizes="250px" className="object-contain object-bottom" />
                </div>
              </div>
            </div>
            <div
              className="min-w-[85%] sm:min-w-[60%] h-[300px] sm:h-[400px] snap-center relative rounded-[10px] pt-4 pb-3 px-6 flex flex-col justify-center shadow-sm border border-gray-3"
              style={{ backgroundColor: sidebarBottom?.bg_color || "#ffffff" }}
            >
              <div className="flex flex-col-reverse items-center gap-3 h-full">
                <div className="text-center w-full">
                  <span className="block font-medium text-[16px] text-[#212121] mb-2 uppercase tracking-wider opacity-60">{sidebarBottom?.subtitle || "Promo Seragam"}</span>
                  <h2 className="font-semibold text-dark text-[18px] mb-2 line-clamp-2 leading-tight">
                    <Link href={sidebarBottom?.button_link || "/shop-with-sidebar"}>{sidebarBottom?.title || "Seragam SMP & SMA"}</Link>
                  </h2>
                  <p className="font-medium text-[16px] text-[#212121] mb-1 opacity-70">Diskon Spesial</p>
                  <span className="font-bold text-xl text-red leading-none">{sidebarBottom?.discount_text || "20% OFF"}</span>
                </div>
                <div className="flex-1 w-full relative">
                  <Image src={sidebarBottom?.image_url || "/images/products/seragam-smp.png"} alt="promo" fill sizes="250px" className="object-contain object-bottom" />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout (lg+) */}
          <div className="hidden lg:flex flex-1 flex-row gap-5 h-[480px]">
            <div className="w-[65%] relative z-1 rounded-[10px] bg-white overflow-hidden h-full shadow-sm border border-gray-3">
              <HeroCarousel banners={mainBanners} />
            </div>
            <div className="w-[35%] flex flex-col gap-5 h-full">
              {[sidebarTop, sidebarBottom].map((item, idx) => (
                <div
                  key={idx}
                  className="flex-1 relative rounded-[10px] p-5 flex flex-col justify-center shadow-sm border border-gray-3 overflow-hidden"
                  style={{ backgroundColor: item?.bg_color || "#ffffff" }}
                >
                  <div className="flex items-center justify-between gap-2 h-full">
                    <div className="relative z-10 w-[60%]">
                      <h2 className="font-bold text-dark text-lg mb-2 leading-tight">
                        <Link href={item?.button_link || "#"}>{item?.title || "Promo Item"}</Link>
                      </h2>
                      <p className="font-medium text-[#212121] text-xs mb-1 opacity-70">{item?.subtitle || ""}</p>
                      <span className="font-black text-lg text-red">{item?.discount_text || ""}</span>
                    </div>
                    <div className="relative w-[40%] h-full">
                      <Image src={item?.image_url || "/images/products/terbaru-seragam-sd.png"} alt="promo" fill className="object-contain object-right" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
