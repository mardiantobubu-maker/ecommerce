import React from "react";
import Image from "next/image";

const featureData = [
  {
    img: "/images/icons/icon-01.svg",
    title: "Gratis Ongkir",
    description: "Pesanan di atas Rp1.000.000",
  },
  {
    img: "/images/icons/icon-02.svg",
    title: "Garansi Retur",
    description: "Tukar ukuran dalam 7 hari",
  },
  {
    img: "/images/icons/icon-03.svg",
    title: "Pembayaran Aman",
    description: "Jaminan 100% aman",
  },
  {
    img: "/images/icons/icon-04.svg",
    title: "Layanan Pelanggan",
    description: "Respon cepat & ramah",
  },
];

const HeroFeature = () => {
  return (
    <div className="max-w-[1060px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0 overflow-x-hidden">
      <div className="flex overflow-x-auto no-scrollbar items-center gap-8 xl:gap-12.5 mt-10 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
        {featureData.map((item, key) => (
          <div className="flex items-center gap-4 min-w-[200px] sm:min-w-fit snap-center flex-shrink-0" key={key}>
            <div className="w-12 h-12 flex-shrink-0">
              <Image src={item.img} alt="icons" width={40} height={41} className="w-full h-full object-contain" />
            </div>

            <div className="whitespace-nowrap">
              <h3 className="font-bold text-base text-dark">{item.title}</h3>
              <p className="text-sm text-[#212121]">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HeroFeature;
