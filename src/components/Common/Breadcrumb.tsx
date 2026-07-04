import Link from "next/link";
import React from "react";

const Breadcrumb = ({ title, pages, maxW = "max-w-[1280px]" }) => {
  return (
    <>
      {/* Mobile Spacer */}
      <div className="block sm:hidden h-[165px] bg-white"></div>
      
      <div className="hidden sm:block overflow-hidden bg-white border-b border-gray-3 pt-[170px] px-0 pb-[16px] sm:pt-[155px] lg:pt-[95px] xl:pt-[165px]">
        <div className={`${maxW} w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0 py-2.5 xl:py-10`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="font-semibold text-dark text-base sm:text-2xl xl:text-custom-2">
              {title}
            </h1>

            <ul className="hidden sm:flex items-center gap-2">
              <li className="text-custom-sm hover:text-blue">
                <Link href="/">Beranda /</Link>
              </li>

              {pages.length > 0 &&
                pages.map((page, key) => (
                  <li className="text-custom-sm last:text-blue capitalize" key={key}>
                    {page} 
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Breadcrumb;
