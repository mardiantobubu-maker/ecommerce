"use client";
import React, { useEffect, useState } from "react";

import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import {
  removeItemFromCart,
  selectTotalPrice,
  hydrateCart,
} from "@/redux/features/cart-slice";
import { useAppSelector } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import SingleItem from "./SingleItem";
import Link from "next/link";
import EmptyCart from "./EmptyCart";

const CartSidebarModal = () => {
  const { isCartModalOpen, closeCartModal } = useCartModalContext();
  const cartItems = useAppSelector((state) => state.cartReducer.items);
  const dispatch = useDispatch();

  const totalPrice = useSelector(selectTotalPrice);

  useEffect(() => {
    dispatch(hydrateCart());
  }, [dispatch]);

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeCartModal();
      }
    }

    if (isCartModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCartModalOpen, closeCartModal]);

  return (
    <div
      className={`fixed inset-0 z-[99999] transition-all duration-300 ease-in-out ${
        isCartModalOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-dark/40 backdrop-blur-[4px] transition-opacity duration-300"
        onClick={() => closeCartModal()}
      ></div>

      <div className="flex items-stretch justify-end h-full relative z-10">
        <div 
          className={`w-full max-w-[460px] shadow-2xl bg-white flex flex-col h-full modal-content transition-transform duration-300 ease-out transform ${
            isCartModalOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-6 border-b border-gray-2 bg-white sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <h2 className="font-black text-dark text-xl sm:text-2xl tracking-tight">
                Keranjang Belanja
              </h2>
              <span className="bg-blue/10 text-blue text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">
                {cartItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} Unit
              </span>
            </div>
            <button
              onClick={() => closeCartModal()}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-1 text-dark hover:bg-red hover:text-white transition-all duration-300"
              aria-label="Tutup Keranjang"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Scrollable Items */}
          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-8 bg-gray-50/30">
            <div className="flex flex-col gap-6">
              {cartItems.length > 0 ? (
                cartItems.map((item, key) => (
                  <SingleItem
                    key={key}
                    item={item}
                    removeItemFromCart={removeItemFromCart}
                  />
                ))
              ) : (
                <EmptyCart />
              )}
            </div>
          </div>

          {/* Footer - always pinned to bottom */}
          <div className="flex-shrink-0 border-t border-gray-2 bg-white px-6 py-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] relative z-20">
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-black text-[#212121] uppercase tracking-[0.2em]">Total Pesanan</p>
                <div className="text-right">
                  <p className="text-xs font-black text-dark uppercase tracking-widest">
                    {cartItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0).toLocaleString("id-ID")} Unit
                  </p>
                  <p className="text-xs font-bold text-blue uppercase tracking-tighter">
                    ({Math.floor(cartItems.reduce((acc, curr) => acc + (curr.quantity || 0), 0) / 20).toLocaleString("id-ID")} Kodi)
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-3">
                <p className="font-black text-dark text-lg uppercase tracking-tight">Subtotal</p>
                <p className="font-black text-blue text-2xl tracking-tighter">Rp{totalPrice.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                onClick={() => closeCartModal()}
                href="/cart"
                className="w-full flex justify-center items-center h-14 font-black text-blue bg-blue/5 border-2 border-blue/10 rounded-2xl ease-out duration-300 hover:bg-blue hover:text-white hover:border-blue shadow-sm uppercase tracking-widest text-sm"
              >
                Lihat Detail Keranjang
              </Link>

              <Link
                onClick={() => closeCartModal()}
                href="/checkout"
                className="w-full flex justify-center items-center h-14 font-black text-white bg-blue rounded-2xl ease-out duration-300 hover:bg-blue-dark hover:shadow-xl hover:-translate-y-0.5 shadow-md uppercase tracking-widest text-sm"
              >
                Lanjutkan Pembayaran
                <svg className="ml-2" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSidebarModal;
