"use client";
import React, { useEffect, useRef, useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import dynamic from "next/dynamic";
const RecentlyViewdItems = dynamic(() => import("./RecentlyViewd"), { ssr: false });
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";
import { addItemToWishlist, removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartSync } from "@/hooks/useCartSync";
import { useWishlistSync } from "@/hooks/useWishlistSync";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import Link from "next/link";
import KodiSizeMatrix, { ColorVariant } from "./KodiSizeMatrix";
import { calculateKodiPrice, isValidKodiQuantity, formatRupiah, getDiscountTiers, KODI_SIZE, getKodiDiscount, pcsToKodi } from "@/utils/kodiPricing";

const initialReviews = [
  {
    id: 1,
    name: "Ibu Siti",
    role: "Orang Tua Murid",
    image: "/images/users/user-01.jpg",
    rating: 5,
    comment: "Kualitas seragamnya sangat bagus, anak saya sangat nyaman memakainya ke sekolah. Terima kasih Toko Seragam!",
  }
];

const getStoredProduct = () => {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem("productDetails");
  if (!saved) return null;

  try {
    return JSON.parse(saved);
  } catch {
    localStorage.removeItem("productDetails");
    return null;
  }
};

const ShopDetails = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const productIdFromUrl = searchParams.get("id");
  const { syncCartItemToSupabase } = useCartSync();
  const { syncItemToSupabase } = useWishlistSync();

  const productFromRedux = useAppSelector(
    (state) => state.productDetailsReducer.value
  );

  const cartItems = useAppSelector((state) => state.cartReducer.items);

  const [product, setProduct] = useState<any>(null);
  const [activeColor, setActiveColor] = useState("");
  const { openPreviewModal } = usePreviewSlider();
  const { openCartModal } = useCartModalContext();
  const [previewImg, setPreviewImg] = useState(0);

  const [type, setType] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [sim, setSim] = useState("");
  const [variantBreakdown, setVariantBreakdown] = useState<{ [key: string]: number }>({});
  const [activeTab, setActiveTab] = useState("tabTwo");
  const [isReviewDropdownOpen, setIsReviewDropdownOpen] = useState(false);

  // Review states
  const [reviews, setReviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const hasSeededDummyReview = useRef(false);

  const syncProductReviewSummary = async () => {
    if (!product?.id) return;
    
    const { data: ratingsData } = await supabase.from("testimonials").select("rating").eq('product_id', product.id);
    const totalReviews = ratingsData?.length || 0;
    const avgRating =
      totalReviews > 0
        ? Number(
          (
            ratingsData.reduce((sum: number, row: any) => sum + Number(row.rating || 0), 0) /
            totalReviews
          ).toFixed(1)
        )
        : 0;

    await supabase.from("products").update({
      reviews: totalReviews,
      rating: avgRating
    }).eq("id", product.id);

    setProduct((prev: any) =>
      prev?.id === product.id
        ? {
          ...prev,
          reviews: totalReviews,
          rating: avgRating
        }
        : prev
    );
  };

  useEffect(() => {
    let isMounted = true;

    const fetchReviewsSafe = async () => {
      if (!initialProduct?.id) return;
      
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .eq('product_id', initialProduct.id)
        .order('created_at', { ascending: false });

      if (!isMounted) return;

      if (data && data.length > 0) {
        const uniqueReviews = data.filter((item: any, index: number, arr: any[]) => {
          return arr.findIndex((other: any) =>
            other.name === item.name &&
            other.comment === item.comment &&
            other.rating === item.rating
          ) === index;
        });

        const formattedReviews = uniqueReviews.map((item: any) => ({
          id: item.id,
          name: item.name,
          role: item.role,
          image: item.image_url || "/images/users/user-01.jpg",
          rating: item.rating,
          comment: item.comment
        }));
        
        if (isMounted) {
          setReviews(formattedReviews);
          
          const derivedReviewsCount = formattedReviews.length;
          const derivedRating = derivedReviewsCount > 0
            ? Number((formattedReviews.reduce((sum, rev) => sum + Number(rev.rating || 0), 0) / derivedReviewsCount).toFixed(1))
            : 0;

          setProduct((prev: any) =>
            prev?.id ? { ...prev, reviews: derivedReviewsCount, rating: derivedRating } : prev
          );
        }
        return;
      }

      if (hasSeededDummyReview.current) {
        if (isMounted) setReviews(initialReviews);
        return;
      }
      hasSeededDummyReview.current = true;

      // Seed dummy review...
      const dummyPayload = {
        product_id: initialProduct.id,
        name: "Ibu Siti",
        role: "Orang Tua Murid",
        comment: "Kualitas seragamnya sangat bagus, anak saya sangat nyaman memakainya ke sekolah. Terima kasih Toko Seragam!",
        rating: 5,
        image_url: "/images/users/user-01.jpg"
      };

      const { data: existingDummy } = await supabase
        .from('testimonials')
        .select('id,name,role,comment,rating,image_url')
        .eq('product_id', initialProduct.id)
        .eq('name', dummyPayload.name)
        .eq('comment', dummyPayload.comment)
        .eq('rating', dummyPayload.rating)
        .limit(1);

      if (!isMounted) return;

      if (existingDummy && existingDummy.length > 0) {
        const dummy = existingDummy[0];
        setReviews([{
          id: dummy.id,
          name: dummy.name,
          role: dummy.role,
          image: dummy.image_url || "/images/users/user-01.jpg",
          rating: dummy.rating,
          comment: dummy.comment
        }]);
        return;
      }

      const { data: seededData } = await supabase.from('testimonials').insert([dummyPayload]).select('*');
      if (!isMounted) return;

      if (seededData && seededData.length > 0) {
        const seeded = seededData[0];
        setReviews([{
          id: seeded.id,
          name: seeded.name,
          role: seeded.role,
          image: seeded.image_url || "/images/users/user-01.jpg",
          rating: seeded.rating,
          comment: seeded.comment
        }]);
      } else {
        setReviews(initialReviews);
      }
    };

    fetchReviewsSafe();

    // Set up Realtime subscription (filter by product_id on the client side since realtime filters need exact match config on server)
    const channel = supabase
      .channel(`testimonials-realtime-v2-${initialProduct?.id || 'new'}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'testimonials' },
        (payload: any) => {
          if (!isMounted) return;
          const newItem = payload.new;
          if (newItem.product_id !== initialProduct?.id) return; // Only process reviews for this product

          const formattedReview = {
            id: newItem.id,
            name: newItem.name,
            role: newItem.role || "Pembeli Terverifikasi",
            image: newItem.image_url || "/images/users/user-01.jpg",
            rating: newItem.rating,
            comment: newItem.comment
          };
          
          setReviews(prev => {
            if (prev.some(r => r.id === formattedReview.id)) return prev;
            return [formattedReview, ...prev];
          });
          
          syncProductReviewSummary();
        }
      )
      .subscribe();

    const fetchLatestProductSafe = async () => {
      let initialProduct = productFromRedux;

      if (productIdFromUrl) {
        const normalizedId = Number(productIdFromUrl);
        const lookupId = Number.isNaN(normalizedId) ? productIdFromUrl : normalizedId;

        const { data: directProduct } = await supabase
          .from('products')
          .select('*')
          .eq('id', lookupId)
          .maybeSingle();

        if (!isMounted) return;

        if (directProduct) {
          initialProduct = directProduct;
        } else {
          localStorage.removeItem("productDetails");
          setProduct({ title: "NOT_FOUND" });
          return;
        }
      }

      if (!isMounted) return;

      if (!initialProduct || !initialProduct.id) {
        if (!productIdFromUrl) {
          initialProduct = productFromRedux && productFromRedux.title ? productFromRedux : getStoredProduct();
        }
      }

      if (!initialProduct || !initialProduct.id) {
        if (!productIdFromUrl) {
          router.replace("/shop-with-sidebar");
          return;
        }
        setProduct({ title: "NOT_FOUND" });
        return;
      }

      const { data: updatedProduct, error } = await supabase.from('products').select('*').eq('id', initialProduct.id).maybeSingle();
      if (!isMounted) return;

      if (updatedProduct && !error) {
        // Setup Variants logic (condensed for brevety as in previous view)
        const dbSizes = Array.isArray(updatedProduct.sizes) ? updatedProduct.sizes : ["7,8", "9,10", "11,12", "13,14", "15,16", "17,18", "19,20"];
        const dbColors = Array.isArray(updatedProduct.colors) ? updatedProduct.colors : ["Putih"];
        const dbSleeves = Array.isArray(updatedProduct.sleeves) ? updatedProduct.sleeves : ["Pendek", "Panjang"];

        if (isMounted) {
          setActiveColor(dbColors[0] || "");
          setType((dbSleeves[0] || "").toLowerCase());
          setSelectedSize(dbSizes[0] || "");
          
          const allPrices = [updatedProduct.discounted_price, updatedProduct.price, updatedProduct.discounted_price_panjang, updatedProduct.price_panjang].filter(p => p && p > 0);
          const displayPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
          const finalProduct = {
            ...updatedProduct,
            imgs: {
              thumbnails: updatedProduct.thumbnails || [updatedProduct.image_url],
              previews: updatedProduct.previews || [updatedProduct.image_url]
            },
            discountedPrice: displayPrice,
            price: updatedProduct.price || updatedProduct.price_panjang || displayPrice,
            priceLong: updatedProduct.price_panjang,
            discountedPriceLong: updatedProduct.discounted_price_panjang,
            size_prices: updatedProduct.size_prices || {},
            colors: dbColors,
            sizes: dbSizes,
            sleeves: dbSleeves
          };
          setProduct(finalProduct);
          localStorage.setItem("productDetails", JSON.stringify(finalProduct));
        }
      } else if (isMounted) {
        localStorage.removeItem("productDetails");
        setProduct({ title: "NOT_FOUND" });
      }
    };

    fetchLatestProductSafe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [productIdFromUrl, productFromRedux, router]);

  const handleVariantChange = (key: string, value: number) => {
    setVariantBreakdown(prev => ({ ...prev, [key]: value }));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment || !name || !email) {
      alert("Silakan lengkapi ulasan Anda.");
      return;
    }

    try {
      const { error } = await supabase.from('testimonials').insert([{
        product_id: product.id,
        name,
        role: "Pembeli Terverifikasi",
        comment,
        rating,
        image_url: "/images/users/user-01.jpg"
      }]);

      if (error) throw error;

      // Note: We no longer manually update state 'setReviews' here.
      // The Realtime subscription added above will catch the INSERT and update the state for us.
      
      setRating(0);
      setComment("");
      setName("");
      setEmail("");
      alert("Terima kasih! Ulasan Anda telah terkirim.");
    } catch (error: any) {
      alert("Gagal mengirim ulasan: " + error.message);
    }
  };

  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  const isWishlisted = product ? wishlistItems.some((item) => item.id === product.id) : false;

  if (!product || !product.title || product.title === "NOT_FOUND") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-xl font-medium text-dark">
          {product?.title === "NOT_FOUND" ? "Produk tidak ditemukan atau telah dihapus." : "Memuat produk..."}
        </p>
        {product?.title === "NOT_FOUND" && (
          <Link href="/shop-with-sidebar" className="text-blue hover:underline font-bold">
            Kembali ke Toko
          </Link>
        )}
      </div>
    );
  }

  const totalPcs = Object.values(variantBreakdown).reduce((sum, v) => sum + v, 0);
  const isKodiValid = isValidKodiQuantity(totalPcs);
  const isLongSleeve = type.toLowerCase().includes("panjang");

  // New: Check for size-specific price for the main header
  const customPrice = product.size_prices?.[selectedSize]?.[isLongSleeve ? 'panjang' : 'pendek'];

  const currentUnitPrice = customPrice
    ? customPrice
    : (isLongSleeve && product.discountedPriceLong
      ? product.discountedPriceLong
      : (isLongSleeve && product.priceLong
        ? product.priceLong
        : (product.discountedPrice || product.price)));

  const currentNormalUnitPrice = isLongSleeve && product.priceLong
    ? product.priceLong
    : product.price;

  const kodiPriceValue = calculateKodiPrice(currentUnitPrice);
  const normalKodiPriceValue = calculateKodiPrice(currentNormalUnitPrice);

  const handleAddToCart = async () => {
    if (!isKodiValid) return;

    // Calculate total value based on the specific price of each variant in the breakdown
    const totalVal = Object.entries(variantBreakdown).reduce((total, [key, val]) => {
      const [size, ...colorParts] = key.split("-");
      const colorLabel = colorParts.join("-");
      const isPanjang = colorLabel.toLowerCase().includes("panjang");
      const customPrice = (product as any).size_prices?.[size]?.[isPanjang ? 'panjang' : 'pendek'];

      const upPendek = product.discountedPrice || product.price || 0;
      const upPanjang = (product as any).discountedPriceLong || (product as any).priceLong || upPendek;

      const activePrice = customPrice ? customPrice : (isPanjang ? upPanjang : upPendek);
      return total + (activePrice * val);
    }, 0);

    const totalKodiCount = pcsToKodi(totalPcs);
    const volumeDiscount = getKodiDiscount(totalKodiCount);
    const finalTotalVal = volumeDiscount ? totalVal * (1 - volumeDiscount.discount) : totalVal;
    const averageUnitPrice = finalTotalVal / totalPcs;

    const existingItem = cartItems.find(
      (i: any) =>
        i.id === product.id &&
        i.color === activeColor &&
        i.sleeve === type &&
        i.fit === sim
    );

    const updatedQuantity = (existingItem?.quantity || 0) + totalPcs;
    const updatedBreakdown = { ...(existingItem?.variantBreakdown || {}) };
    Object.entries(variantBreakdown).forEach(([key, qty]) => {
      updatedBreakdown[key] = (updatedBreakdown[key] || 0) + qty;
    });

    const cartItem = {
      ...product,
      quantity: totalPcs,
      variantBreakdown,
      color: activeColor,
      sleeve: type,
      fit: sim,
      weight: product.weight || 250,
      price: currentNormalUnitPrice, // Still keep the "base" normal price for reference
      discountedPrice: averageUnitPrice
    };
    dispatch(addItemToCart(cartItem));

    // Sync total state to Supabase
    await syncCartItemToSupabase({
      ...cartItem,
      quantity: updatedQuantity,
      variantBreakdown: updatedBreakdown
    });
  };
  const handleBuyNow = async () => {
    if (!isKodiValid) return;

    // Calculate total value based on the specific price of each variant in the breakdown
    const totalVal = Object.entries(variantBreakdown).reduce((total, [key, val]) => {
      const [size, ...colorParts] = key.split("-");
      const colorLabel = colorParts.join("-");
      const isPanjang = colorLabel.toLowerCase().includes("panjang");
      const customPrice = (product as any).size_prices?.[size]?.[isPanjang ? 'panjang' : 'pendek'];

      const upPendek = product.discountedPrice || product.price || 0;
      const upPanjang = (product as any).discountedPriceLong || (product as any).priceLong || upPendek;

      const activePrice = customPrice ? customPrice : (isPanjang ? upPanjang : upPendek);
      return total + (activePrice * val);
    }, 0);

    const totalKodiCount = pcsToKodi(totalPcs);
    const volumeDiscount = getKodiDiscount(totalKodiCount);
    const finalTotalVal = volumeDiscount ? totalVal * (1 - volumeDiscount.discount) : totalVal;
    const averageUnitPrice = finalTotalVal / totalPcs;

    const existingItem = cartItems.find(
      (i: any) =>
        i.id === product.id &&
        i.color === activeColor &&
        i.sleeve === type &&
        i.fit === sim
    );

    const updatedQuantity = (existingItem?.quantity || 0) + totalPcs;
    const updatedBreakdown = { ...(existingItem?.variantBreakdown || {}) };
    Object.entries(variantBreakdown).forEach(([key, qty]) => {
      updatedBreakdown[key] = (updatedBreakdown[key] || 0) + qty;
    });

    const cartItem = {
      ...product,
      quantity: totalPcs,
      variantBreakdown,
      color: activeColor,
      sleeve: type,
      fit: sim,
      weight: product.weight || 250,
      price: currentNormalUnitPrice,
      discountedPrice: averageUnitPrice
    };
    dispatch(addItemToCart(cartItem));
    
    // Sync total state to Supabase
    await syncCartItemToSupabase({
      ...cartItem,
      quantity: updatedQuantity,
      variantBreakdown: updatedBreakdown
    });

    router.push("/checkout");
  };

  const handleWishlist = async () => {
    if (isWishlisted) {
      dispatch(removeItemFromWishlist(product.id));
      await syncItemToSupabase(product, false);
    } else {
      dispatch(addItemToWishlist({ ...product, quantity: 1 }));
      await syncItemToSupabase(product, true);
    }
  };

  const types = product?.sleeves?.length > 0
    ? product.sleeves.map((s: string) => ({ id: s.toLowerCase(), title: s }))
    : [{ id: "pendek", title: "Lengan Pendek" }, { id: "panjang", title: "Lengan Panjang" }];

  const sims = product?.fits?.length > 0
    ? product.fits.map((s: string) => ({ id: s.toLowerCase(), title: s }))
    : [{ id: "reguler", title: "Reguler" }, { id: "slimfit", title: "Slim Fit" }];

  const colors = product?.colors?.length > 0 ? product.colors : ["white", "blue", "red", "grey"];

  return (
    <>
      <Breadcrumb title={"Detail Produk"} pages={["detail produk"]} />
      <section className="overflow-hidden mt-0 pt-[10px] pb-4 lg:pb-5 lg:pt-8 bg-white animate-fadeIn">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex flex-col lg:flex-row gap-8 xl:gap-15 items-stretch">

            {/* Left: Gallery Section */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <div className="flex-1 bg-white rounded-2xl shadow-xl p-4 sm:p-8 flex items-center justify-center border border-gray-3 overflow-hidden group min-h-[300px] sm:min-h-[500px] relative">
                <Image
                  src={product.imgs?.previews?.[previewImg] || product.image_url || "/images/products/seragam-smp.png"}
                  alt={product.title}
                  width={500}
                  height={500}
                  priority
                  className="object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={handleWishlist}
                  className={`absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-full shadow-3 transition-all duration-500 z-10 group/love
                    ${isWishlisted 
                      ? 'bg-gradient-to-br from-red-light to-red text-white scale-110 shadow-red-light/30' 
                      : 'bg-white/80 backdrop-blur-md text-dark hover:text-red border border-white/40 hover:scale-110 hover:shadow-lg'
                    }`}
                >
                  <svg 
                    width="22" 
                    height="22" 
                    viewBox="0 0 24 24" 
                    fill={isWishlisted ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`transition-all duration-500 ${isWishlisted ? 'drop-shadow-md' : 'group-hover/love:scale-110'}`}
                  >
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  {/* Subtle ring animation when active */}
                  {isWishlisted && (
                    <span className="absolute inset-0 rounded-full bg-red animate-ping opacity-20 -z-10"></span>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-4 mt-10 lg:mt-6 justify-center">
                {(product.imgs?.thumbnails || [product.image_url]).map((item, key) => (
                  <button
                    key={key}
                    onClick={() => setPreviewImg(key)}
                    className={`w-22 h-22 rounded-xl border-2 overflow-hidden bg-white shadow-md transition-all p-1 ${key === previewImg ? "border-blue ring-4 ring-blue/10 scale-105" : "border-transparent opacity-60 hover:opacity-100 hover:scale-105"}`}
                  >
                    <Image
                      src={item}
                      alt={`Product thumbnail ${key + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info Section */}
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-6 sm:p-10 pb-0 sm:pb-0 rounded-2xl shadow-xl border border-gray-3 space-y-8 h-full animate-fadeIn overflow-hidden flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="inline-flex items-center px-3 py-1.5 bg-green text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">
                      Diskon 20%
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h1 className="font-bold text-2xl lg:text-4xl text-[#212121] leading-tight">{product.title}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={i < Math.round(product.rating || 0) ? "fill-[#FFA645]" : "fill-gray-3"}
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
                          Peringkat {product.rating || 0}{" "}
                          <button
                            type="button"
                            onClick={() => setIsReviewDropdownOpen((prev) => !prev)}
                            className="font-normal opacity-60 hover:text-blue transition-colors"
                          >
                            ({reviews.length || 0} ulasan)
                          </button>
                        </span>

                        {isReviewDropdownOpen && (
                          <div className="absolute top-full left-0 mt-2 w-[320px] rounded-2xl border border-gray-3 bg-white p-4 shadow-2xl z-20 animate-fadeIn">
                            <div className="max-h-60 overflow-y-auto space-y-3 no-scrollbar">
                              {reviews.length > 0 ? (
                                reviews.slice(0, 5).map((rev) => (
                                  <div key={rev.id} className="rounded-xl bg-gray-1 p-3 border border-gray-2 hover:border-blue/20 transition-all hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-1.5">
                                      <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue font-black text-xs flex-shrink-0">
                                        {rev.name ? rev.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                          <p className="text-[14px] font-bold text-dark">{rev.name}</p>
                                          <div className="flex gap-0.5">
                                            {[...Array(5)].map((_, i) => (
                                              <svg
                                                key={i}
                                                className={i < rev.rating ? "fill-[#FFA645]" : "fill-gray-3"}
                                                width="10"
                                                height="10"
                                                viewBox="0 0 18 18"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                              >
                                                <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" />
                                              </svg>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-[14px] text-dark-4 leading-relaxed line-clamp-3 italic font-medium">"{rev.comment}"</p>
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
                                <button 
                                  onClick={() => {
                                    setActiveTab("tabThree");
                                    setIsReviewDropdownOpen(false);
                                    document.getElementById('reviews-tabs')?.scrollIntoView({ behavior: 'smooth' });
                                  }} 
                                  className="text-[11px] font-black text-blue hover:text-blue-dark uppercase tracking-widest transition-colors"
                                >
                                  Lihat Semua Ulasan
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-green text-sm font-bold">
                        <div className="w-5 h-5 rounded-full bg-green/10 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                        </div>
                        {product.stock && product.stock >= 20 ? `Stok: ${Math.floor(product.stock / 20)} Kodi` : "Stok Tersedia"}
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="space-y-4 pt-4 border-t border-gray-2">
                    <span className="text-[14px] font-black uppercase tracking-widest text-dark">HARGA KODI (20 UNIT)</span>
                    <div className="flex items-center gap-4">
                      <h2 className="text-3xl sm:text-5xl font-black text-[#212121] tracking-tighter">{formatRupiah(kodiPriceValue)}</h2>
                      {currentNormalUnitPrice > currentUnitPrice && (
                        <span className="text-lg sm:text-xl text-dark line-through mt-2">
                          {formatRupiah(normalKodiPriceValue)}
                        </span>
                      )}
                    </div>
                    {product.gender && (
                      <div className="flex flex-col gap-1.5 mb-4">
                        <span className="text-[12px] font-black uppercase tracking-widest text-[#212121]">GENDER:</span>
                        <span className="px-4 py-2 rounded-lg bg-blue/5 text-[14px] font-bold text-blue border border-blue/20 capitalize w-fit">
                          {product.gender}
                        </span>
                      </div>
                    )}
                    <div className="pt-1">
                      <div className="text-[#212121] text-[16px] font-medium leading-relaxed space-y-2">
                        {(product.description || "Setelan seragam sekolah kualitas premium dengan bahan terbaik.")
                          .split(".")
                          .filter((s: string) => s.trim().length > 0)
                          .map((sentence: string, i: number) => (
                            <p key={i}>{sentence.trim()}.</p>
                          ))}
                      </div>
                    </div>

                    {/* Share Buttons */}
                    <div className="pt-4 border-t border-gray-1">
                      <span className="text-[12px] font-black uppercase tracking-widest text-dark-4 mb-3 block">Bagikan Ke:</span>
                      <div className="flex flex-wrap gap-3">
                        {/* WhatsApp */}
                        <button 
                          onClick={() => {
                            const url = `https://wa.me/?text=${encodeURIComponent(`Cek produk ini di Seragam Sekolah: ${product.title} - ${window.location.href}`)}`;
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-all font-bold text-sm border border-[#25D366]/20"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                          WhatsApp
                        </button>

                        {/* Facebook */}
                        <button 
                          onClick={async () => {
                            const currentUrl = window.location.href;
                            
                            // Try native share first (works great on mobile, bypasses some FB scraper issues)
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: product.title,
                                  text: `Cek produk ini di Seragam Sekolah: ${product.title}`,
                                  url: currentUrl,
                                });
                                return;
                              } catch (err) {
                                if ((err as Error).name === 'AbortError') return;
                                // If native share fails (other than user cancel), fall through to web share
                              }
                            }
                            
                            // Fallback to web share
                            if (currentUrl.includes('localhost')) {
                              toast.error("Facebook tidak bisa membaca link localhost. Web harus online.");
                            }
                            
                            const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
                            window.open(shareUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white transition-all font-bold text-sm border border-[#1877F2]/20"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </button>

                        {/* Instagram (Native Share or Copy) */}
                        <button 
                          onClick={async () => {
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: product.title,
                                  text: `Cek produk ini: ${product.title}`,
                                  url: window.location.href,
                                });
                              } catch (err) {
                                if ((err as Error).name !== 'AbortError') {
                                  navigator.clipboard.writeText(window.location.href);
                                  toast.success("Link disalin! Silakan tempel di IG Anda.");
                                }
                              }
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              toast.success("Link disalin! Silakan tempel di IG Anda.");
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#E4405F]/10 text-[#E4405F] hover:bg-[#E4405F] hover:text-white transition-all font-bold text-sm border border-[#E4405F]/20"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                          Instagram
                        </button>

                        {/* TikTok (Native Share or Copy) */}
                        <button 
                          onClick={async () => {
                            if (navigator.share) {
                              try {
                                await navigator.share({
                                  title: product.title,
                                  text: `Cek produk ini: ${product.title}`,
                                  url: window.location.href,
                                });
                              } catch (err) {
                                if ((err as Error).name !== 'AbortError') {
                                  navigator.clipboard.writeText(window.location.href);
                                  toast.success("Link disalin! Silakan tempel di TikTok Anda.");
                                }
                              }
                            } else {
                              navigator.clipboard.writeText(window.location.href);
                              toast.success("Link disalin! Silakan tempel di TikTok Anda.");
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 rounded-full bg-dark/5 text-dark hover:bg-dark hover:text-white transition-all font-bold text-sm border border-dark/10"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
                          </svg>
                          TikTok
                        </button>
                      </div>
                    </div>

                    </div>
                  {/* Wholesale Offers - Flush at Bottom */}
                  <div className="-mx-6 sm:-mx-10 p-6 sm:p-10 bg-blue/5 border-t border-blue/10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue/20 rounded-lg text-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                      </div>
                      <span className="font-black text-blue text-sm tracking-tight uppercase">Penawaran Grosir Sekolah</span>
                    </div>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {getDiscountTiers().map((tier, idx) => (
                        <li key={idx} className="bg-white p-5 rounded-xl border border-blue/10 shadow-sm flex flex-col items-center text-center hover:border-blue/30 transition-all">
                          <span className="text-[10px] font-bold opacity-60 mb-1">Minimal</span>
                          <span className="text-2xl font-black">
                            {tier.label.includes("→") ? tier.label.split("→")[0].trim() : tier.label}
                          </span>
                          {tier.label.includes("→") && (
                            <span className="text-sm font-bold text-blue">
                              {tier.label.split("→")[1].trim()} OFF
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

          {/* Grid: Kodi Matrix (Left) + Wholesale Offers (Right) - Full Width Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 lg:mt-12 items-start">
            {/* Column 1: Kodi Configuration (Size Matrix) */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-3 animate-fadeIn overflow-hidden">
              <KodiSizeMatrix
                sizes={Array.isArray((product as any).sizes) ? (product as any).sizes : (typeof (product as any).sizes === "string" ? (product as any).sizes.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : ["7,8", "9,10", "11,12", "13,14", "15,16", "17,18", "19,20"])}
                colors={(() => {
                  const dbColors = Array.isArray((product as any).colors) ? (product as any).colors : (typeof (product as any).colors === "string" ? (product as any).colors.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : ["Putih"]);
                  const dbSleeves = Array.isArray((product as any).sleeves) ? (product as any).sleeves : (typeof (product as any).sleeves === "string" ? (product as any).sleeves.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : ["Pendek", "Panjang"]);
                  const variants: ColorVariant[] = [];
                  dbColors.forEach(c => {
                    dbSleeves.forEach(s => {
                      const colorLower = c.toLowerCase();
                      const sleeveLower = s.toLowerCase();
                      let isAllowed = true;

                      if ((colorLower === "putih" || colorLower === "merah") && (sleeveLower === "smp" || sleeveLower === "sma" || sleeveLower === "smk" || sleeveLower === "pramuka")) isAllowed = false;
                      if (colorLower === "biru" && (sleeveLower === "sd" || sleeveLower === "sma" || sleeveLower === "smk" || sleeveLower === "pramuka")) isAllowed = false;
                      if (colorLower === "abu-abu" && (sleeveLower === "sd" || sleeveLower === "smp" || sleeveLower === "smk" || sleeveLower === "pramuka")) isAllowed = false;
                      if (colorLower === "cokelat" && (sleeveLower === "sd" || sleeveLower === "smp" || sleeveLower === "sma" || sleeveLower === "smk")) isAllowed = false;
                      if (sleeveLower === "pramuka" && colorLower !== "cokelat") isAllowed = false;

                      if (isAllowed) {
                        variants.push({ label: `${c} ${s}`, value: c.toLowerCase(), type: s });
                      }
                    });
                  });
                  return variants;
                })()}
                unitPrice={currentUnitPrice}
                unitPricePendek={product.discountedPrice || product.price}
                unitPricePanjang={(product as any).discountedPriceLong || (product as any).priceLong || product.price}
                sizePrices={(product as any).size_prices || {}}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                activeSleeve={type}
                setSleeveType={setType}
                values={variantBreakdown}
                onChange={(key, val) => setVariantBreakdown((prev) => ({ ...prev, [key]: val }))}
              />
            </div>

            {/* Column 2: Wholesale Offers Card + CTA Buttons */}
            <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-3 animate-fadeIn flex flex-col justify-between min-h-full overflow-hidden">
              <div className="space-y-8">

                {/* Kodi Summary Panel & CTA Buttons (Visible only when quantity > 0) */}
                {totalPcs > 0 ? (
                  <div className="space-y-8 animate-fadeIn">
                    <div className="-mx-6 -mt-6 p-6 bg-blue/5 rounded-b-2xl rounded-t-none sm:rounded-2xl border-b border-blue/10 sm:border border-x-0 sm:border-x border-t-0 sm:border-t sm:mx-0 sm:mt-0 shadow-inner">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[14px] font-black text-dark">Total Unit Terpilih</span>
                        <span className={`text-3xl font-black ${isKodiValid ? 'text-green' : 'text-dark'}`}>{totalPcs.toLocaleString("id-ID")} Unit</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[14px] font-black text-dark">Validasi Kodian</span>
                        <span className={`text-sm font-black px-4 py-2 rounded-full ${isKodiValid ? 'bg-green/10 text-green' : 'bg-orange/10 text-orange'}`}>
                          {isKodiValid ? `✓ ${(totalPcs / 20).toLocaleString("id-ID")} Kodi Siap` : `Min. 1 Kodi (Sisa ${(totalPcs % 20).toLocaleString("id-ID")} Unit)`}
                        </span>
                      </div>
                      <div className="flex flex-col pt-4 border-t border-blue/10 mt-4 gap-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[14px] font-black text-dark">Estimasi Harga</span>
                          <span className={`text-2xl font-black ${isKodiValid ? 'text-blue' : 'text-dark-4 opacity-50'}`}>
                            {(() => {
                              const totalVal = Object.entries(variantBreakdown).reduce((total, [key, val]) => {
                                const [size, ...colorParts] = key.split("-");
                                const colorLabel = colorParts.join("-");
                                const isPanjang = colorLabel.toLowerCase().includes("panjang");
                                const customPrice = (product as any).size_prices?.[size]?.[isPanjang ? 'panjang' : 'pendek'];

                                const upPendek = product.discountedPrice || product.price || 0;
                                const upPanjang = (product as any).discountedPriceLong || (product as any).priceLong || upPendek;

                                const activePrice = customPrice ? customPrice : (isPanjang ? upPanjang : upPendek);
                                return total + (activePrice * val);
                              }, 0);

                              const totalKodi = pcsToKodi(totalPcs);
                              const volumeDiscount = getKodiDiscount(totalKodi);
                              const finalPrice = volumeDiscount ? totalVal * (1 - volumeDiscount.discount) : totalVal;

                              return formatRupiah(finalPrice);
                            })()}
                          </span>
                        </div>
                        {(() => {
                          const totalKodi = pcsToKodi(totalPcs);
                          const volumeDiscount = getKodiDiscount(totalKodi);
                          if (volumeDiscount && isKodiValid) {
                            const originalTotal = Object.entries(variantBreakdown).reduce((total, [key, val]) => {
                              const [size, ...colorParts] = key.split("-");
                              const colorLabel = colorParts.join("-");
                              const isPanjang = colorLabel.toLowerCase().includes("panjang");
                              const customPrice = (product as any).size_prices?.[size]?.[isPanjang ? 'panjang' : 'pendek'];
                              const upPendek = product.discountedPrice || product.price || 0;
                              const upPanjang = (product as any).discountedPriceLong || (product as any).priceLong || upPendek;
                              const activePrice = customPrice ? customPrice : (isPanjang ? upPanjang : upPendek);
                              return total + (activePrice * val);
                            }, 0);

                            return (
                              <div className="flex flex-col items-end gap-1">
                                <span className="text-sm text-dark-4 line-through opacity-60">
                                  {formatRupiah(originalTotal)}
                                </span>
                                <span className="px-3 py-1 rounded-md bg-orange/10 text-orange text-[10px] font-black uppercase tracking-widest">
                                  Potongan {volumeDiscount.label.split("→")[1].trim()}
                                </span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-2">
                      <button
                        onClick={handleAddToCart}
                        disabled={!isKodiValid}
                        className={`w-full sm:flex-1 h-16 rounded-full font-black text-sm uppercase tracking-widest transition-all border-2 ${isKodiValid ? 'border-blue text-blue bg-white hover:bg-blue hover:text-white hover:scale-[1.02] shadow-md' : 'border-gray-2 text-gray-3 bg-white cursor-not-allowed'}`}
                      >
                        TAMBAH KERANJANG
                      </button>
                      <button
                        onClick={handleBuyNow}
                        disabled={!isKodiValid}
                        className={`w-full sm:flex-1 h-16 rounded-full font-black text-sm uppercase tracking-widest transition-all ${isKodiValid ? 'bg-blue text-white hover:bg-blue-dark hover:scale-[1.02] shadow-lg' : 'bg-gray-1 text-gray-3 cursor-not-allowed'}`}
                      >
                        BELI SEKARANG
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-10 border-2 border-dashed border-gray-2 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-1 rounded-full flex items-center justify-center text-gray-3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
                    </div>
                    <div>
                      <p className="font-bold text-[21px] text-[#212121]">Silakan Pilih Kuantitas</p>
                      <p className="text-base text-[#212121]">Isi rincian ukuran di samping untuk memunculkan ringkasan pesanan.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="bg-white pb-20 pt-10">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-3">
            <div className="flex items-center gap-8 sm:gap-10 border-b border-gray-3 px-4 sm:px-10 bg-gray-1 overflow-x-auto no-scrollbar whitespace-nowrap">
              <button onClick={() => setActiveTab("tabOne")} className={`font-black text-[14px] uppercase tracking-widest py-6 border-b-4 transition-all flex-shrink-0 ${activeTab === "tabOne" ? "border-blue text-blue" : "border-transparent text-dark-4 hover:text-dark"}`}>Panduan Ukuran</button>
              <button onClick={() => setActiveTab("tabTwo")} className={`font-black text-[14px] uppercase tracking-widest py-6 border-b-4 transition-all flex-shrink-0 ${activeTab === "tabTwo" ? "border-blue text-blue" : "border-transparent text-dark-4 hover:text-dark"}`}>Informasi Bahan</button>
              <button onClick={() => setActiveTab("tabThree")} className={`font-black text-[14px] uppercase tracking-widest py-6 border-b-4 transition-all flex-shrink-0 ${activeTab === "tabThree" ? "border-blue text-blue" : "border-transparent text-dark-4 hover:text-dark"}`}>Ulasan ({reviews.length})</button>
            </div>
            <div className="px-0 py-6 sm:p-15">
              {activeTab === "tabOne" && (
                <div className="animate-fadeIn px-4 sm:px-0">
                  <div className="mb-8 px-4 sm:px-0">
                    <h4 className="font-black text-xl text-dark uppercase tracking-tight mb-2">Tabel Standar Ukuran Sekolah</h4>
                    <p className="text-sm text-dark-4">Gunakan panduan ini untuk memilih ukuran yang paling tepat sesuai kelas dan postur tubuh anak.</p>
                  </div>

                  {/* Swipe Hint for Mobile */}
                  <div className="flex items-center gap-2 mb-3 px-4 sm:hidden text-blue animate-pulse">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8L22 12L18 16M6 8L2 12L6 16" /></svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Geser untuk lihat rincian</span>
                  </div>

                  <div className="overflow-x-auto rounded-none sm:rounded-2xl border-y sm:border border-gray-3 shadow-sm bg-white">
                    <table className="w-full text-left border-collapse min-w-[800px] sm:min-w-[1000px]">
                      <thead>
                        <tr className="bg-gray-2 text-dark font-black text-[11px] uppercase tracking-widest border-b border-gray-3">
                          <th className="p-5 border-r border-gray-3">Kelas</th>
                          <th className="p-5 border-r border-gray-3">Umur</th>
                          <th className="p-5 border-r border-gray-3 text-center">Baju Size</th>
                          <th className="p-5 border-r border-gray-3 text-center">Rok/Celana</th>
                          <th className="p-5 border-r border-gray-3 text-center">Panjang (cm)</th>
                          <th className="p-5 border-r border-gray-3 text-center">L. Dada (cm)</th>
                          <th className="p-5 border-r border-gray-3 text-center">P. Rok/Cln (cm)</th>
                          <th className="p-5 border-r border-gray-3 text-center">L. Pinggang (cm)</th>
                          <th className="p-5 border-r border-gray-3 text-center">Berat (kg)</th>
                          <th className="p-5 text-center">Tinggi (cm)</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {[
                          { kelas: "Kelas 1", umur: "6-7 thn", baju: "7", rok: "3", pb: "46", ld: "76", pr: "68", lp: "48-60", bb: "15-19", tb: "118" },
                          { kelas: "Kelas 1", umur: "6-7 thn", baju: "8", rok: "4", pb: "48", ld: "78", pr: "69", lp: "49-62", bb: "20-22", tb: "120" },
                          { kelas: "Kelas 2", umur: "8 thn", baju: "9", rok: "5", pb: "50", ld: "80", pr: "72", lp: "50-64", bb: "22-24", tb: "122" },
                          { kelas: "Kelas 2", umur: "8 thn", baju: "10", rok: "6", pb: "52", ld: "82", pr: "74", lp: "52-66", bb: "24-25", tb: "125" },
                          { kelas: "Kelas 3", umur: "9 thn", baju: "11", rok: "7", pb: "55", ld: "84", pr: "76", lp: "54-72", bb: "25-28", tb: "130" },
                          { kelas: "Kelas 3", umur: "9 thn", baju: "12", rok: "8", pb: "56", ld: "86", pr: "78", lp: "56-74", bb: "28-30", tb: "134" },
                          { kelas: "Kelas 4", umur: "10 thn", baju: "13", rok: "8", pb: "56", ld: "86", pr: "78", lp: "56-74", bb: "28-30", tb: "134" },
                          { kelas: "Kelas 4", umur: "10 thn", baju: "14", rok: "9", pb: "60", ld: "91", pr: "80", lp: "58-80", bb: "30-35", tb: "137" },
                          { kelas: "Kelas 5", umur: "11 thn", baju: "14", rok: "9", pb: "60", ld: "91", pr: "80", lp: "58-80", bb: "30-35", tb: "137" },
                          { kelas: "Kelas 5", umur: "11 thn", baju: "15", rok: "10", pb: "64", ld: "94", pr: "82", lp: "62-88", bb: "35-40", tb: "140" },
                          { kelas: "Kelas 6", umur: "12 thn", baju: "15", rok: "M", pb: "64", ld: "94", pr: "85", lp: "64-90", bb: "45-50", tb: "145" },
                          { kelas: "Kelas 6", umur: "12 thn", baju: "16", rok: "L", pb: "65", ld: "96", pr: "88", lp: "64-90", bb: "45-50", tb: "150" },
                          { kelas: "JUMBO", umur: "JUMBO", baju: "17", rok: "LL", pb: "68", ld: "98", pr: "89", lp: "66-92", bb: "50-55", tb: "155" },
                          { kelas: "JUMBO", umur: "JUMBO", baju: "18", rok: "XL", pb: "70", ld: "100", pr: "91", lp: "68-94", bb: "55-60", tb: "160" },
                          { kelas: "JUMBO", umur: "JUMBO", baju: "19", rok: "2XL", pb: "72", ld: "104", pr: "93", lp: "70-96", bb: "60-65", tb: "165" },
                          { kelas: "JUMBO", umur: "JUMBO", baju: "20", rok: "3XL", pb: "74", ld: "106", pr: "95", lp: "72-98", bb: "65-70", tb: "170" },
                        ].map((row, idx) => (
                          <tr key={idx} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-1"} hover:bg-blue/5 transition-colors border-b border-gray-3 last:border-0`}>
                            <td className="p-5 font-bold text-dark border-r border-gray-3">{row.kelas}</td>
                            <td className="p-5 text-dark-4 border-r border-gray-3">{row.umur}</td>
                            <td className="p-5 text-center font-black text-blue border-r border-gray-3">{row.baju}</td>
                            <td className="p-5 text-center font-black text-dark-4 border-r border-gray-3">{row.rok}</td>
                            <td className="p-5 text-center border-r border-gray-3">{row.pb}</td>
                            <td className="p-5 text-center border-r border-gray-3">{row.ld}</td>
                            <td className="p-5 text-center border-r border-gray-3">{row.pr}</td>
                            <td className="p-5 text-center border-r border-gray-3">{row.lp}</td>
                            <td className="p-5 text-center border-r border-gray-3">{row.bb}</td>
                            <td className="p-5 text-center">{row.tb}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {activeTab === "tabTwo" && (
                <div className="animate-fadeIn max-w-3xl px-4 sm:px-0">
                  <div className="divide-y divide-gray-3">
                    {[
                      { label: "Bahan Utama", value: "Katun Premium / Oxford" },
                      { label: "Perawatan", value: "Cuci mesin suhu normal, jangan gunakan pemutih." },
                      { label: "Jahitan", value: "Ganda Ekstra Kuat (Standar Garmen)" }
                    ].map((row, idx) => (
                      <div key={idx} className="py-6 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0">
                        <span className="font-bold text-dark sm:w-1/3 text-sm sm:text-base uppercase sm:normal-case tracking-wider sm:tracking-normal">{row.label}</span>
                        <span className="text-dark-4 sm:flex-1 text-sm sm:text-base">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "tabThree" && (
                <div className="animate-fadeIn px-4 sm:px-0">
                  <div className="flex flex-col gap-8 mb-12">
                    {reviews.map((rev) => (
                      <div key={rev.id} className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                        <div className="flex items-center gap-4 sm:block">
                          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-blue/5 flex items-center justify-center text-blue font-black text-lg sm:text-xl flex-shrink-0 shadow-sm border border-blue/10">
                            {rev.name ? rev.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : '?'}
                          </div>
                          <div className="sm:hidden">
                            <h5 className="font-bold text-dark text-[14px]">{rev.name}</h5>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={i < (rev.rating || 5) ? "fill-[#FFA645]" : "fill-gray-4"}
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
                        </div>
                        <div className="flex-1 w-full">
                          <div className="hidden sm:flex items-center justify-between mb-2">
                            <h5 className="font-bold text-dark text-[14px]">{rev.name}</h5>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={i < (rev.rating || 5) ? "fill-[#FFA645]" : "fill-gray-4"}
                                  width="16"
                                  height="16"
                                  viewBox="0 0 18 18"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M16.7906 6.72187L11.7 5.93438L9.39377 1.09688C9.22502 0.759375 8.77502 0.759375 8.60627 1.09688L6.30002 5.9625L1.23752 6.72187C0.871891 6.77812 0.731266 7.25625 1.01252 7.50938L4.69689 11.3063L3.82502 16.6219C3.76877 16.9875 4.13439 17.2969 4.47189 17.0719L9.05627 14.5687L13.6125 17.0719C13.9219 17.2406 14.3156 16.9594 14.2313 16.6219L13.3594 11.3063L17.0438 7.50938C17.2688 7.25625 17.1563 6.77812 16.7906 6.72187Z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-blue uppercase tracking-widest mb-3 opacity-60">{rev.role}</p>
                          <div className="p-4 sm:p-5 bg-gray-2 rounded-2xl relative">
                            <div className="absolute -top-2 left-6 w-4 h-4 bg-gray-2 rotate-45"></div>
                            <p className="text-dark-4 italic text-[16px]">"{rev.comment}"</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-10 border-t border-gray-3">
                    <h4 className="font-black text-xl sm:text-2xl text-dark mb-8 uppercase tracking-tight">Bagikan Pengalaman Anda</h4>
                    <form onSubmit={handleReviewSubmit} className="space-y-6 sm:space-y-8 max-w-4xl">
                      <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-dark-4">Rating Kepuasan</label>
                        <div className="flex gap-3">{[1, 2, 3, 4, 5].map(n => <button key={n} type="button" onClick={() => setRating(n)} className={`text-4xl transition-all ${rating >= n ? "text-orange" : "text-gray-3"}`}>★</button>)}</div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="p-4 border-2 border-gray-3 rounded-xl outline-none focus:border-blue bg-gray-1" placeholder="Nama..." />
                        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="p-4 border-2 border-gray-3 rounded-xl outline-none focus:border-blue bg-gray-1" placeholder="Email..." />
                      </div>
                      <textarea required rows={5} value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-4 border-2 border-gray-3 rounded-xl outline-none focus:border-blue bg-gray-1" placeholder="Ulasan..."></textarea>
                      <button type="submit" className="w-full sm:w-auto bg-blue text-white py-4 px-10 sm:py-5 sm:px-15 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-dark transition-all hover:scale-[1.02]">Kirim Ulasan</button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <RecentlyViewdItems />
    </>
  );
};

export default ShopDetails;
