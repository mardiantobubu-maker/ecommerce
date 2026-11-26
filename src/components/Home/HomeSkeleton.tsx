import React from "react";
import HeroSkeleton from "@/components/Common/HeroSkeleton";
import CategorySkeleton from "@/components/Common/CategorySkeleton";
import ProductSkeleton from "@/components/Common/ProductSkeleton";
import Skeleton from "@/components/Common/Skeleton";

const HomeSkeleton = () => {
  return (
    <main>
      {/* Hero Section */}
      <HeroSkeleton />

      {/* Categories Section */}
      <section className="mt-0 pt-4 lg:pt-6 xl:pt-8">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0 pb-4 lg:pb-15 overflow-x-hidden">
          <div className="mb-4 lg:mb-10 flex items-center justify-between">
            <div>
              <Skeleton className="w-24 h-5 mb-2" variant="text" />
              <Skeleton className="w-48 h-8" variant="text" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="w-11 h-11 rounded-full" />
              <Skeleton className="w-11 h-11 rounded-full" />
            </div>
          </div>
          <div className="flex gap-4 md:gap-8 lg:gap-14 xl:gap-20 overflow-x-hidden pb-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="min-w-[140px] md:min-w-[160px] lg:min-w-[180px] flex-shrink-0">
                <CategorySkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="mt-0 pt-4 lg:pt-15">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <Skeleton className="w-24 h-5 mb-2" variant="text" />
              <Skeleton className="w-48 h-8" variant="text" />
            </div>
            <Skeleton className="w-32 h-10 rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-7">
            {Array(4).fill(0).map((_, i) => (
              <div key={i}>
                <ProductSkeleton />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomeSkeleton;
