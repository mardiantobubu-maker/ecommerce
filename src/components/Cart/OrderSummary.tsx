"use client";
import { selectTotalKodi, selectTotalPrice } from "@/redux/features/cart-slice";
import { formatRupiah, getKodiDiscount } from "@/utils/kodiPricing";
import Link from "next/link";
import React from "react";
import { useAppSelector } from "@/redux/store";

const OrderSummary = ({ appliedCoupon, appliedCode }: any) => {
  const totalPrice = useAppSelector(selectTotalPrice);
  const totalKodi = useAppSelector(selectTotalKodi);
  
  const discountInfo = getKodiDiscount(totalKodi);
  const subtotalBeforeDiscount = totalPrice / (1 - (discountInfo?.discount || 0));

  return (
    <div className="w-full lg:max-w-[445px]">
      <div className="bg-white rounded-[10px] shadow-1 p-8">
        <h3 className="font-semibold text-dark text-xl mb-6">Ringkasan Pesanan</h3>

        <div className="space-y-4 mb-7.5 pb-7.5 border-b border-gray-3">
          <div className="flex items-center justify-between">
            <span className="text-dark-4 font-medium">Total Pesanan</span>
            <span className="text-dark font-bold">{totalKodi} Kodi</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-dark-4">Subtotal</span>
            <span className="text-dark font-medium">{formatRupiah(subtotalBeforeDiscount)}</span>
          </div>
          
          {discountInfo && (
            <div className="flex items-center justify-between text-orange">
              <span className="text-sm font-medium">Diskon Grosir ({discountInfo.label.split("→")[1].trim()})</span>
              <span className="font-medium">-{formatRupiah(subtotalBeforeDiscount * discountInfo.discount)}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="flex items-center justify-between text-green">
              <span className="text-sm font-medium">Kupon ({appliedCode})</span>
              <span className="font-medium">
                {appliedCoupon.type === "fixed" 
                  ? `-${formatRupiah(appliedCoupon.value)}` 
                  : `-${appliedCoupon.value}%`}
              </span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-dark-4">Pengiriman</span>
            <span className="text-green font-medium">Gratis</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-9">
          <span className="text-xl font-bold text-dark">Total Akhir</span>
          <span className="text-2xl font-bold text-blue">{formatRupiah(totalPrice)}</span>
        </div>

        <Link
          href="/checkout"
          className="w-full flex justify-center font-bold text-white bg-blue py-4 rounded-md hover:bg-blue-dark shadow-md transition-all uppercase tracking-wide"
        >
          Lanjut ke Pembayaran
        </Link>
        

      </div>
    </div>
  );
};

export default OrderSummary;
