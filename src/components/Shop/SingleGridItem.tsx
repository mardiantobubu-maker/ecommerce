"use client";
import React from "react";
import { Product } from "@/types/product";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { updateQuickView } from "@/redux/features/quickView-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { updateproductDetails } from "@/redux/features/product-details";
import Link from "next/link";
import Image from "next/image";
import { calculateKodiPrice, formatRupiah } from "@/utils/kodiPricing";

const SingleGridItem = ({ item, priority = false }: { item: Product; priority?: boolean }) => {
  const { openModal } = useModalContext();

  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isWishlisted = wishlistItems.some((wItem) => wItem.id === item.id);

  // update the QuickView state
  const handleQuickViewUpdate = () => {
    dispatch(updateQuickView({ ...item }));
  };

  // add to cart
  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 20,
      })
    );
  };
  
  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleItemToWishList = () => {
    if (isWishlisted) {
      dispatch(removeItemFromWishlist(item.id));
    } else {
      dispatch(
        addItemToWishlist({
          ...item,
          status: "available",
          quantity: 1,
        })
      );
    }
  };

  return (
    <div className="group bg-white transition-all hover:shadow-xl rounded-[10px] p-3 pb-6 border border-transparent hover:border-gray-100">
      <div className="relative aspect-square w-full bg-white rounded-[8px] mb-4">
        <Link
            href={`/shop-details?id=${item.id}`}
          onClick={handleProductDetails}
          className="w-full h-full flex items-center justify-center"
        >
          <Image 
            src={item.imgs.previews[0]} 
            alt={item.title} 
            width={400} 
            height={400} 
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
            className="object-contain"
          />
        </Link>

        {/* Action Buttons on Hover */}
        <div className="absolute inset-x-5 bottom-12 flex items-center justify-center gap-1 opacity-0 translate-y-3 ease-out duration-500 group-hover:opacity-100 group-hover:translate-y-0 z-20">
          {/* Quick View / Eye Button */}
          <button
            onClick={() => {
              openModal();
              handleQuickViewUpdate();
            }}
            id="newOne"
            aria-label="button for quick view"
            className="flex items-center justify-center w-10 h-10 shrink-0 rounded-full shadow-lg bg-white text-dark hover:bg-gray-100 transition-all border border-gray-3/30"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Pilih Ukuran Button */}
          <Link
            href={`/shop-details?id=${item.id}`}
            onClick={handleProductDetails}
            className="flex-1 inline-flex justify-center items-center font-extrabold text-[12px] h-11 px-2 rounded-full bg-blue text-white shadow-lg hover:bg-blue-dark transition-all uppercase tracking-tight whitespace-nowrap"
          >
            Pilih Ukuran
          </Link>

          {/* Wishlist / Love Button */}
          <button
            onClick={() => handleItemToWishList()}
            aria-label="button for favorite select"
            className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-full shadow-lg transition-all border ${
              isWishlisted 
                ? "bg-red text-white hover:bg-red-dark border-red/10" 
                : "bg-white text-dark hover:bg-gray-100 border-gray-3/30"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="px-2">
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => {
              const currentRating = item.reviews > 0 ? Math.round(item.rating || 0) : 0;
              return (
                <span key={i} className={`text-[12px] ${i < currentRating ? "text-[#FFA645]" : "text-[#9CA3AF]"}`}>
                  ★
                </span>
              );
            })}
          </div>
          <p className="text-[12px] font-bold text-dark">{item.reviews > 0 ? (item.rating || 0) : 0}</p>
          <p className="text-[12px] text-gray-400">({item.reviews || 0})</p>
        </div>

        <h3 className="font-semibold text-[21px] text-dark leading-tight mb-2 line-clamp-2 min-h-[3rem]">
          <Link href={`/shop-details?id=${item.id}`} onClick={handleProductDetails} className="hover:text-blue transition-colors">
            {item.title}
          </Link>
        </h3>

        <div className="flex flex-col gap-1 mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-blue font-bold text-[22px]">{formatRupiah(calculateKodiPrice(item.discountedPrice))}</span>
            <span className="text-[14px] text-blue font-medium uppercase tracking-tighter">/ Kodi</span>
          </div>
          <div className="flex items-center gap-2 text-[14px]">
            <span className="text-[#212121] line-through">{formatRupiah(item.price)}</span>
            <span className="text-green font-bold">Hemat {formatRupiah((item.price - item.discountedPrice) * 20)}/Kodi</span>
          </div>
        </div>
      </div>

      {/* Variants Display */}
      <div className="px-2">
        <div className="flex flex-col gap-3 mb-4">
          {(item as any).colors && (Array.isArray((item as any).colors) ? (item as any).colors.length > 0 : (item as any).colors) && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-dark/70 uppercase tracking-wider shrink-0">WARNA</span>
              <div className="flex flex-wrap items-center gap-1.5 overflow-hidden">
                {(Array.isArray((item as any).colors) ? (item as any).colors : (typeof (item as any).colors === "string" ? (item as any).colors.split(/[;,]/) : [])).slice(0, 2).map((c: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-blue/5 text-[12px] font-bold text-blue border border-blue/20 capitalize">
                    {c.trim()}
                  </span>
                ))}
                {(Array.isArray((item as any).colors) ? (item as any).colors : (typeof (item as any).colors === "string" ? (item as any).colors.split(/[;,]/) : [])).length > 2 && (
                  <span className="text-[12px] font-bold text-gray-400 self-center">
                    +{(Array.isArray((item as any).colors) ? (item as any).colors : (typeof (item as any).colors === "string" ? (item as any).colors.split(/[;,]/) : [])).length - 2}
                  </span>
                )}
              </div>
            </div>
          )}
          {item.gender && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-dark/70 uppercase tracking-wider shrink-0">GENDER</span>
              <span className="px-2.5 py-1 rounded-md bg-blue/5 text-[12px] font-bold text-blue border border-blue/20 capitalize w-fit">
                {item.gender}
              </span>
            </div>
          )}
          {(item as any).sizes && (Array.isArray((item as any).sizes) ? (item as any).sizes.length > 0 : (item as any).sizes) && (
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-dark/70 uppercase tracking-wider shrink-0">UKURAN</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {(Array.isArray((item as any).sizes) ? (item as any).sizes : (typeof (item as any).sizes === "string" ? (item as any).sizes.split(/[;,]/) : [])).slice(0, 4).map((s: string, i: number) => (
                  <span 
                    key={i} 
                    className="px-2.5 py-1 rounded-md bg-blue/5 text-[11px] sm:text-[12px] font-bold text-blue border border-blue/20 uppercase min-w-[32px] sm:min-w-[36px] text-center hover:bg-blue/10 transition-all duration-200"
                  >
                    {s.trim()}
                  </span>
                ))}
                {(Array.isArray((item as any).sizes) ? (item as any).sizes : (typeof (item as any).sizes === "string" ? (item as any).sizes.split(/[;,]/) : [])).length > 4 && (
                  <span className="text-[11px] sm:text-[12px] font-bold text-gray-400 self-center px-1">
                    +{(Array.isArray((item as any).sizes) ? (item as any).sizes : (typeof (item as any).sizes === "string" ? (item as any).sizes.split(/[;,]/) : [])).length - 4}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-start mt-4">
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-[14px] font-bold ${item.stock && item.stock >= 20 ? 'bg-green/10 text-green' : 'bg-red/10 text-red'}`}>
            {item.stock && item.stock < 20 ? (item.stock === 0 ? 'Stok: 0 Kodi' : `Stok Terbatas: < 1 Kodi`) : `Stok: ${Math.floor((item.stock || 0) / 20)} Kodi`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SingleGridItem;
