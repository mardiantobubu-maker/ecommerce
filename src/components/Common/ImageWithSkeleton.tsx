"use client";
import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import Skeleton from "./Skeleton";

interface ImageWithSkeletonProps extends ImageProps {
  skeletonClassName?: string;
}

const ImageWithSkeleton = ({ skeletonClassName, className, ...props }: ImageWithSkeletonProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      {!isLoaded && (
        <div className={`absolute inset-0 z-0 ${skeletonClassName || ""}`}>
          <Skeleton className="w-full h-full" />
        </div>
      )}
      <Image
        {...props}
        className={`${className || ""} ${!isLoaded ? "opacity-0" : "opacity-100 transition-opacity duration-300"}`}
        onLoad={(e) => {
          setIsLoaded(true);
          if (props.onLoad) props.onLoad(e);
        }}
      />
    </>
  );
};

export default ImageWithSkeleton;
