import React, { useState } from "react";
import Image from "next/image";

const PaymentMethod = ({ selected, onSelect, isBooking = false, shippingMethod = "free" }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (method: string) => {
    onSelect(method);
    setIsOpen(false);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5 overflow-hidden">
      <div 
        className="flex items-center justify-between py-5 px-4 sm:px-8.5 cursor-pointer hover:bg-gray-1 transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4 text-dark">
          <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center text-blue shrink-0 shadow-sm border border-blue/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-blue uppercase tracking-[0.15em] leading-none mb-1.5">Transaksi Aman</span>
            <span className="font-medium text-[18px] sm:text-xl">Metode Pembayaran</span>
          </div>
        </div>
        <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-4 sm:p-8.5 border-t border-gray-3">
          <div className="flex flex-col gap-4">
            {/* Bank Transfer - Sembunyikan jika ambil di toko */}
            {shippingMethod !== "free" && (
              <label htmlFor="bank" className="flex cursor-pointer select-none items-center gap-4">
                <div className="relative">
                  <input type="radio" name="payment" id="bank" className="sr-only" checked={selected === "bank"} onChange={() => handleSelect("bank")} />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected === "bank" ? "border-blue" : "border-gray-4"}`}>
                    {selected === "bank" && <div className="h-2.5 w-2.5 rounded-full bg-blue"></div>}
                  </div>
                </div>
                <div className={`flex-1 rounded-xl border-2 p-5 transition-all ${selected === "bank" ? "border-blue bg-blue/5 shadow-sm" : "border-gray-2 bg-white"}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-2"><Image src="/images/checkout/bank.svg" alt="bank" width={32} height={32}/></div>
                    <div>
                      <p className="font-bold text-dark">Transfer Bank Langsung</p>
                      <p className="text-xs text-dark-4">Lakukan pembayaran langsung ke rekening bank kami. Pesanan akan diproses setelah pembayaran dikonfirmasi.</p>
                      {selected === "bank" && (
                        <div className="mt-2 bg-red/10 p-2 rounded border border-red/20">
                          <p className="text-[14px] font-normal text-[#8D95A8]">⚠️ Wajib foto bukti transfer setelah melakukan pemesanan agar pesanan dapat diproses</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </label>
            )}

            {/* Invoice / Tempo - Muncul jika BUKAN booking (Bisa untuk ambil toko & kurir) */}
            {!isBooking && (
              <label htmlFor="invoice" className="flex cursor-pointer select-none items-center gap-4">
                <div className="relative">
                  <input type="radio" name="payment" id="invoice" className="sr-only" checked={selected === "invoice"} onChange={() => handleSelect("invoice")} />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected === "invoice" ? "border-blue" : "border-gray-4"}`}>
                    {selected === "invoice" && <div className="h-2.5 w-2.5 rounded-full bg-blue"></div>}
                  </div>
                </div>
                <div className={`flex-1 rounded-xl border-2 p-5 transition-all ${selected === "invoice" ? "border-blue bg-blue/5 shadow-sm" : "border-gray-2 bg-white"}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue">
                        <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19ZM7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-dark">Invoice / Penagihan (B2B)</p>
                      <p className="text-xs text-dark-4">Khusus instansi/koperasi sekolah. Wajib memiliki kerjasama MOU.</p>
                    </div>
                  </div>
                </div>
              </label>
            )}

            {/* COD - Hanya muncul jika ambil di toko DAN BUKAN booking */}
            {shippingMethod === "free" && !isBooking && (
              <label htmlFor="cash" className="flex cursor-pointer select-none items-center gap-4">
                <div className="relative">
                  <input type="radio" name="payment" id="cash" className="sr-only" checked={selected === "cash"} onChange={() => handleSelect("cash")} />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected === "cash" ? "border-blue" : "border-gray-4"}`}>
                    {selected === "cash" && <div className="h-2.5 w-2.5 rounded-full bg-blue"></div>}
                  </div>
                </div>
                <div className={`flex-1 rounded-xl border-2 p-5 transition-all ${selected === "cash" ? "border-blue bg-blue/5 shadow-sm" : "border-gray-2 bg-white"}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center p-2">
                      <div className="text-blue font-black text-sm">RP</div>
                    </div>
                    <div>
                      <p className="font-bold text-dark">Bayar di Tempat (COD)</p>
                      <p className="text-xs text-dark-4">
                        {shippingMethod === "free" ? "Bayar langsung secara tunai." : "Bayar langsung secara tunai saat pesanan Anda tiba."}
                      </p>
                    </div>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethod;
