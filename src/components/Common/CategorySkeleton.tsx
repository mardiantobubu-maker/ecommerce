import React from "react";
import Skeleton from "./Skeleton";

const CategorySkeleton = () => {
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <Skeleton variant="circle" className="w-20 h-20 lg:w-24 lg:h-24 mb-4" />
      <Skeleton variant="text" className="w-16 h-4" />
    </div>
  );
};

export default CategorySkeleton;
