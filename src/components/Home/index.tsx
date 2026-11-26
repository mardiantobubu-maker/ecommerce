"use client";
import React from "react";
import dynamic from "next/dynamic";
const Categories = dynamic(() => import("./Categories"), { ssr: true });
const NewArrival = dynamic(() => import("./NewArrivals"), { ssr: true });
const BestSeller = dynamic(() => import("./BestSeller"), { ssr: false });
const PromoBanner = dynamic(() => import("./PromoBanner"), { ssr: false });
const CounDown = dynamic(() => import("./Countdown"), { ssr: false });
const Testimonials = dynamic(() => import("./Testimonials"), { ssr: false });



const Home = ({ initialCategories, initialBestSellers, initialNewArrivals }: any) => {
  return (
    <main>
      <Categories initialCategories={initialCategories} />
      <NewArrival initialNewArrivals={initialNewArrivals} />
      <PromoBanner />
      <BestSeller initialBestSellers={initialBestSellers} />
      <CounDown />
      <Testimonials />

    </main>
  );
};

export default Home;
