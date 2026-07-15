import ImageWithSkeleton from "@/components/Common/ImageWithSkeleton";
import Link from "next/link";

const HeroCarousel = ({ banners = [], priority = true }: { banners?: any[], priority?: boolean }) => {
  const activeBanner = banners.length > 0 ? banners[0] : null;

  if (!activeBanner) {
    return (
      <div className="hero-static h-full">
        <div className="bg-white h-full pt-8 pb-3 px-6 sm:px-10 sm:py-10 lg:px-10 lg:py-12">
          <div className="flex flex-col-reverse sm:flex-row items-center justify-center sm:justify-between h-full gap-3 sm:gap-8">

            {/* Text Section */}
            <div className="w-full sm:flex-1 sm:min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-full text-center sm:text-left mb-4 sm:mb-0">
                {/* Desktop discount - above title */}
                <div className="hidden sm:flex items-center gap-2 mb-4">
                  <span className="block font-black text-heading-1 text-red leading-none">25%</span>
                  <span className="block text-dark text-custom-1 leading-tight uppercase font-bold opacity-50 tracking-wider">DISKON</span>
                </div>
                
                <h1 className="max-w-none font-bold text-dark text-[18px] sm:text-3xl lg:text-4xl mb-2 sm:mb-4 leading-tight">
                  <Link href="/shop-with-sidebar">Seragam Sekolah Kualitas Terbaik</Link>
                </h1>
                
                <div className="flex flex-col items-center sm:items-start">
                  <p className="text-[16px] sm:text-base lg:text-lg text-[#212121] opacity-60 mb-1 sm:mb-6 leading-normal">
                    Bahan premium nyaman dipakai seharian.
                  </p>
                  
                  {/* Mobile discount - now at the very bottom like sidebar */}
                  <div className="flex items-center justify-center gap-2 mt-1 sm:hidden">
                    <span className="font-bold text-xl text-red">25% DISKON</span>
                  </div>
                </div>
              </div>

              <Link
                href="/shop-with-sidebar"
                className="hidden sm:inline-flex font-bold text-white text-custom-sm rounded-md bg-blue py-3 px-9 ease-out duration-200 hover:bg-blue-dark mt-4"
              >
                Belanja Sekarang
              </Link>
            </div>

            {/* Image Section — prominent on mobile, fills remaining space on desktop */}
            <div className="relative w-full h-[180px] sm:flex-1 sm:h-full flex-shrink-0">
              <ImageWithSkeleton
                src="/images/hero/seragam-sekolah-kualitas-terbaik.png"
                alt="seragam sekolah kualitas terbaik"
                fill
                priority={priority}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 400px, 480px"
                quality={70}
                className="object-contain object-bottom transition-transform duration-500 relative z-10"
                skeletonClassName="rounded-[10px]"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-dynamic h-full" style={{ backgroundColor: activeBanner.bg_color || "#ffffff" }}>
      <div className="h-full pt-8 pb-3 px-6 sm:px-10 sm:py-10 lg:px-10 lg:py-12">
        <div className="flex flex-col-reverse sm:flex-row items-center justify-center sm:justify-between h-full gap-3 sm:gap-8">

          {/* Text Section */}
          <div className="w-full sm:flex-1 sm:min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="w-full text-center sm:text-left mb-4 sm:mb-0">
              {activeBanner.discount_text && (
                <div className="hidden sm:flex items-center gap-2 mb-4">
                  <span className="block font-black text-heading-2 text-red leading-none">
                    {activeBanner.discount_text.split(' ')[0]}
                  </span>
                  <span className="block text-dark text-custom-sm leading-tight uppercase font-black opacity-40 tracking-widest">
                    {activeBanner.discount_text.split(' ').slice(1).join(' ') || "PROMO"}
                  </span>
                </div>
              )}
              
              <h1 className="max-w-none font-black text-dark text-[18px] sm:text-3xl lg:text-4xl mb-2 sm:mb-4 leading-tight tracking-tight">
                <Link href={activeBanner.button_link || "/shop-with-sidebar"}>{activeBanner.title}</Link>
              </h1>
              
              <div className="flex flex-col items-center sm:items-start">
                <p className="text-[16px] sm:text-base lg:text-lg text-[#212121] opacity-60 mb-1 sm:mb-6 font-medium leading-normal">
                  {activeBanner.subtitle}
                </p>
                
                {activeBanner.discount_text && (
                  <div className="flex items-center justify-center gap-2 mt-1 sm:hidden">
                    <span className="font-bold text-xl text-red">{activeBanner.discount_text}</span>
                  </div>
                )}
              </div>
            </div>

            <Link
              href={activeBanner.button_link || "/shop-with-sidebar"}
              className="hidden sm:inline-flex font-bold text-white text-custom-sm rounded-xl bg-blue py-3 px-10 ease-out duration-300 hover:bg-blue-dark hover:shadow-lg hover:-translate-y-0.5 uppercase tracking-widest shadow-md mt-4"
            >
              {activeBanner.button_text || "Belanja Sekarang"}
            </Link>
          </div>

          {/* Image Section — prominent on mobile, fills remaining space on desktop */}
          <div className="relative w-full h-[180px] sm:flex-1 sm:h-full flex-shrink-0">
            {activeBanner.image_url && (
              <ImageWithSkeleton
                src={activeBanner.image_url}
                alt={activeBanner.title}
                fill
                priority={priority}
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 640px) 250px, (max-width: 1024px) 400px, 480px"
                quality={70}
                className="object-contain object-bottom transition-transform duration-700 hover:scale-105 relative z-10"
                skeletonClassName="rounded-[10px]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;
