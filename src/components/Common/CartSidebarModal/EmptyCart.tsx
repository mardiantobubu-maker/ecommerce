import React from "react";
import Link from "next/link";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";

const EmptyCart = () => {
  const { closeCartModal } = useCartModalContext();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fadeIn">
      <div className="w-24 h-24 mb-8 bg-gray-1 rounded-full flex items-center justify-center relative">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-dark/20"
        >
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <div className="absolute top-0 right-0 w-6 h-6 bg-red/10 rounded-full flex items-center justify-center">
          <span className="text-red text-[10px] font-black">0</span>
        </div>
      </div>

      <h3 className="text-xl font-black text-dark mb-2 uppercase tracking-tight">Keranjang Kosong</h3>
      <p className="text-sm text-dark-4 mb-10 max-w-[240px] mx-auto leading-relaxed">
        Sepertinya Anda belum menambahkan produk apapun ke dalam keranjang belanja.
      </p>

      <Link
        onClick={() => closeCartModal()}
        href="/shop-with-sidebar"
        className="inline-flex items-center justify-center h-12 px-8 font-black text-white bg-blue rounded-xl shadow-lg shadow-blue/20 hover:shadow-xl hover:bg-blue-dark hover:-translate-y-0.5 transition-all duration-300 uppercase tracking-widest text-[11px]"
      >
        Mulai Belanja
        <svg className="ml-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </Link>
    </div>
  );
};

export default EmptyCart;
