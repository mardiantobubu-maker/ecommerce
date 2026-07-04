import React, { useState, useEffect } from "react";

interface ShippingOption {
  id: string;
  label: string;
  subLabel?: string;
  description: string;
  estimasi: string;
  price: number;
  logo?: string;
  logoColor?: string;
}

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: "free",
    label: "Ambil di Toko",
    description: "Gratis biaya pengiriman untuk pengambilan langsung.",
    estimasi: "",
    price: 0,
  },
  {
    id: "jne",
    label: "JNE",
    subLabel: "Reguler",
    description: "Estimasi 2-3 hari kerja.",
    estimasi: "2-3 hari",
    price: 20000,
    logo: "JNE",
    logoColor: "bg-[#00529C]/5 border border-[#00529C]/30 text-[#00529C]",
  },
  {
    id: "jnt",
    label: "J&T",
    subLabel: "Express",
    description: "Estimasi 1-2 hari kerja.",
    estimasi: "1-2 hari",
    price: 18000,
    logo: "J&T",
    logoColor: "bg-[#ED1C24]/5 border border-[#ED1C24]/30 text-[#ED1C24]",
  },
  {
    id: "sicepat",
    label: "SiCepat",
    subLabel: "REG",
    description: "Estimasi 2-3 hari kerja.",
    estimasi: "2-3 hari",
    price: 19000,
    logo: "SiCepat",
    logoColor: "bg-[#F15A24]/5 border border-[#F15A24]/30 text-[#F15A24]",
  },
  {
    id: "anteraja",
    label: "Anteraja",
    subLabel: "Reguler",
    description: "Estimasi 2-4 hari kerja.",
    estimasi: "2-4 hari",
    price: 17000,
    logo: "Anteraja",
    logoColor: "bg-[#E91E63]/5 border border-[#E91E63]/30 text-[#E91E63]",
  },
];

interface ShippingMethodProps {
  onShippingChange?: (method: string, cost: number, courier: string) => void;
  isBooking?: boolean;
  totalWeight?: number; // in grams
  destination?: {
    kota: string;
    provinsi: string;
  };
}

