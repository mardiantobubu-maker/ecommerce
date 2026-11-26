import React from "react";
import Skeleton from "./Skeleton";

const ProductSkeleton = () => {
  return (
    <div className="bg-white rounded-[10px] p-4 border border-gray-3">
      {/* Image Section - Top */}
      <div className="relative aspect-square w-full mb-4">
        <Skeleton className="w-full h-full rounded-[8px]" />
      </div>

      {/* Text Info Section - Bottom */}
      <div className="p-4 text-left">
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <Skeleton className="w-20 h-4" variant="text" />
        </div>

        {/* Title */}
        <div className="mb-2 space-y-2">
          <Skeleton className="w-full h-6" variant="text" />
          <Skeleton className="w-2/3 h-6" variant="text" />
        </div>

        {/* Pricing */}
        <div className="flex flex-col gap-2 mb-3 mt-4">
          <Skeleton className="w-1/2 h-8" variant="text" />
          <Skeleton className="w-1/3 h-4" variant="text" />
        </div>

        {/* Variants Selection Labels */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="w-12 h-3" variant="text" />
            <Skeleton className="w-16 h-4" variant="text" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-12 h-3" variant="text" />
            <div className="flex gap-1">
              <Skeleton className="w-10 h-4" variant="text" />
              <Skeleton className="w-10 h-4" variant="text" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-12 h-3" variant="text" />
            <div className="flex gap-1">
              <Skeleton className="w-8 h-6" />
              <Skeleton className="w-8 h-6" />
              <Skeleton className="w-8 h-6" />
            </div>
          </div>
        </div>

        {/* Stock Badge */}
        <div className="flex justify-start mt-4">
          <Skeleton className="w-24 h-8 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
