"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

const OrderActions = ({ toggleEdit, toggleDetails, handleDelete, handleReorder, orderId, status }: any) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-gray-1 transition-all text-dark-4"
        title="Aksi"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-3 rounded-xl shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => { toggleDetails(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-dark hover:bg-gray-1 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Lihat Detail
          </button>

          <button
            onClick={() => { handleReorder(); setOpen(false); }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-dark hover:bg-gray-1 transition-all"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
            </svg>
            Beli Lagi
          </button>

          {(status === 'shipped' || status === 'shipping') && orderId && (
            <Link
              href={`/tracking?id=${orderId}`}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-green hover:bg-green/5 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Lacak Pengiriman
            </Link>
          )}

          {toggleEdit && (
            <button
              onClick={() => { toggleEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-bold text-dark hover:bg-gray-1 transition-all"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Pesanan
            </button>
          )}

        </div>
      )}
    </div>
  );
};

export default OrderActions;
