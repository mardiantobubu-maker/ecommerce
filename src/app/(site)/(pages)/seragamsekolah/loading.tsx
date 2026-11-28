import React from "react";
import ProductSkeleton from "@/components/Common/ProductSkeleton";

export default function Loading() {
  return (
    <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-28 bg-[#f3f4f6]">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-7.5 gap-y-9 pt-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <ProductSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
