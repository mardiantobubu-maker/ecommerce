import React from "react";
import Skeleton from "@/components/Common/Skeleton";
import Breadcrumb from "@/components/Common/Breadcrumb";

const ContactSkeleton = () => {
  return (
    <>
      <Breadcrumb title={"Kontak"} pages={["kontak"]} />

      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar Skeleton */}
            <div className="w-full xl:w-[350px] flex-shrink-0">
              <div className="bg-white rounded-xl shadow-1 border border-gray-3 p-6 sm:p-8">
                <Skeleton className="w-40 h-8 mb-4" />
                <Skeleton className="w-full h-4 mb-8" />
                
                <div className="flex flex-col gap-6">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="flex items-center gap-4">
                      <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
                      <Skeleton className="w-full h-5" />
                    </div>
                  ))}
                </div>

                <Skeleton className="w-full h-12 mt-8 rounded-md" />
                
                <div className="mt-8 p-5 rounded-xl border border-gray-3">
                  <div className="flex items-start gap-4 mb-4">
                    <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                    <div>
                      <Skeleton className="w-32 h-5 mb-2" />
                      <Skeleton className="w-24 h-4" />
                    </div>
                  </div>
                  <Skeleton className="w-full h-4 mb-2" />
                  <Skeleton className="w-full h-4 mb-6" />
                  <Skeleton className="w-full h-12 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Content Area Skeleton */}
            <div className="flex-1 flex flex-col gap-7.5">
              {/* Contact Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white p-6 rounded-xl shadow-1 border border-gray-3 flex flex-col items-center text-center">
                    <Skeleton className="w-12 h-12 rounded-full mb-4" />
                    <Skeleton className="w-24 h-6 mb-2" />
                    <Skeleton className="w-32 h-4" />
                  </div>
                ))}
              </div>

              {/* Form Area Skeleton */}
              <div className="bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-10">
                <div className="mb-8">
                  <Skeleton className="w-48 h-8 mb-3" />
                  <Skeleton className="w-3/4 h-5" />
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <Skeleton className="w-24 h-5 mb-2.5" />
                    <Skeleton className="w-full h-12 rounded-md" />
                  </div>
                  <div className="w-full">
                    <Skeleton className="w-32 h-5 mb-2.5" />
                    <Skeleton className="w-full h-12 rounded-md" />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
                  <div className="w-full">
                    <Skeleton className="w-16 h-5 mb-2.5" />
                    <Skeleton className="w-full h-12 rounded-md" />
                  </div>
                  <div className="w-full">
                    <Skeleton className="w-20 h-5 mb-2.5" />
                    <Skeleton className="w-full h-12 rounded-md" />
                  </div>
                </div>

                <div className="mb-7.5">
                  <Skeleton className="w-16 h-5 mb-2.5" />
                  <Skeleton className="w-full h-32 rounded-md" />
                </div>

                <Skeleton className="w-40 h-12 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ContactSkeleton;
