import React from "react";
import Skeleton from "./Skeleton";

const BlogSkeleton = () => {
  return (
    <div className="shadow-1 bg-white rounded-xl px-4 sm:px-5 pt-5 pb-4">
      <div className="rounded-md overflow-hidden block relative aspect-[330/210]">
        <Skeleton className="w-full h-full" />
      </div>

      <div className="mt-5.5">
        <span className="flex items-center gap-3 mb-2.5">
          <Skeleton className="w-20 h-4" variant="text" />
          <span className="block w-px h-4 bg-gray-4"></span>
          <Skeleton className="w-16 h-4" variant="text" />
        </span>

        <div className="mb-4">
          <Skeleton className="w-full h-6 mb-2" variant="text" />
          <Skeleton className="w-3/4 h-6" variant="text" />
        </div>

        <Skeleton className="w-32 h-6" variant="text" />
      </div>
    </div>
  );
};

export default BlogSkeleton;
