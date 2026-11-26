import React from "react";
import { formatRupiah } from "@/utils/kodiPricing";

interface DPPaymentMethodProps {
  totalPrice: number;
  dpOption: string;
  onDPChange: (option: string, dpAmount: number) => void;
}

const DP_OPTIONS = [
  {
    id: "dp30",
    label: "DP 30%",
    description: "Bayar 30% sekarang, sisa dilunasi sebelum pengiriman.",
    percent: 30,
    badge: "Paling Ringan",
    badgeColor: "bg-green/10 text-green border-green/20",
  },
  {
    id: "dp50",
    label: "DP 50%",
    description: "Bayar 50% sekarang, sisa dilunasi sebelum pengiriman.",
    percent: 50,
    badge: "Populer",
    badgeColor: "bg-blue/10 text-blue border-blue/20",
  },
  {
    id: "lunas",
    label: "Bayar Lunas",
    description: "Bayar penuh sekarang dan dapatkan prioritas produksi.",
    percent: 100,
    badge: "Prioritas",
    badgeColor: "bg-orange/10 text-orange border-orange/20",
  },
];

const DPPaymentMethod = ({ totalPrice, dpOption, onDPChange }: DPPaymentMethodProps) => {
  const handleSelect = (option: typeof DP_OPTIONS[0]) => {
    const dpAmount = Math.round((totalPrice * option.percent) / 100);
    onDPChange(option.id, dpAmount);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5 overflow-hidden">
      <div className="py-5 px-4 sm:px-8.5 border-b border-gray-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue/10 rounded-full flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2.5">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-[18px] sm:text-xl text-dark">Metode Pembayaran DP</h3>
            <p className="text-xs text-dark-4">Khusus untuk pesanan Pre-Order / Booking</p>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-8.5">
        <div className="flex flex-col gap-4">
          {DP_OPTIONS.map((option) => {
            const dpAmount = Math.round((totalPrice * option.percent) / 100);
            const remaining = totalPrice - dpAmount;
            const isSelected = dpOption === option.id;

            return (
              <label
                key={option.id}
                htmlFor={`dp-${option.id}`}
                className={`flex cursor-pointer select-none items-start gap-4 p-4 rounded-xl border-2 transition-all ${
                  isSelected ? "border-blue bg-blue/5" : "border-gray-2 bg-white hover:border-gray-3"
                }`}
              >
                <div className="relative mt-0.5">
                  <input
                    type="radio"
                    id={`dp-${option.id}`}
                    name="dpOption"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => handleSelect(option)}
                  />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${isSelected ? "border-blue" : "border-gray-4"}`}>
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-blue" />}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-dark text-base">{option.label}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${option.badgeColor}`}>
                      {option.badge}
                    </span>
                  </div>
                  <p className="text-sm text-dark-4 mb-2">{option.description}</p>

                  <div className="bg-gray-1 rounded-lg p-3 flex flex-col sm:flex-row gap-2 sm:gap-6">
                    <div>
                      <p className="text-xs text-dark-4">Dibayar Sekarang</p>
                      <p className="font-bold text-blue text-sm">{formatRupiah(dpAmount)}</p>
                    </div>
                    {remaining > 0 && (
                      <div>
                        <p className="text-xs text-dark-4">Sisa Pelunasan</p>
                        <p className="font-bold text-dark text-sm">{formatRupiah(remaining)}</p>
                      </div>
                    )}
                    {remaining === 0 && (
                      <div>
                        <p className="text-xs text-green font-medium">✓ Tidak ada sisa pembayaran</p>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-orange/5 rounded-lg border border-orange/10">
          <p className="text-xs text-dark-4">
            <strong className="text-orange">⚠ Perhatian:</strong> Pelunasan sisa pembayaran wajib dilakukan sebelum tanggal estimasi pengiriman yang dipilih. Pesanan tidak akan dikirim sebelum pembayaran lunas.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DPPaymentMethod;
