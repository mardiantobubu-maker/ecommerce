import React, { useState } from "react";

interface BookingOptionProps {
  onBookingChange: (isBooking: boolean, period: string) => void;
}

const options = [
  { id: 1, label: "Tahun Ajaran Baru (Estimasi Juli 2026)" },
  { id: 2, label: "Semester Genap (Estimasi Januari 2027)" },
  { id: 3, label: "Tahun Ajaran Baru (Estimasi Juli 2027)" },
];

const BookingOption = ({ onBookingChange }: BookingOptionProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("");

  const handleToggle = (booking: boolean) => {
    setIsBooking(booking);
    if (!booking) {
      setSelectedPeriod("");
      onBookingChange(false, "");
      // Tutup accordion hanya saat pilih Kirim Langsung
      setIsOpen(false);
    } else {
      const defaultPeriod = options[0].label;
      setSelectedPeriod(defaultPeriod);
      onBookingChange(true, defaultPeriod);
      // Tetap buka accordion agar user bisa pilih target pengiriman
    }
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const period = e.target.value;
    setSelectedPeriod(period);
    onBookingChange(true, period);
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-blue uppercase tracking-[0.15em] leading-none mb-1.5">Jadwal Pengiriman</span>
            <span className="font-medium text-[18px] sm:text-xl">Opsi Pengiriman</span>
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
            {/* Kirim Langsung */}
            <label className="flex cursor-pointer select-none items-start gap-4">
              <div className="relative mt-1">
                <input
                  type="radio"
                  name="deliveryType"
                  className="sr-only"
                  checked={!isBooking}
                  onChange={() => handleToggle(false)}
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    !isBooking ? "border-4 border-blue" : "border border-gray-4"
                  }`}
                ></div>
              </div>
              <div>
                <span className="block font-medium text-dark text-lg mb-1">
                  Kirim Langsung (Stok Tersedia)
                </span>
                <span className="block text-dark-4 text-sm">
                  Pesanan akan diproses dan dikirim sesuai jadwal reguler kami (1-3 hari kerja).
                </span>
              </div>
            </label>

            {/* Booking / Pre-Order */}
            <label className="flex cursor-pointer select-none items-start gap-4 mt-2">
              <div className="relative mt-1">
                <input
                  type="radio"
                  name="deliveryType"
                  className="sr-only"
                  checked={isBooking}
                  onChange={() => handleToggle(true)}
                />
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-full ${
                    isBooking ? "border-4 border-blue" : "border border-gray-4"
                  }`}
                ></div>
              </div>
              <div className="w-full">
                <span className="block font-medium text-dark text-lg mb-1">
                  Booking untuk Periode Selanjutnya (Pre-Order)
                </span>
                <span className="block text-dark-4 text-sm mb-4">
                  Amankan stok Anda sekarang. Pesanan akan diproduksi dan dikirim menjelang periode yang dipilih.
                </span>

                {/* Dropdown Periode */}
                {isBooking && (
                  <div className="animate-fade-in w-full lg:max-w-md">
                    <label htmlFor="bookingPeriod" className="block text-sm mb-2 font-medium text-dark">
                      Pilih Target Pengiriman:
                    </label>
                    <div className="relative">
                      <select
                        id="bookingPeriod"
                        value={selectedPeriod}
                        onChange={handlePeriodChange}
                        className="w-full bg-gray-1 rounded-md border border-gray-3 text-[#212121] py-3 pl-5 pr-9 duration-200 appearance-none outline-none focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      >
                        {options.map((opt) => (
                          <option key={opt.id} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none">
                        <svg
                          className="fill-current"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            d="M2.41469 5.03569L2.41467 5.03571L2.41749 5.03846L7.76749 10.2635L8.0015 10.492L8.23442 10.2623L13.5844 4.98735L13.5844 4.98735L13.5861 4.98569C13.6809 4.89086 13.8199 4.89087 13.9147 4.98569C14.0092 5.08024 14.0095 5.21864 13.9155 5.31345C13.9152 5.31373 13.915 5.31401 13.9147 5.31429L8.16676 10.9622L8.16676 10.9622L8.16469 10.9643C8.06838 11.0606 8.02352 11.0667 8.00039 11.0667C7.94147 11.0667 7.89042 11.0522 7.82064 10.9991L2.08526 5.36345C1.99127 5.26865 1.99154 5.13024 2.08609 5.03569C2.18092 4.94086 2.31986 4.94086 2.41469 5.03569Z"
                            strokeWidth="0.666667"
                          />
                        </svg>
                      </span>
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue/5 rounded-md border border-blue/10">
                      <p className="text-sm text-blue">
                        <strong>Info:</strong> Dengan sistem booking, Anda mengamankan harga saat ini dan menghindari kelangkaan stok menjelang tahun ajaran baru.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingOption;
