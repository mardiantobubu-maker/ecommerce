import { Category } from "@/types/category";
import React from "react";
import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item, isPriority }: { item: Category; isPriority?: boolean }) => {
  return (
    <Link 
      href={`/shop-with-sidebar?search=${item.title.replace(/\s+/g, '-')}`} 
      className="group flex flex-col items-center"
    >
      <div className="max-w-[130px] w-full bg-[#F2F3F8] h-32.5 rounded-full flex items-center justify-center mb-4 overflow-hidden">
        {item.img ? (
          <Image 
            src={item.img} 
            alt="" 
            width={82} 
            height={62} 
            style={{ width: "100%", height: "auto" }}
            priority={isPriority}
            sizes="(max-width: 768px) 82px, 100px"
            className="category-image group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-20 h-20 bg-blue/10 rounded-full flex items-center justify-center text-blue font-bold text-xl">
            {item.title?.charAt(0)}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <h3 className="inline-block font-medium text-center text-dark bg-gradient-to-r from-blue to-blue bg-[length:0px_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-500 hover:bg-[length:100%_3px] group-hover:bg-[length:100%_1px] group-hover:text-blue">
          {item.title}
        </h3>
      </div>
    </Link>
  );
};

export default SingleItem;