const ShippingMethod = ({ onShippingChange, isBooking = false, totalWeight = 1000, destination }: ShippingMethodProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [shippingMethod, setShippingMethod] = useState("free");
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedOptions, setCalculatedOptions] = useState<ShippingOption[]>(SHIPPING_OPTIONS);

  // Filter options based on booking status
  const visibleOptions = isBooking 
    ? calculatedOptions.filter(opt => opt.id !== "free")
    : calculatedOptions;

  // Real-time calculation logic (Simulating API JNE/J&T)
  useEffect(() => {
    if (!destination?.kota) return;

    const fetchShippingCosts = async () => {
      setIsLoading(true);
      try {
        const weightInKg = Math.ceil(totalWeight / 1000);
        
        const updatedOptions = await Promise.all(SHIPPING_OPTIONS.map(async (opt) => {
          if (opt.id === "free") return opt;

          const response = await fetch("/api/shipping/cost", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              destination,
              weight: totalWeight,
              courier: opt.id
            })
          });

          if (response.ok) {
            const data = await response.json();
            return {
              ...opt,
              price: data.cost,
              estimasi: data.estimasi,
              description: weightInKg > 30 ? `🚚 Layanan Cargo ${opt.label}` : `Estimasi ${data.estimasi} kerja.`
            };
          }
          return opt;
        }));

        setCalculatedOptions(updatedOptions);
        
        // If courier was selected, update parent with new price
        const currentSelected = updatedOptions.find(o => o.id === shippingMethod);
        if (currentSelected && shippingMethod !== "free") {
          onShippingChange?.(currentSelected.id, currentSelected.price, currentSelected.label);
        }
      } catch (error) {
        console.error("Gagal mengambil data ongkir:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchShippingCosts();
  }, [destination?.kota, totalWeight]);

  // Notify parent on mount with default value
  useEffect(() => {
    onShippingChange?.("free", 0, "Ambil di Toko");
  }, []);

  // Switch away from 'free' if it becomes restricted
  useEffect(() => {
    if (isBooking && shippingMethod === "free") {
      const firstCourier = SHIPPING_OPTIONS.find(opt => opt.id !== "free");
      if (firstCourier) {
        setShippingMethod(firstCourier.id);
        onShippingChange?.(firstCourier.id, firstCourier.price, firstCourier.label);
      }
    }
  }, [isBooking]);

  const handleSelect = (option: ShippingOption) => {
    setShippingMethod(option.id);
    onShippingChange?.(option.id, option.price, option.label);
    // Close accordion after selection
    setIsOpen(false);
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5 overflow-hidden border border-gray-2">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between py-5 px-4 sm:px-8.5 cursor-pointer hover:bg-gray-1 transition-all"
      >
        <div className="flex items-center gap-4 text-dark">
          <div className="w-10 h-10 bg-blue/10 rounded-full flex items-center justify-center text-blue shrink-0 shadow-sm border border-blue/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3a2 2 0 0 0-2 2v12"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>
            </svg>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-blue uppercase tracking-[0.15em] leading-none mb-1.5">Kurir Ekspedisi</span>
            <span className="font-medium text-[18px] sm:text-xl">Metode Pengiriman</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isLoading && (
            <div className="flex items-center gap-2 bg-blue/5 px-3 py-1.5 rounded-full border border-blue/10">
              <div className="w-3 h-3 border-2 border-blue/30 border-t-blue rounded-full animate-spin"></div>
              <span className="text-[10px] font-bold text-blue uppercase tracking-widest">Cek Ongkir...</span>
            </div>
          )}
          <span className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="p-6 pt-6 border-t border-gray-2 space-y-4">
          
          {/* Info Panel Berat & Tujuan */}
          {destination?.kota && (
            <div className="bg-blue/5 p-4 rounded-xl border border-blue/10 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue uppercase tracking-widest">Tujuan Pengiriman</p>
                  <p className="text-sm font-bold text-dark">{destination.kota}, {destination.provinsi}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue shadow-sm">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue uppercase tracking-widest">Total Berat</p>
                  <p className="text-sm font-bold text-dark">{Math.ceil(totalWeight / 1000)} Kg <span className="text-[10px] font-medium opacity-60">({totalWeight}g)</span></p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {visibleOptions.map((option) => (
              <label key={option.id} htmlFor={option.id} className="flex cursor-pointer select-none items-center gap-4">
                <div className="relative">
                  <input
                    type="radio"
                    name="shipping"
                    id={option.id}
                    className="sr-only"
                    checked={shippingMethod === option.id}
                    onChange={() => handleSelect(option)}
                  />
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${shippingMethod === option.id ? "border-blue" : "border-gray-4"}`}>
                    {shippingMethod === option.id && <div className="h-2.5 w-2.5 rounded-full bg-blue"></div>}
                  </div>
                </div>
                <div className={`flex-1 rounded-xl border-2 p-5 transition-all ${shippingMethod === option.id ? "border-blue bg-blue/5" : "border-gray-2 bg-white"}`}>
                  <div className="flex items-center gap-4">
                    {option.logo ? (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-start gap-4 w-full">
                          <div className="flex items-start gap-4 flex-1">
                            <div className={`min-w-[60px] sm:min-w-[80px] h-10 px-2 ${option.logoColor} rounded flex items-center justify-center font-black tracking-tighter italic text-sm sm:text-base shrink-0 uppercase`}>
                              {option.logo}
                            </div>
                            <div className="flex-1 sm:border-l sm:border-gray-3 sm:pl-4">
                              <div className="flex items-start justify-between">
                                <div className="flex flex-col">
                                  <p className="font-bold text-dark leading-tight">{option.label}</p>
                                  {option.subLabel && <p className="font-bold text-dark leading-tight">{option.subLabel}</p>}
                                </div>
                                <p className="font-bold text-dark text-lg sm:text-base leading-tight">
                                  Rp{option.price.toLocaleString("id-ID")}
                                </p>
                              </div>
                              <p className="text-[13px] text-dark-4 mt-1 leading-normal max-w-[200px] sm:max-w-none">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-start gap-4 w-full">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue/10 text-blue rounded flex items-center justify-center shrink-0">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                            </svg>
                          </div>
                          <div className="flex-1 sm:border-l sm:border-gray-3 sm:pl-4">
                            <div className="flex items-start justify-between">
                              <p className="font-bold text-dark leading-tight">{option.label}</p>
                              <p className="font-bold text-blue text-lg sm:text-base leading-tight">Gratis</p>
                            </div>
                            <p className="text-[13px] text-dark-4 mt-1 leading-normal max-w-[200px] sm:max-w-none">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </label>

            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
