import React from "react";
import Skeleton from "./Skeleton";

const HeroSkeleton = () => {
  return (
    <section className="pt-[170px] px-0 pb-[16px] sm:pt-[100px] lg:pt-[160px] xl:pt-[190px] bg-white">
      <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0 overflow-x-hidden">
        <div className="flex flex-col lg:flex-row gap-5 items-stretch lg:h-[480px]">
          
          {/* Mobile + Tablet Skeleton (< lg) */}
          <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-5 -mx-4 px-4 pb-4">
            {/* Main Carousel Skeleton */}
            <div className="min-w-[85%] sm:min-w-[60%] relative rounded-[10px] bg-white overflow-hidden shadow-sm border border-gray-3 h-[300px] sm:h-[400px]">
              <Skeleton className="w-full h-full" />
            </div>
            {/* Sidebar Top Skeleton */}
            <div className="min-w-[85%] sm:min-w-[60%] h-[300px] sm:h-[400px] relative rounded-[10px] shadow-sm border border-gray-3 overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
            {/* Sidebar Bottom Skeleton */}
            <div className="min-w-[85%] sm:min-w-[60%] h-[300px] sm:h-[400px] relative rounded-[10px] shadow-sm border border-gray-3 overflow-hidden">
              <Skeleton className="w-full h-full" />
            </div>
          </div>

          {/* Desktop Layout Skeleton (lg+) */}
          <div className="hidden lg:flex flex-1 flex-row gap-5 h-[480px]">
            {/* Main Carousel Skeleton */}
            <div className="w-[65%] relative z-1 rounded-[10px] bg-white overflow-hidden h-full shadow-sm border border-gray-3 p-8 lg:p-10 flex items-center justify-between gap-10">
              <div className="flex-1 flex flex-col gap-5">
                <Skeleton className="w-28 h-6 mb-2" variant="text" />
                <div className="space-y-3">
                  <Skeleton className="w-[90%] h-8 sm:h-10" variant="text" />
                  <Skeleton className="w-[75%] h-8 sm:h-10" variant="text" />
                </div>
                <Skeleton className="w-[60%] h-5 mt-2" variant="text" />
                <Skeleton className="w-44 h-12 mt-6 rounded-xl" />
              </div>
              <div className="w-[45%] h-[85%] flex-shrink-0">
                <Skeleton className="w-full h-full rounded-[10px]" />
              </div>
            </div>
            
            {/* Sidebar Skeletons */}
            <div className="w-[35%] flex flex-col gap-5 h-full">
              {[1, 2].map((idx) => (
                <div key={idx} className="flex-1 relative rounded-[10px] p-5 lg:p-6 xl:p-8 flex items-center justify-between gap-6 shadow-sm border border-gray-3 overflow-hidden">
                  <div className="flex-1 flex flex-col gap-4">
                    <Skeleton className="w-[85%] h-6" variant="text" />
                    <Skeleton className="w-[60%] h-4" variant="text" />
                    <Skeleton className="w-24 h-8 mt-1" variant="text" />
                  </div>
                  <div className="w-[40%] h-[90%] flex-shrink-0 py-2">
                    <Skeleton className="w-full h-full rounded-[10px]" />
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

export default HeroSkeleton;
