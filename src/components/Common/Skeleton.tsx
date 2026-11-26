import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "rect" | "circle" | "text";
}

const Skeleton = ({ className = "", variant = "rect" }: SkeletonProps) => {
  const baseClasses = "relative overflow-hidden bg-gray-3/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";
  const variantClasses = {
    rect: "rounded-md",
    circle: "rounded-full",
    text: "rounded h-4 w-full",
  };

  return <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}></div>;
};

export default Skeleton;
