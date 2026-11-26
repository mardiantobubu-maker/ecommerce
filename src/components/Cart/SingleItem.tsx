"use client";
import { removeItemFromCart, updateCartItemQuantity } from "@/redux/features/cart-slice";
import Link from "next/link";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useCartSync } from "@/hooks/useCartSync";
import Image from "next/image";
import { formatKodiSummary, calculateKodiPrice, formatRupiah, KODI_SIZE } from "@/utils/kodiPricing";

const SingleItem = ({ item }: { item: any }) => {
  const [showDetails, setShowDetails] = useState(false);
  const dispatch = useDispatch();
  const { syncCartItemToSupabase } = useCartSync();

  const handleRemove = async () => {
    const removePayload = {
      id: item.id,
      color: item.color,
      sleeve: item.sleeve,
      fit: item.fit
    };
    dispatch(removeItemFromCart(removePayload));
    await syncCartItemToSupabase(item, true);
  };

  const handleUpdateQuantity = async (newTotalPcs: number) => {
    // Force minimum 1 Kodi (20 pcs)
    const validTotalPcs = Math.max(KODI_SIZE, newTotalPcs);
    
    // Maintain variant distribution when scaling quantity
    const ratio = validTotalPcs / (item.quantity || KODI_SIZE);
    const newBreakdown = { ...(item.variantBreakdown || {}) };
    
    // If breakdown is empty, initialize it? (Usually handled in PDP)
    Object.keys(newBreakdown).forEach(key => {
      newBreakdown[key] = Math.round(newBreakdown[key] * ratio);
    });

    const updatePayload = {
      id: item.id,
      quantity: validTotalPcs,
      color: item.color,
      sleeve: item.sleeve,
      fit: item.fit,
      variantBreakdown: newBreakdown
    };
    
    dispatch(updateCartItemQuantity(updatePayload));
    await syncCartItemToSupabase({ ...item, quantity: validTotalPcs, variantBreakdown: newBreakdown });
  };

  const kodiPrice = calculateKodiPrice(item.discountedPrice);
  const totalKodi = Math.max(1, Math.floor((item.quantity || 0) / KODI_SIZE));

  // Correct image logic for specific products
  const displayImage = item.title.includes("SMP") 
    ? "/images/products/seragam-smp.png" 
    : (item.imgs?.thumbnails?.[0] || "/images/products/seragam-smp.png");

  return (
    <div className="py-4 md:py-6 px-0 md:px-7.5 border-b border-gray-3 last:border-b-0 animate-fadeIn bg-white transition-colors">
      {/* Mobile Modern Card Layout */}
      <div className="block md:hidden mx-4 p-5 rounded-2xl border border-gray-2 shadow-sm bg-white hover:shadow-md transition-shadow">
        <div className="flex gap-4 relative">
          {/* Image */}
          <div className="w-20 h-20 rounded-xl border border-gray-2 p-1.5 bg-gray-1 flex-shrink-0">
            <Image
              src={displayImage}
              alt="product"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Title & Delete */}
          <div className="flex-1 pr-8">
            <h4 className="text-dark font-bold text-[16px] leading-tight line-clamp-2">
              <Link href={`/shop-details?id=${item.id}`}>{item.title}</Link>
            </h4>
            <div className="flex gap-2 mt-1">
              {(item.color || item.sleeve) && (
                <span className="bg-blue/5 text-blue border border-blue/10 text-[12px] font-black uppercase px-2.5 py-1 rounded-md">
                  {[item.color, item.sleeve].filter(Boolean).join(' ')}
                </span>
              )}
            </div>
            {item.variantBreakdown && (
              <div className="mt-2 relative">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[14px] font-bold text-blue hover:underline flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Lihat Detail
                </button>
                {showDetails && (
                  <>
                    <div className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px]" onClick={() => setShowDetails(false)}></div>
                    <div className="fixed sm:absolute z-[1000] left-1/2 top-1/2 sm:top-full sm:left-0 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-1 w-[90%] sm:w-[280px] p-6 bg-white rounded-2xl shadow-2xl border border-gray-2 animate-fadeIn origin-center sm:origin-top-left">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-1 pb-3">
                        <p className="text-[12px] font-black text-dark uppercase tracking-widest">Rincian Varian</p>
                        <button onClick={() => setShowDetails(false)} className="text-dark-4 hover:text-dark p-1">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div className="text-[14px] font-medium text-dark-4 leading-relaxed bg-gray-2/50 p-4 rounded-xl border border-gray-2">
                        {formatKodiSummary(item.variantBreakdown)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          <button onClick={handleRemove} className="absolute -top-1 -right-1 text-dark-4 hover:text-red p-2 bg-red/5 rounded-full transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
        </div>

        {/* Pricing & Quantity Rows (Stacked for Mobile) */}
        <div className="mt-5 flex flex-col gap-4">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-dark-4 uppercase tracking-widest opacity-60">Harga Per Kodi</span>
            <p className="text-dark font-black text-base">{formatRupiah(kodiPrice)}</p>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-2 flex items-center justify-between">
            <span className="text-[10px] font-black text-dark-4 uppercase tracking-widest opacity-60">Jumlah Pesanan</span>
            <div className="flex flex-col items-end">
              <div className="flex items-center bg-white border border-gray-3 rounded-full overflow-hidden shadow-sm h-9">
                <button onClick={() => handleUpdateQuantity(item.quantity - KODI_SIZE)} className={`px-3 text-lg ${totalKodi <= 1 ? 'text-gray-3' : 'text-dark font-black'}`} disabled={totalKodi <= 1}>-</button>
                <div className="px-2 text-center border-x border-gray-2 min-w-[50px] flex flex-col justify-center">
                  <span className="text-dark font-black text-sm">{totalKodi}</span>
                  <span className="text-[7px] font-black text-dark-4 uppercase tracking-tighter">Kodi</span>
                </div>
                <button onClick={() => handleUpdateQuantity(item.quantity + KODI_SIZE)} className="px-3 text-dark font-black text-lg">+</button>
              </div>
              <p className="text-[8px] font-bold text-dark-4 mt-1 uppercase tracking-tighter">Total {totalKodi} Kodi</p>
            </div>
          </div>
        </div>

        {/* Subtotal Footer */}
        <div className="mt-4 pt-3 border-t border-dashed border-gray-3 flex items-center justify-between">
          <span className="text-[10px] font-black text-blue uppercase tracking-widest opacity-70">Subtotal</span>
          <p className="text-blue font-black text-lg">{formatRupiah(kodiPrice * totalKodi)}</p>
        </div>
      </div>

      {/* Desktop Layout (Refined Left Alignment) */}
      <div className="hidden md:grid md:grid-cols-[1.5fr_1fr_1.2fr_1fr_0.5fr] items-center w-full gap-4">
        {/* Product Column */}
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl border-2 border-gray-2 p-2 bg-white flex-shrink-0 overflow-hidden shadow-sm">
            <Image
              src={displayImage}
              alt="product"
              width={80}
              height={80}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-left">
            <h4 className="text-dark font-bold text-[16px] hover:text-blue transition-colors leading-snug">
              <Link href={`/shop-details?id=${item.id}`}>{item.title}</Link>
            </h4>
            <div className="flex gap-2 mt-1.5">
              {(item.color || item.sleeve) && (
                <span className="bg-blue/5 text-blue border border-blue/10 text-[12px] font-black uppercase px-2 py-0.5 rounded">
                  {[item.color, item.sleeve].filter(Boolean).join(' ')}
                </span>
              )}
            </div>
            {item.variantBreakdown && (
              <div className="mt-2 relative">
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-[14px] font-bold text-blue hover:underline flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  Lihat Detail Varian
                </button>
                {showDetails && (
                  <>
                    <div className="fixed inset-0 z-[999] bg-black/20 backdrop-blur-[2px]" onClick={() => setShowDetails(false)}></div>
                    <div className="fixed sm:absolute z-[1000] left-1/2 top-1/2 sm:top-full sm:left-0 -translate-x-1/2 -translate-y-1/2 sm:translate-y-0 mt-0 sm:mt-1 w-[90%] sm:w-[280px] p-6 bg-white rounded-2xl shadow-2xl border border-gray-2 animate-fadeIn origin-center sm:origin-top-left">
                      <div className="flex justify-between items-center mb-3 border-b border-gray-1 pb-3">
                        <p className="text-[12px] font-black text-dark uppercase tracking-widest">Rincian Varian</p>
                        <button onClick={() => setShowDetails(false)} className="text-dark-4 hover:text-dark p-1">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <div className="text-[14px] font-medium text-dark-4 leading-relaxed bg-gray-2/50 p-4 rounded-xl border border-gray-2">
                        {formatKodiSummary(item.variantBreakdown)}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Harga Column */}
        <div className="text-left">
          <p className="text-dark font-black text-base leading-tight">{formatRupiah(kodiPrice)}</p>
          <span className="text-[10px] font-bold text-dark-4 uppercase tracking-widest opacity-60">Per Kodi</span>
        </div>

        {/* Kuantitas Column */}
        <div className="text-left">
          <div className="flex items-center border-2 border-gray-3 rounded-xl overflow-hidden h-11 w-fit bg-white">
            <button onClick={() => handleUpdateQuantity(item.quantity - KODI_SIZE)} className={`px-4 text-lg ${totalKodi <= 1 ? 'text-gray-3 cursor-not-allowed' : 'text-dark font-black hover:bg-gray-2'}`} disabled={totalKodi <= 1}>-</button>
            <div className="px-5 text-center border-x-2 border-gray-3 min-w-[70px] bg-gray-50 flex flex-col justify-center">
              <p className="text-dark font-black text-base leading-none">{totalKodi}</p>
              <p className="text-[8px] font-black uppercase tracking-tighter mt-0.5">Kodi</p>
            </div>
            <button onClick={() => handleUpdateQuantity(item.quantity + KODI_SIZE)} className="px-4 text-lg font-black hover:bg-gray-2 text-dark">+</button>
          </div>
          <p className="text-[10px] font-bold text-dark-4 mt-2 ml-1 uppercase tracking-wide">Total {totalKodi} Kodi</p>
        </div>

        {/* Subtotal Column */}
        <div className="text-left">
          <p className="text-blue font-black text-lg leading-tight">{formatRupiah(kodiPrice * totalKodi)}</p>
          <span className="text-[10px] font-bold text-blue uppercase tracking-widest opacity-60">Subtotal</span>
        </div>

        {/* Aksi Column */}
        <div className="text-left">
          <button onClick={handleRemove} className="text-dark-4 hover:text-white hover:bg-red p-3 bg-gray-2 rounded-xl transition-all group">
            <svg className="group-hover:scale-110 transition-transform" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
