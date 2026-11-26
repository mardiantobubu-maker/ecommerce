"use client";
import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Spinner } from "../Common/PreLoader";

interface CouponProps {
  onApplyDiscount: (coupon: any, code: string) => void;
  appliedCode: string;
  onRemoveDiscount: () => void;
}

const Coupon = ({ onApplyDiscount, appliedCode, onRemoveDiscount }: CouponProps) => {
  const [couponCode, setCouponCode] = useState("");
  const [error, setError] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setError("");

    if (!couponCode.trim()) {
      setError("Masukkan kode kupon terlebih dahulu");
      return;
    }

    setIsApplying(true);

    try {
      const cleanCode = couponCode.trim();
      // Debug: alert(`Mencari Kupon: "${cleanCode}"`);

      const { data, error: dbError } = await supabase
        .from('coupons')
        .select('*')
        .ilike('code', cleanCode)
        .limit(1);

      if (dbError) {
        alert(`Error Database: ${dbError.message}`);
        setError(`Error Database: ${dbError.message}`);
        setIsApplying(false);
        return;
      }

      if (!data || data.length === 0) {
        setError("Kode kupon tidak ditemukan (Pastikan RLS sudah aktif)");
        setIsApplying(false);
        return;
      }

      const coupon = data[0];

      // Cek Tanggal Kedaluwarsa
      if (coupon.expiry_date && new Date(coupon.expiry_date) < new Date()) {
        setError("Kode kupon sudah kadaluarsa");
        setIsApplying(false);
        return;
      }

      onApplyDiscount(coupon, cleanCode.toUpperCase());
      setCouponCode("");
      
    } catch (err) {
      setError("Terjadi kesalahan saat mengecek kupon");
    }

    setIsApplying(false);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">Punya Kode Kupon?</h3>
      </div>

      <div className="py-8 px-4 sm:px-8.5">
        {appliedCode && (
          <div className="mb-4 p-3 rounded-lg bg-green-light/10 border border-green-light/30 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="11" fill="#22C55E" fillOpacity="0.2"/>
                <path d="M7 11L10 14L15 8" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-green text-sm font-medium">
                Kupon <strong>{appliedCode}</strong> diterapkan!
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveDiscount}
              className="text-red text-sm hover:underline font-medium text-left"
            >
              Hapus Kupon
            </button>
          </div>
        )}

        <div className="flex gap-4">
          <div className="w-full">
            <input
              type="text"
              name="coupon"
              id="checkout-coupon"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value);
                if (error) setError("");
              }}
              disabled={!!appliedCode}
              placeholder="Masukkan kode kupon"
              className={`rounded-md border bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 h-[46px] outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20 disabled:opacity-50 disabled:cursor-not-allowed ${error ? "border-red" : "border-gray-3"}`}
            />
            {error && (
              <p className="text-red text-xs mt-1.5">{error}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleApply}
            disabled={isApplying || !!appliedCode}
            className="inline-flex font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark disabled:opacity-50 disabled:cursor-not-allowed items-center justify-center gap-2 outline-none focus:outline-none active:outline-none min-w-[120px] h-[46px]"
          >
            {isApplying ? (
              <Spinner className="h-5 w-5 border-white" />
            ) : (
              "Terapkan"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Coupon;
