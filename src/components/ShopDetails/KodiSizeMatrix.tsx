"use client";
import React from "react";
import { KODI_SIZE, pcsToNextKodi, pcsToKodi, isValidKodiQuantity, formatRupiah } from "@/utils/kodiPricing";

export interface ColorVariant {
  label: string;    // e.g. "Putih (Baju)"
  value: string;    // CSS color e.g. "white"
  type: string;     // "baju" | "celana"
}

interface KodiSizeMatrixProps {
  sizes: string[];
  colors: ColorVariant[];
  values: { [key: string]: number }; // Key format: "size-label"
  onChange: (key: string, value: number) => void;
  unitPrice: number;
  unitPricePendek: number;
  unitPricePanjang: number;
  sizePrices: {[size: string]: {[variation: string]: number}};
  selectedSize: string;
  setSelectedSize: (s: string) => void;
  activeSleeve: string;
  setSleeveType: (s: string) => void;
}

const KodiSizeMatrix: React.FC<KodiSizeMatrixProps> = ({ sizes, colors, values, onChange, unitPrice, unitPricePendek, unitPricePanjang, sizePrices, selectedSize, setSelectedSize, activeSleeve, setSleeveType }) => {
  if (!colors || colors.length === 0) return null;

  const [activeColorLabel, setActiveColorLabel] = React.useState(colors[0]?.label || "");
  
  const totalPcs = Object.values(values).reduce((sum, v) => sum + v, 0);
  const currentKodi = pcsToKodi(totalPcs);
  const nextKodiNeed = pcsToNextKodi(totalPcs);
  const isValid = isValidKodiQuantity(totalPcs);

  const progress = ((totalPcs % KODI_SIZE) / KODI_SIZE) * 100;

  // Use the dynamic sizes from Admin if available, otherwise use a generic standard
  const displaySizes = sizes.length > 0 ? sizes : ["7,8", "9,10", "11,12", "13,14", "15,16", "17,18", "19,20"];
  
  const activeColorItem = colors.find(c => c.label === activeColorLabel) || colors[0];
  const targetSizes = displaySizes;

  const currentKey = `${selectedSize}-${activeColorItem.label}`;
  const currentVal = values[currentKey] || 0;

  // Get only sizes that have quantity > 0 for the summary list
  const selectedVariants = Object.entries(values).filter(([_, val]) => val > 0);

  return (
    <div className="p-0 transition-all duration-300">
      <div className="flex flex-col gap-6 mb-8">
        <div>
          <h3 className="font-black text-[21px] tracking-tight text-center sm:text-left" style={{ color: '#212121' }}>Kombinasi Ukuran & Warna</h3>
          <p className="text-[14px] font-bold opacity-60 text-center sm:text-left" style={{ color: '#212121' }}>Atur rincian varian pesanan Anda</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Color Selection */}
          <div className="flex flex-col gap-2">
            <span className="text-[16px] font-black text-blue">1. Pilih Warna & Jenis</span>
            <div className="relative">
              <select 
                value={activeColorLabel} 
                onChange={(e) => {
                  const newVal = e.target.value;
                  setActiveColorLabel(newVal);
                  
                  // Determine variation type dynamically from label
                  const labelLower = newVal.toLowerCase();
                  let newType = "pendek";
                  if (labelLower.includes("panjang")) newType = "panjang";
                  else if (labelLower.includes("sd")) newType = "sd";
                  else if (labelLower.includes("smp")) newType = "smp";
                  else if (labelLower.includes("sma")) newType = "sma";
                  else if (labelLower.includes("smk")) newType = "smk";
                  else if (labelLower.includes("pramuka")) newType = "pramuka";
                  
                  setSleeveType(newType);
                }}
                className="w-full bg-white border-2 border-gray-2 rounded-xl px-4 py-3.5 font-bold text-sm text-dark outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all shadow-sm cursor-pointer appearance-none"
              >
                {colors.map(c => (
                  <option key={c.label} value={c.label}>{c.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Size Selection Dropdown */}
          <div className="flex flex-col gap-2">
            <span className="text-[16px] font-black text-blue">2. Pilih Ukuran</span>
            <div className="relative">
              <select 
                value={selectedSize} 
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full bg-white border-2 border-gray-2 rounded-xl px-4 py-3.5 font-bold text-sm text-dark outline-none focus:border-blue focus:ring-4 focus:ring-blue/10 transition-all shadow-sm cursor-pointer appearance-none"
              >
                {targetSizes.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-dark-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Quantity Counter for Selected Size */}
        <div className="p-0 animate-fadeIn">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center justify-center gap-3 sm:gap-4 min-w-0 w-full text-center">
              <div className="min-w-[56px] h-14 px-2 rounded-full bg-blue text-white flex items-center justify-center font-black text-sm sm:text-base leading-none tracking-tight shadow-md">
                {selectedSize}
              </div>
              <div className="min-w-0">
                <span className="text-[16px] font-black text-[#212121]">Input Jumlah Unit</span>
                <p className="font-bold text-[14px] text-dark truncate">{activeColorItem?.label}</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 w-full items-center">
              <div className="flex items-center bg-gray-2 rounded-xl overflow-hidden h-14 w-full max-w-[220px] shadow-inner transition-all focus-within:ring-2 focus-within:ring-blue/20">
                <button
                  type="button"
                  onClick={() => onChange(currentKey, Math.max(0, currentVal - 5))}
                  className="w-14 h-full hover:bg-gray-2 transition-colors text-dark font-black text-xl"
                >
                  -
                </button>
                <input
                  type="number"
                  step="5"
                  value={currentVal}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 0;
                    const rounded = Math.ceil(val / 5) * 5;
                    onChange(currentKey, rounded);
                  }}
                  className="w-full text-center bg-transparent focus:outline-none font-black text-dark text-lg border-x-2 border-gray-3"
                />
                <button
                  type="button"
                  onClick={() => onChange(currentKey, currentVal + 5)}
                  className="w-14 h-full hover:bg-gray-2 transition-colors text-dark font-black text-xl"
                >
                  +
                </button>
              </div>
              <p className="text-[14px] font-black text-blue uppercase tracking-widest text-center italic opacity-70">
                Kelipatan 5 Unit per Varian
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Summary List */}
      {selectedVariants.length > 0 && (
        <div className="animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[14px] font-black text-[#212121]">Rincian Terpilih</span>
            <div className="h-[1px] flex-1 bg-gray-3"></div>
          </div>
          <div className="space-y-2">
            {selectedVariants.map(([key, val]) => {
              const [size, ...colorParts] = key.split("-");
              const color = colorParts.join("-");
              return (
                <div key={key} className="flex items-center justify-between px-0 py-4 border-b border-gray-3 group hover:border-blue transition-all">
                  <div className="flex-1 space-y-3 pr-4">
                    {/* Row 1: Varian & Unit */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1.5 rounded-lg bg-blue/5 text-[12px] font-black text-blue border border-blue/10 uppercase whitespace-nowrap">
                        {color}
                      </span>
                      <span className="text-[14px] font-black text-dark uppercase tracking-tight">
                        {val} Unit
                      </span>
                    </div>
                    
                    {/* Row 2: Size & Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-[#212121] uppercase opacity-70">Size</span>
                        <span className="w-8.5 h-8.5 rounded-lg bg-gray-2 flex items-center justify-center text-[12px] font-black text-blue">{size}</span>
                      </div>
                      <span className="text-[18px] font-bold text-blue">
                        {(() => {
                          const labelLower = color.toLowerCase();
                          let type = "pendek";
                          if (labelLower.includes("panjang")) type = "panjang";
                          else if (labelLower.includes("sd")) type = "sd";
                          else if (labelLower.includes("smp")) type = "smp";
                          else if (labelLower.includes("sma")) type = "sma";
                          else if (labelLower.includes("smk")) type = "smk";
                          else if (labelLower.includes("pramuka")) type = "pramuka";

                          const customPrice = sizePrices?.[size]?.[type];
                          const activeUnitPrice = customPrice ? customPrice : (type === "panjang" ? unitPricePanjang : unitPricePendek);
                          return formatRupiah(activeUnitPrice * val);
                        })()}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => onChange(key, 0)}
                    className="text-red hover:bg-red/5 p-2 rounded-lg transition-all border border-transparent hover:border-red/10"
                    title="Hapus"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default KodiSizeMatrix;
