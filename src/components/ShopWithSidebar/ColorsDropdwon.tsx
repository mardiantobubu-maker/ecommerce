"use client";
import React, { useState } from "react";

const ColorsDropdwon = ({ selectedColors, setSelectedColors }) => {
  const [toggleDropdown, setToggleDropdown] = useState(true);

  const colors = [
    { name: "Putih", hex: "#FFFFFF" },
    { name: "Merah", hex: "#E31E24" },
    { name: "Biru", hex: "#0F2E5B" },
    { name: "Abu-abu", hex: "#9AA0A6" },
    { name: "Cokelat", hex: "#6F4E37" },
    { name: "Batik", hex: "#8B4513" },
  ];
  const handleToggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else {
      setSelectedColors([...selectedColors, color]);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-lg">
      <div
        onClick={() => setToggleDropdown(!toggleDropdown)}
        className={`cursor-pointer flex items-center justify-between py-3 pl-6 pr-5.5 ${
          toggleDropdown && "shadow-filter"
        }`}
      >
        <p className="text-[12px] font-black uppercase text-[#212121] tracking-widest">Warna</p>
        <button
          aria-label="button for colors dropdown"
          className={`text-dark ease-out duration-200 ${
            toggleDropdown && "rotate-180"
          }`}
        >
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M4.43057 8.51192C4.70014 8.19743 5.17361 8.161 5.48811 8.43057L12 14.0122L18.5119 8.43057C18.8264 8.16101 19.2999 8.19743 19.5695 8.51192C19.839 8.82642 19.8026 9.29989 19.4881 9.56946L12.4881 15.5695C12.2072 15.8102 11.7928 15.8102 11.5119 15.5695L4.51192 9.56946C4.19743 9.29989 4.161 8.82641 4.43057 8.51192Z"
              fill=""
            />
          </svg>
        </button>
      </div>

      {/* <!-- dropdown menu --> */}
      <div
        className={`flex-wrap gap-2.5 p-6 ${
          toggleDropdown ? "flex" : "hidden"
        }`}
      >
        {colors.map((colorItem, key) => (
          <label
            key={key}
            className="cursor-pointer select-none flex items-center group relative"
            title={colorItem.name}
          >
            <div className="relative">
              <input
                type="checkbox"
                name="color"
                className="sr-only"
                checked={selectedColors.includes(colorItem.name)}
                onChange={() => handleToggleColor(colorItem.name)}
              />
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                  selectedColors.includes(colorItem.name) ? "border-2 scale-110" : "border-transparent"
                }`}
                style={{ 
                  borderColor: selectedColors.includes(colorItem.name) 
                    ? (colorItem.hex === '#FFFFFF' ? '#D1D5DB' : colorItem.hex) 
                    : 'transparent' 
                }}
              >
                <span
                  className={`block w-4 h-4 rounded-full shadow-sm ${colorItem.hex === '#FFFFFF' ? 'border border-gray-200' : ''}`}
                  style={{ backgroundColor: colorItem.hex }}
                ></span>
              </div>
            </div>
            
            {/* Tooltip on Hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-dark text-white text-[10px] font-bold rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10">
              {colorItem.name}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark"></div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default ColorsDropdwon;
