"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import { useModalContext } from "@/app/context/QuickViewModalContext";
import { AppDispatch, useAppSelector } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { useDispatch } from "react-redux";
import Image from "next/image";
import Link from "next/link";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { resetQuickView } from "@/redux/features/quickView-slice";
import { updateproductDetails } from "@/redux/features/product-details";
import { calculateKodiPrice, formatRupiah } from "@/utils/kodiPricing";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useWishlistSync } from "@/hooks/useWishlistSync";
import { useCartSync } from "@/hooks/useCartSync";

const QuickViewModal = () => {
  const { isModalOpen, closeModal } = useModalContext();
  const { openPreviewModal } = usePreviewSlider();
  const [quantity, setQuantity] = useState(20);
  const [isReviewDropdownOpen, setIsReviewDropdownOpen] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  const dispatch = useDispatch<AppDispatch>();

  // get the product data
  const product = useAppSelector((state) => state.quickViewReducer.value);
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isWishlisted = product ? wishlistItems.some((item) => item.id === product.id) : false;
  const { syncItemToSupabase } = useWishlistSync();
  const { syncCartItemToSupabase } = useCartSync();

  const [activePreview, setActivePreview] = useState(0);
  const sizeOptions =
    product?.sizes?.length
      ? product.sizes.reduce((acc, size, index, arr) => {
          if (index % 2 === 0) {
            const nextSize = arr[index + 1];
            acc.push(nextSize ? `${size},${nextSize}` : size);
          }
          return acc;
        }, [] as string[])
      : [];

  // preview modal
  const handlePreviewSlider = () => {
    // Ensure product has imgs structure for PreviewSlider
    const previewData = {
      ...product,
      imgs: product?.imgs || {
        thumbnails: [product?.image_url || "/images/products/seragam-smp.png"],
        previews: [product?.image_url || "/images/products/seragam-smp.png"]
      }
    };
    dispatch(updateproductDetails(previewData));
    openPreviewModal();
  };

  // add to cart
  const handleAddToCart = async () => {
    dispatch(
      addItemToCart({
        ...product,
        quantity,
      })
    );
    await syncCartItemToSupabase({ ...product, quantity });

    closeModal();
  };

  const handleWishlist = async () => {
    if (!product) return;
    if (isWishlisted) {
      dispatch(removeItemFromWishlist(product.id));
      await syncItemToSupabase(product, false);
    } else {
      dispatch(
        addItemToWishlist({
          ...product,
          status: "available",
          quantity: 1,
        })
      );
      await syncItemToSupabase({ ...product, quantity: 1 }, true);
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      if (!isModalOpen) return;
      const { data, error } = await supabase
        .from('testimonials')
        .select('id,name,role,comment,rating,image_url')
        .order('id', { ascending: false });

      if (!error && data) {
        setReviews(data);
      }
    };
    fetchReviews();
  }, [isModalOpen]);

  useEffect(() => {
    // closing modal while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".modal-content")) {
        closeModal();
        setIsReviewDropdownOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      setQuantity(20);
      setIsReviewDropdownOpen(false);
    };
  }, [isModalOpen, closeModal]);

  return (
    <div
      className={`${isModalOpen ? "z-99999" : "hidden"
        } fixed top-0 left-0 overflow-y-auto no-scrollbar w-full h-screen sm:py-20 xl:py-25 2xl:py-[230px] bg-dark/70 sm:px-8 px-4 py-5`}
    >
      <div className="flex items-center justify-center ">
        <div className="w-full max-w-[1100px] rounded-xl shadow-3 bg-white p-7.5 relative modal-content">
          <button
            onClick={() => closeModal()}
            aria-label="button for close modal"
            className="absolute top-0 right-0 sm:top-6 sm:right-6 flex items-center justify-center w-10 h-10 rounded-full ease-in duration-150 bg-meta text-body hover:text-dark"
          >
            <svg
              className="fill-current"
              width="26"
              height="26"
              viewBox="0 0 26 26"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.3108 13L19.2291 8.08167C19.5866 7.72417 19.5866 7.12833 19.2291 6.77083C19.0543 6.59895 18.8189 6.50262 18.5737 6.50262C18.3285 6.50262 18.0932 6.59895 17.9183 6.77083L13 11.6892L8.08164 6.77083C7.90679 6.59895 7.67142 6.50262 7.42623 6.50262C7.18104 6.50262 6.94566 6.59895 6.77081 6.77083C6.41331 7.12833 6.41331 7.72417 6.77081 8.08167L11.6891 13L6.77081 17.9183C6.41331 18.2758 6.41331 18.8717 6.77081 19.2292C7.12831 19.5867 7.72414 19.5867 8.08164 19.2292L13 14.3108L17.9183 19.2292C18.2758 19.5867 18.8716 19.5867 19.2291 19.2292C19.5866 18.8717 19.5866 18.2758 19.2291 17.9183L14.3108 13Z"
                fill=""
              />
            </svg>
          </button>

          <div className="flex flex-col lg:flex-row items-start gap-8">
            {/* Gallery Section */}
            <div className="w-full lg:max-w-[526px]">
              <div className="flex flex-col-reverse lg:flex-row gap-5">
                {/* Thumbnails */}
                <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto no-scrollbar py-2 mt-6 lg:mt-0">
                  {product.imgs.thumbnails?.map((img, key) => (
                    <button
                      onClick={() => setActivePreview(key)}
                      key={key}
                      className={`flex-shrink-0 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 overflow-hidden rounded-lg bg-gray-1 ease-out duration-200 hover:border-2 hover:border-blue ${activePreview === key ? "border-2 border-blue shadow-md scale-105" : "border border-gray-3"}`}
                    >
                      <Image
                        src={img || ""}
                        alt="thumbnail"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </button>
                  ))}
                </div>

                {/* Main Image */}
                <div className="relative flex-1 z-1 overflow-hidden flex items-center justify-center w-full min-h-[300px] sm:min-h-[508px] bg-gray-1 rounded-2xl border border-gray-3 shadow-inner">
                  {(product?.imgs?.previews?.length || product?.image_url) && (
                    <button
                      onClick={handlePreviewSlider}
                      aria-label="button for zoom"
                      className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center ease-out duration-200 text-dark hover:text-blue absolute top-4 right-4 z-50 transform hover:scale-110"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>
                  )}
 
                  {product?.imgs?.previews?.[activePreview] ? (
                    <Image
                      src={product.imgs.previews[activePreview]}
                      alt="products-details"
                      width={500}
                      height={500}
                      className="object-contain"
                    />
                  ) : (
                    <Image
                      src={product?.image_url || "/images/products/seragam-smp.png"}
                      alt="products-details"
                      width={500}
                      height={500}
                      className="object-contain"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="max-w-[445px] w-full">
              <span className="inline-block text-custom-xs font-medium text-white py-1 px-3 bg-blue mb-6.5">
                HARGA GROSIR
              </span>

              <h3 className="font-bold text-[21px] sm:text-2xl text-dark mb-4">
                {product.title}
              </h3>

              <div className="flex flex-wrap items-center gap-5 mb-6">
                  <div className="relative flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={i < Math.floor(product.rating || 5) ? "fill-[#FFA645]" : "fill-gray-4"}
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z"
                          />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-dark font-bold">
                      Peringkat {product.rating || 5}{" "}
                      <button
                        type="button"
                        onClick={() => setIsReviewDropdownOpen((prev) => !prev)}
                        className="font-normal opacity-60 hover:text-blue transition-colors focus:outline-none"
                      >
                        ({reviews.length || 5} ulasan)
                      </button>
                    </span>

                    {isReviewDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-[320px] rounded-2xl border border-gray-3 bg-white p-4 shadow-2xl z-20 animate-fadeIn">
                        <div className="max-h-60 overflow-y-auto space-y-3 no-scrollbar">
                          {reviews.length > 0 ? (
                            reviews.slice(0, 5).map((rev) => (
                              <div key={rev.id} className="rounded-xl bg-gray-1 p-3 border border-gray-2 hover:border-blue/20 transition-all hover:shadow-md">
                                <div className="flex items-center justify-between mb-1.5">
                                  <p className="text-[14px] font-bold text-dark">{rev.name}</p>
                                  <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <svg
                                        key={i}
                                        className={i < rev.rating ? "fill-[#FFA645]" : "fill-gray-4"}
                                        width="12"
                                        height="12"
                                        viewBox="0 0 18 18"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" />
                                      </svg>
                                    ))}
                                  </div>
                                </div>
                                <p className="text-[16px] text-dark-4 leading-relaxed line-clamp-3 italic font-medium">"{rev.comment}"</p>
                              </div>
                            ))
                          ) : (
                            <div className="py-8 text-center flex flex-col items-center gap-2">
                              <div className="w-10 h-10 rounded-full bg-gray-2 flex items-center justify-center text-gray-4">★</div>
                              <p className="text-xs text-dark-4 font-medium">Belum ada ulasan.</p>
                            </div>
                          )}
                        </div>
                        {reviews.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-2 text-center">
                            <Link 
                              href={`/shop-details?id=${product.id}#reviews`} 
                              onClick={() => {
                                closeModal();
                                setIsReviewDropdownOpen(false);
                              }} 
                              className="text-[11px] font-black text-blue hover:text-blue-dark uppercase tracking-widest transition-colors"
                            >
                              Lihat Semua Ulasan
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                <div className="flex items-center gap-2">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clipPath="url(#clip0_375_9221)">
                      <path
                        d="M10 0.5625C4.78125 0.5625 0.5625 4.78125 0.5625 10C0.5625 15.2188 4.78125 19.4688 10 19.4688C15.2188 19.4688 19.4688 15.2188 19.4688 10C19.4688 4.78125 15.2188 0.5625 10 0.5625ZM10 18.0625C5.5625 18.0625 1.96875 14.4375 1.96875 10C1.96875 5.5625 5.5625 1.96875 10 1.96875C14.4375 1.96875 18.0625 5.59375 18.0625 10.0312C18.0625 14.4375 14.4375 18.0625 10 18.0625Z"
                        fill="#22AD5C"
                      />
                      <path
                        d="M12.6875 7.09374L8.9688 10.7187L7.2813 9.06249C7.00005 8.78124 6.56255 8.81249 6.2813 9.06249C6.00005 9.34374 6.0313 9.78124 6.2813 10.0625L8.2813 12C8.4688 12.1875 8.7188 12.2812 8.9688 12.2812C9.2188 12.2812 9.4688 12.1875 9.6563 12L13.6875 8.12499C13.9688 7.84374 13.9688 7.40624 13.6875 7.12499C13.4063 6.84374 12.9688 6.84374 12.6875 7.09374Z"
                        fill="#22AD5C"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_375_9221">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                  <span className="font-medium text-dark"> Stok Tersedia </span>
                </div>
              </div>

              <div className="text-[#212121] text-sm sm:text-base font-medium space-y-1">
                {(product.description || "Setelan seragam sekolah kualitas premium dengan bahan terbaik.")
                  .split(".")
                  .filter((s: string) => s.trim().length > 0)
                  .map((sentence: string, i: number) => (
                    <p key={i}>{sentence.trim()}.</p>
                  ))}
              </div>

              {/* Variants Selection Labels */}
              <div className="flex flex-col gap-4 mt-6">
                {product.colors && product.colors.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-dark/70 uppercase tracking-widest shrink-0">WARNA:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {product.colors.map((c: string, i: number) => (
                        <span key={i} className="px-3.5 py-1.5 rounded-md bg-blue/5 text-[13px] font-bold text-blue border border-blue/20 capitalize">
                          {c.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {product.gender && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-dark/70 uppercase tracking-widest shrink-0">GENDER:</span>
                    <span className="px-3.5 py-1.5 rounded-md bg-blue/5 text-[13px] font-bold text-blue border border-blue/20 capitalize w-fit">
                      {product.gender}
                    </span>
                  </div>
                )}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-black text-dark/70 uppercase tracking-widest shrink-0">UKURAN:</span>
                    <div className="flex flex-wrap items-center gap-2">
                      {product.sizes.map((s: string, i: number) => (
                        <span 
                          key={i} 
                          className="px-3.5 py-1.5 rounded-md bg-blue/5 text-[12px] font-bold text-blue border border-blue/20 uppercase min-w-[40px] text-center hover:bg-blue/10 transition-all duration-200"
                        >
                          {s.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap justify-between gap-5 mt-6 mb-7.5">
                <div>
                  <h4 className="font-semibold text-lg text-[#212121] mb-3.5">
                    Harga
                  </h4>

                  <span className="flex items-baseline gap-2">
                    <span className="font-semibold text-dark text-[22px] sm:text-xl xl:text-heading-4">
                      {formatRupiah(calculateKodiPrice(product.discountedPrice))}
                    </span>
                    <span className="text-[14px] sm:text-sm font-medium text-blue uppercase tracking-tighter">/ Kodi</span>
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[14px] sm:text-xs text-dark line-through">
                      {formatRupiah(product.price)}
                    </span>
                    <span className="text-[14px] sm:text-sm text-green font-bold">
                      Hemat {formatRupiah((product.price - product.discountedPrice) * 20)}/Kodi
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-lg text-[#212121] mb-3.5">
                    Kuantitas
                  </h4>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => quantity > 20 && setQuantity(quantity - 20)}
                      aria-label="button for remove product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue disabled:opacity-50"
                      disabled={quantity <= 20}
                    >
                      <svg
                        className="fill-current"
                        width="16"
                        height="2"
                        viewBox="0 0 16 2"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M-8.548e-08 0.977778C-3.82707e-08 0.437766 0.437766 3.82707e-08 0.977778 8.548e-08L15.0222 1.31328e-06C15.5622 1.36049e-06 16 0.437767 16 0.977779C16 1.51779 15.5622 1.95556 15.0222 1.95556L0.977778 1.95556C0.437766 1.95556 -1.32689e-07 1.51779 -8.548e-08 0.977778Z"
                          fill=""
                        />
                      </svg>
                    </button>
                    
                    <div className="flex flex-col items-center">
                      <span className="flex items-center justify-center w-20 h-10 rounded-[5px] border border-gray-4 bg-white font-medium text-dark">
                        {quantity}
                      </span>
                      <span className="text-[10px] font-bold text-blue mt-1 uppercase tracking-tighter">
                        {quantity / 20} Kodi
                      </span>
                    </div>

                    <button
                      onClick={() => setQuantity(quantity + 20)}
                      aria-label="button for add product"
                      className="flex items-center justify-center w-10 h-10 rounded-[5px] bg-gray-2 text-dark ease-out duration-200 hover:text-blue"
                    >
                      <svg
                        className="fill-current"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8.08889 0C8.6289 2.36047e-08 9.06667 0.437766 9.06667 0.977778L9.06667 15.0222C9.06667 15.5622 8.6289 16 8.08889 16C7.54888 16 7.11111 15.5622 7.11111 15.0222L7.11111 0.977778C7.11111 0.437766 7.54888 -2.36047e-08 8.08889 0Z"
                          fill=""
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M0 7.91111C4.72093e-08 7.3711 0.437766 6.93333 0.977778 6.93333L15.0222 6.93333C15.5622 6.93333 16 7.3711 16 7.91111C16 8.45112 15.5622 8.88889 15.0222 8.88889L0.977778 8.88889C0.437766 8.88889 -4.72093e-08 8.45112 0 7.91111Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                <button
                  disabled={quantity === 0}
                  onClick={() => handleAddToCart()}
                  className="w-full sm:w-auto inline-flex items-center justify-center font-black text-sm uppercase tracking-widest text-white bg-blue py-5 px-10 rounded-xl ease-out duration-200 hover:bg-blue-dark shadow-lg transform hover:scale-[1.01]"
                >
                  Tambah
                </button>

                <button
                  onClick={handleWishlist}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest text-white py-5 px-10 rounded-xl ease-out duration-200 shadow-lg transform hover:scale-[1.01] transition-all ${
                    isWishlisted ? "bg-red hover:bg-red-dark" : "bg-blue hover:bg-blue-dark"
                  }`}
                >
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill={isWishlisted ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  >
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
                  </svg>
                  {isWishlisted ? "Terfavorit" : "Favorit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
