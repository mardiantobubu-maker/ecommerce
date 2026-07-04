import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeItemFromCart, updateCartItemQuantity } from "@/redux/features/cart-slice";
import Image from "next/image";
import Link from "next/link";
import { useCartSync } from "@/hooks/useCartSync";
import { formatKodiSummary, formatRupiah } from "@/utils/kodiPricing";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const SingleItem = ({ item, removeItemFromCart }) => {
  const [showDetails, setShowDetails] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { closeCartModal } = useCartModalContext();
  const { syncCartItemToSupabase } = useCartSync();

  const handleRemoveFromCart = () => {
    dispatch(removeItemFromCart({ 
      id: item.id, 
      color: item.color, 
      sleeve: item.sleeve, 
      fit: item.fit 
    }));
    syncCartItemToSupabase(item, true);
  };

    // In B2B flow, all uniform items (SMP, Celana, Seragam) are treated as wholesale/kodi items
    const isWholesale = item.title?.includes("Seragam") || 
                       item.title?.includes("SMP") || 
                       item.title?.includes("Celana") ||
                       (item.quantity >= 20 && item.quantity % 20 === 0);
    
    // Correct image logic for specific products
    const displayImage = (item.title?.includes("SMP") || item.title?.includes("Celana"))
      ? "/images/products/seragam-smp.png" 
      : (item.image_url || item.imgs?.thumbnails?.[0] || "/images/products/seragam-smp.png");

  return (
    <div className="flex items-center justify-between gap-4 group p-4 bg-white rounded-2xl border border-gray-2 hover:border-blue/20 hover:shadow-md transition-all duration-300">
      <div className="w-full flex items-center gap-4">
        {/* Image with better container */}
        <div className="flex items-center justify-center rounded-xl bg-gray-1 border border-gray-2 w-20 h-20 overflow-hidden shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
          <Image 
            src={displayImage} 
            alt="product" 
            width={80} 
            height={80} 
            className="object-contain p-1"
          />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-dark text-base mb-1 transition-colors hover:text-blue line-clamp-1">
            <Link href={`/shop-details?id=${item.id}`} onClick={() => closeCartModal()}> {item.title || "Produk"} </Link>
          </h3>
          
          <div className="flex items-baseline gap-1.5 mb-2">
            <p className="text-blue font-black text-base">
              {isWholesale && item.quantity >= 20
                ? `${formatRupiah(item.discountedPrice * 20)} / Kodi` 
                : formatRupiah(item.discountedPrice)}
            </p>
          </div>

          {/* <!-- B2B Quantity & Variant Badges --> */}
          <div className="flex flex-col gap-2">
            <div className="flex flex-row items-center gap-1.5 flex-wrap">
              <div className={`inline-flex items-center px-2 py-1 rounded-md w-fit ${item.quantity >= 20 ? 'bg-blue/5 border border-blue/10' : 'bg-orange/5 border border-orange/10'}`}>
                <span className={`text-xs font-black uppercase tracking-wider ${item.quantity >= 20 ? 'text-blue' : 'text-orange'}`}>
                  {item.quantity >= 20 
                    ? `${Math.floor(item.quantity / 20)} KODI` 
                    : `${item.quantity} UNIT`}
                </span>
              </div>
              {(item.sleeve || item.color) && (
                <div className="inline-flex items-center px-2 py-1 bg-gray-1 border border-gray-2 rounded-md w-fit">
                  <span className="text-xs font-bold uppercase tracking-wider text-dark-4">
                    {[item.color, item.sleeve].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
            </div>

            {item.variantBreakdown && (
              <div className="relative">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-xs font-black text-blue hover:text-blue-dark flex items-center gap-1 mt-0.5 transition-colors uppercase tracking-widest"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Detail Varian
                </button>

                {showDetails && (
                  <>
                    <div 
                      className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px]" 
                      onClick={() => setShowDetails(false)}
                    ></div>
                    <div className="fixed sm:absolute z-[1000] left-1/2 top-1/2 sm:top-full sm:left-0 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-3 w-[85%] sm:w-[240px] p-5 bg-white rounded-2xl shadow-2xl border border-gray-2 animate-fadeIn origin-center sm:origin-top-left">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-1 pb-2">
                        <p className="text-xs font-black text-dark uppercase tracking-widest">Rincian Varian</p>
                        <button onClick={() => setShowDetails(false)} className="text-dark-4 hover:text-dark p-1" aria-label="Tutup Rincian Varian">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div className="text-sm font-medium text-[#212121] leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-2">
                        {formatKodiSummary(item.variantBreakdown)}
                      </div>
                      <div className="hidden sm:block absolute -top-2 left-4 w-4 h-4 bg-white border-l border-t border-gray-2 rotate-45"></div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Stacked on the right */}
        <div className="flex flex-col items-center justify-between gap-6 h-full py-1">
          <button
            onClick={handleRemoveFromCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-red/5 text-red hover:bg-red hover:text-white transition-all duration-300"
            aria-label="Remove item"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
