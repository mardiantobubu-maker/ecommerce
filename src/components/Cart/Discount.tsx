"use client";
import React, { useState } from "react";

import { supabase } from "@/lib/supabase";
import { Spinner } from "../Common/PreLoader";

interface DiscountProps {
  onApplyDiscount: (discount: any, code: string) => void;
  appliedCode: string;
  onRemoveDiscount: () => void;
}

const Discount = ({ onApplyDiscount, appliedCode, onRemoveDiscount }: DiscountProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [appliedInfo, setAppliedInfo] = useState<any>(null);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!couponCode.trim()) {
      setError("Masukkan kode kupon terlebih dahulu");
      return;
    }

    setIsApplying(true);

    try {
      const upperCode = couponCode.trim().toUpperCase();

      const { data, error: dbError } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', upperCode)
        .limit(1);

      if (dbError) {
        alert(`Error Database: ${dbError.message}`);
        setError(`Error Database: ${dbError.message}`);
        setIsApplying(false);
        return;
      }

      // Check results from Supabase

      const coupon = data && data.length > 0 ? data[0] : null;

      if (!coupon) {
        setError("Kode kupon tidak ditemukan (Pastikan RLS sudah aktif)");
        setIsApplying(false);
        return;
      }

      // Cek Tanggal Kedaluwarsa
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        setError("Kode kupon sudah kadaluarsa");
        setIsApplying(false);
        return;
      }

      // Simpan info kupon dan terapkan
      setAppliedInfo(coupon);
      onApplyDiscount(coupon, upperCode);
      setCouponCode("");
      
    } catch (err) {
      setError("Terjadi kesalahan saat mengecek kupon");
    }

    setIsApplying(false);
  };

  return (
    <div className="lg:max-w-[670px] w-full">
      <form onSubmit={handleApply}>
        {/* <!-- coupon box --> */}
        <div className="bg-white shadow-1 rounded-[10px]">
          <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
            <h3 className="">Punya kode diskon?</h3>
          </div>

          <div className="py-8 px-4 sm:px-8.5">
            {/* Applied Coupon */}
            {appliedCode && (
              <div className="mb-4 p-3 rounded-lg bg-green-light/10 border border-green-light/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="11" r="11" fill="#22C55E" fillOpacity="0.2"/>
                    <path d="M7 11L10 14L15 8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-green text-sm font-medium">
                    Kupon <strong>{appliedCode}</strong> berhasil diterapkan! (Diskon {appliedInfo?.discount_type === 'percentage' ? `${appliedInfo.discount_value}%` : `Rp${appliedInfo?.discount_value?.toLocaleString('id-ID')}`})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRemoveDiscount();
                    setAppliedInfo(null);
                  }}
                  className="text-red text-sm hover:underline font-medium"
                >
                  Hapus
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-4 xl:gap-5.5">
              <div className="max-w-[426px] w-full">
                <input
                  type="text"
                  name="coupon"
                  id="cart-coupon"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Masukkan kode kupon"
                  disabled={!!appliedCode}
                  className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed ${error ? "border-red" : "border-gray-3"}`}
                />
                {error && (
                  <p className="text-red text-xs mt-1.5">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isApplying || !!appliedCode}
                className="inline-flex items-center gap-2 font-medium text-white bg-blue py-3 px-8 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>
                    <Spinner className="h-4 w-4 border-white" />
                    Memeriksa...
                  </>
                ) : (
                  "Terapkan"
                )}
              </button>
            </div>

            {/* Hint */}
            {!appliedCode && (
              <p className="text-dark-5 text-xs mt-3">
                Masukkan kode kupon yang Anda miliki untuk mendapatkan diskon.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Discount;
