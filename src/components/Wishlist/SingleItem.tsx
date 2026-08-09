import React from "react";
import { AppDispatch } from "@/redux/store";
import { useDispatch } from "react-redux";

import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { addItemToCart } from "@/redux/features/cart-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { useWishlistSync } from "@/hooks/useWishlistSync";

import Image from "next/image";
import Link from "next/link";

const SingleItem = ({ item }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { syncItemToSupabase } = useWishlistSync();

  const handleRemoveFromWishlist = async () => {
    dispatch(removeItemFromWishlist(item.id));
    await syncItemToSupabase(item, false);
  };

  const handleAddToCart = () => {
    dispatch(
      addItemToCart({
        ...item,
        quantity: 20, // Default to 1 Kodi (20 Pcs) for B2B
      })
    );
  };

  const handleProductDetails = () => {
    dispatch(updateproductDetails({ ...item }));
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center border-t border-gray-3 py-6 px-4 lg:px-10 gap-5 lg:gap-0">
      <div className="flex items-center gap-4 w-full lg:w-auto lg:min-w-[470px]">
        <div className="flex-shrink-0">
          <button
            onClick={() => handleRemoveFromWishlist()}
            aria-label="button for remove product from wishlist"
            className="flex items-center justify-center rounded-lg w-9.5 h-9.5 bg-gray-2 border border-gray-3 ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
          >
            <svg
              className="fill-current"
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.19509 8.22222C8.92661 7.95374 8.49131 7.95374 8.22282 8.22222C7.95433 8.49071 7.95433 8.92601 8.22282 9.1945L10.0284 11L8.22284 12.8056C7.95435 13.074 7.95435 13.5093 8.22284 13.7778C8.49133 14.0463 8.92663 14.0463 9.19511 13.7778L11.0006 11.9723L12.8061 13.7778C13.0746 14.0463 13.5099 14.0463 13.7784 13.7778C14.0469 13.5093 14.0469 13.074 13.7784 12.8055L11.9729 11L13.7784 9.19451C14.0469 8.92603 14.0469 8.49073 13.7784 8.22224C13.5099 7.95376 13.0746 7.95376 12.8062 8.22224L11.0006 10.0278L9.19509 8.22222Z"
                fill=""
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11.0007 1.14587C5.55835 1.14587 1.14648 5.55773 1.14648 11C1.14648 16.4423 5.55835 20.8542 11.0007 20.8542C16.443 20.8542 20.8548 16.4423 20.8548 11C20.8548 5.55773 16.443 1.14587 11.0007 1.14587ZM2.52148 11C2.52148 6.31713 6.31774 2.52087 11.0007 2.52087C15.6836 2.52087 19.4798 6.31713 19.4798 11C19.4798 15.683 15.6836 19.4792 11.0007 19.4792C6.31774 19.4792 2.52148 15.683 2.52148 11Z"
                fill=""
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Link 
            href={`/shop-details?id=${item.id}`} 
            onClick={handleProductDetails}
            className="flex items-center justify-center rounded-[5px] bg-gray-2 w-17.5 h-17.5 overflow-hidden hover:opacity-80 transition-opacity"
          >
            <Image src={item.imgs?.thumbnails[0]} alt="product" width={70} height={70} className="object-cover" />
          </Link>

          <div>
            <h3 className="text-dark font-semibold ease-out duration-200 hover:text-blue leading-tight">
              <Link href={`/shop-details?id=${item.id}`} onClick={handleProductDetails}> {item.title} </Link>
            </h3>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-auto lg:min-w-[205px] flex items-center justify-between lg:block">
        <span className="lg:hidden text-dark font-medium">Harga:</span>
        <p className="text-dark">Rp{item.discountedPrice.toLocaleString()}</p>
      </div>

      <div className="w-full lg:w-auto lg:min-w-[265px] flex items-center justify-between lg:block">
        <span className="lg:hidden text-dark font-medium">Status:</span>
        <div className="flex items-center gap-1.5">
          {item.stock !== 0 ? (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  fill="#219653"
                  fillOpacity="0.1"
                />
                <path
                  d="M8 12L11 15L16 9"
                  stroke="#219653"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-[#219653]"> Tersedia </span>
            </>
          ) : (
            <>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                  stroke="#F23030"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-red"> Stok Habis </span>
            </>
          )}
        </div>
      </div>

      <div className="w-full lg:w-auto lg:min-w-[150px] flex lg:justify-end mt-2 lg:mt-0">
        <button
          onClick={() => handleAddToCart()}
          disabled={item.stock === 0}
          className={`w-full lg:w-auto inline-flex items-center justify-center py-2.5 px-6 rounded-md ease-out duration-200 ${
            item.stock === 0 
            ? "text-dark-4 bg-gray-3 border-gray-3 cursor-not-allowed opacity-60"
            : "text-dark hover:text-white bg-gray-1 border border-gray-3 hover:bg-blue hover:border-blue"
          }`}
        >
          Tambah
        </button>
      </div>
    </div>
  );
};

export default SingleItem;
