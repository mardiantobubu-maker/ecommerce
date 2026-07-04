"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import { useWishlistSync } from "@/hooks/useWishlistSync";
import SingleItem from "./SingleItem";
import Link from "next/link";

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const { clearAllWishlistSupabase } = useWishlistSync();

  const handleClearAll = async () => {
    dispatch(removeAllItemsFromWishlist());
    await clearAllWishlistSupabase();
  };

  return (
    <>
      <Breadcrumb title={"Favorit"} pages={["Favorit"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-10 lg:py-20 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          {wishlistItems.length > 0 ? (
            <div className="bg-white rounded-[10px] overflow-hidden">
              <div className="w-full overflow-x-auto">
                <div className="lg:min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="hidden lg:flex items-center py-5.5 px-10">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark font-medium">Produk</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark font-medium">Harga Satuan</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark font-medium">Status Stok</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark font-medium text-right">Aksi</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
                  {wishlistItems.map((item, key) => (
                    <SingleItem item={item} key={key} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white rounded-[10px] py-20 px-4">
              <div className="w-24 h-24 mb-6 text-blue/20">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22 19V9C22 7.89543 21.1046 7 20 7H12L10 5H4C2.89543 5 2 5.89543 2 7V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 11.5C12 11.5 13 10.5 14.5 10.5C16 10.5 17 11.5 17 13C17 15 14.5 17 12 18.5C9.5 17 7 15 7 13C7 11.5 8 10.5 9.5 10.5C11 10.5 12 11.5 12 11.5Z"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-dark mb-2">Daftar favorit Anda kosong!</h3>
              <p className="text-dark-4 mb-8 text-center max-w-[400px]">
                Sepertinya Anda belum menambahkan produk favorit. Mulai jelajahi produk kami dan temukan seragam terbaik untuk Anda.
              </p>
              <Link
                href="/shop-with-sidebar"
                className="inline-flex justify-center items-center py-3.5 px-10 text-white bg-blue font-bold rounded-full ease-out duration-200 hover:bg-blue-dark transform active:scale-95"
              >
                Lanjut Belanja
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
