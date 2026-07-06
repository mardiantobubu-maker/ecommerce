"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import CustomSelect from "./CustomSelect";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice, selectTotalQuantity } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import Image from "next/image";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const NotificationDropdown = dynamic(() => import("./NotificationDropdown"), { ssr: false });
const LocationPermissionModal = dynamic(() => import("./LocationPermissionModal"), { ssr: false });
import { supabase } from "@/lib/supabase";

import { CATEGORIES } from "@/utils/constants";
const CATEGORY_ORDER = CATEGORIES;

const Header = ({ initialCategories = [] }: { initialCategories?: any[] }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("0");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { openCartModal } = useCartModalContext();
  const { session, signOut } = useAuth();
  const [userLocation, setUserLocation] = useState<string>("Indonesia");
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Fungsi untuk mendapatkan koordinat → nama kota
  const fetchCityFromCoords = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(`/api/geocode?lat=${latitude}&lon=${longitude}`);
      if (!response.ok) throw new Error("Geocode error");
      const data = await response.json();
      const city =
        data?.address?.city ||
        data?.address?.town ||
        data?.address?.village ||
        data?.address?.state ||
        "Indonesia";
      setUserLocation(city);
    } catch {
      setUserLocation("Indonesia");
    }
  };

  // Fungsi dipanggil setelah user klik "Izinkan" di modal kita
  const handleAllowLocation = () => {
    setShowLocationModal(false);
    localStorage.setItem("locationPermission", "granted");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchCityFromCoords(position.coords.latitude, position.coords.longitude);
        },
        () => setUserLocation("Indonesia")
      );
    }
  };

  const handleDenyLocation = () => {
    setShowLocationModal(false);
    localStorage.setItem("locationPermission", "denied");
    setUserLocation("Indonesia");
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) return;

    const saved = localStorage.getItem("locationPermission");

    if (saved === "granted") {
      // Sudah pernah izinkan → langsung ambil lokasi
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchCityFromCoords(position.coords.latitude, position.coords.longitude);
        },
        () => setUserLocation("Indonesia")
      );
    } else if (!saved) {
      // Belum pernah memilih → tampilkan modal kita
      setTimeout(() => setShowLocationModal(true), 10000);
    }
    // Jika saved === "denied" → biarkan default "Indonesia"
  }, []);




  const product = useAppSelector((state) => state.cartReducer.items);
  const wishlist = useAppSelector((state) => state.wishlistReducer.items);
  const totalPrice = useAppSelector(selectTotalPrice);
  const totalQuantity = useAppSelector(selectTotalQuantity);

  const handleOpenCartModal = () => {
    openCartModal();
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    window.addEventListener("scroll", handleStickyMenu);
    return () => window.removeEventListener("scroll", handleStickyMenu);
  }, []);

  useEffect(() => {
    if (navigationOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [navigationOpen]);

  const [categoriesFromDB, setCategoriesFromDB] = useState<any[]>(initialCategories);
  
  useEffect(() => {
    if (initialCategories.length > 0) return;
    
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (data) {
        setCategoriesFromDB(data);
      }
    };
    fetchCategories();
  }, [initialCategories]);

  const options = [
    { label: "Semua Kategori", value: "0" },
    ...(categoriesFromDB.length > 0
      ? [...categoriesFromDB]
        .filter(cat => !cat.name.startsWith("Rok") && !cat.name.startsWith("Celana"))
        .sort((a, b) => {
          const indexA = CATEGORY_ORDER.indexOf(a.name);
          const indexB = CATEGORY_ORDER.indexOf(b.name);
          if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        })
        .map((cat, index) => ({
          label: cat.name,
          value: (index + 1).toString()
        }))
      : CATEGORIES.map((cat, index) => ({
          label: cat,
          value: (index + 1).toString()
        }))
    )
  ];


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryOption = options.find(opt => opt.value === selectedCategory);
    const categoryLabel = categoryOption && selectedCategory !== "0" ? categoryOption.label : "";

    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      // Ganti spasi dengan tanda hubung (-) untuk URL yang lebih bersih
      const formattedSearch = searchQuery.trim().replace(/\s+/g, '-');
      params.append("search", formattedSearch);
    }
    if (categoryLabel) {
      const formattedCategory = categoryLabel.replace(/\s+/g, '-');
      params.append("search", formattedCategory);
    }

    router.push(`/shop-with-sidebar?${params.toString()}`);
  };

  const mobileActions = (
    <>
      <button
        onClick={handleOpenCartModal}
        aria-label="Buka keranjang belanja"
        className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-2 transition-all hover:bg-blue/10 group"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-dark-4 group-hover:text-blue transition-colors">
          <path d="M15.5433 9.5172C15.829 9.21725 15.8174 8.74252 15.5174 8.45686C15.2175 8.17119 14.7428 8.18277 14.4571 8.48272L12.1431 10.9125L11.5433 10.2827C11.2576 9.98277 10.7829 9.97119 10.483 10.2569C10.183 10.5425 10.1714 11.0173 10.4571 11.3172L11.6 12.5172C11.7415 12.6658 11.9378 12.75 12.1431 12.75C12.3483 12.75 12.5446 12.6658 12.6862 12.5172L15.5433 9.5172Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M1.29266 2.7512C1.43005 2.36044 1.8582 2.15503 2.24896 2.29242L2.55036 2.39838C3.16689 2.61511 3.69052 2.79919 4.10261 3.00139C4.54324 3.21759 4.92109 3.48393 5.20527 3.89979C5.48725 4.31243 5.60367 4.76515 5.6574 5.26153C5.66124 5.29706 5.6648 5.33321 5.66809 5.36996L17.1203 5.36996C17.9389 5.36995 18.7735 5.36993 19.4606 5.44674C19.8103 5.48584 20.1569 5.54814 20.4634 5.65583C20.7639 5.76141 21.0942 5.93432 21.3292 6.23974C21.711 6.73613 21.7777 7.31414 21.7416 7.90034C21.7071 8.45845 21.5686 9.15234 21.4039 9.97723L21.3935 10.0295L21.3925 10.0341L20.8836 12.5033C20.7339 13.2298 20.6079 13.841 20.4455 14.3231C20.2731 14.8346 20.0341 15.2842 19.6076 15.6318C19.1811 15.9793 18.6925 16.1226 18.1568 16.1882C17.6518 16.25 17.0278 16.25 16.2862 16.25L10.8804 16.25C9.53464 16.25 8.44479 16.25 7.58656 16.1283C6.69032 16.0012 5.93752 15.7285 5.34366 15.1022C4.79742 14.526 4.50529 13.9144 4.35897 13.0601C4.22191 12.2598 4.20828 11.2125 4.20828 9.75996V7.03832C4.20828 6.29837 4.20726 5.80316 4.16611 5.42295C4.12678 5.0596 4.05708 4.87818 3.96682 4.74609C3.87876 4.61723 3.74509 4.4968 3.44186 4.34802C3.11902 4.18961 2.68026 4.03406 2.01266 3.79934L1.75145 3.7075C1.36068 3.57012 1.15527 3.14197 1.29266 2.7512ZM5.70828 6.86996L5.70828 9.75996C5.70828 11.249 5.72628 12.1578 5.83744 12.8068C5.93933 13.4018 6.11202 13.7324 6.43219 14.0701C6.70473 14.3576 7.08235 14.5418 7.79716 14.6432C8.53783 14.7482 9.5209 14.75 10.9377 14.75H16.2406C17.0399 14.75 17.5714 14.7487 17.9746 14.6993C18.3573 14.6525 18.5348 14.571 18.66 14.469C18.7853 14.3669 18.9009 14.2095 19.024 13.8441C19.1537 13.4592 19.2623 12.9389 19.4237 12.156L19.9225 9.73591L19.9229 9.73369C20.1005 8.84376 20.217 8.2515 20.2444 7.80793C20.2704 7.38648 20.2043 7.23927 20.1429 7.15786C20.1367 7.15259 20.0931 7.11565 19.9661 7.07101C19.8107 7.01639 19.5895 6.97049 19.2939 6.93745C18.6991 6.87096 17.9454 6.86996 17.089 6.86996H5.70828Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74285 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74285 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0857 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0857 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z" fill="currentColor" />
          <path fillRule="evenodd" clipRule="evenodd" d="M14.25 19.5001C14.25 20.7427 15.2574 21.7501 16.5 21.7501C17.7426 21.7501 18.75 20.7427 18.75 19.5001C18.75 18.2574 17.7426 17.2501 16.5 21.7501C15.2574 17.2501 14.25 18.2574 14.25 19.5001ZM16.5 20.2501C16.0858 20.2501 15.75 19.9143 15.75 19.5001C15.75 19.0859 16.0858 18.7501 16.5 20.2501C16.9142 18.7501 17.25 19.0859 17.25 19.5001C17.25 19.9143 16.9142 20.2501 16.5 20.2501Z" fill="currentColor" />
        </svg>
        <span suppressHydrationWarning className="flex items-center justify-center font-bold text-xs absolute -right-1.5 -top-1.5 bg-blue w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-full text-white ring-2 ring-white shadow-sm">
          {mounted ? totalQuantity : 0}
        </span>
      </button>
      <NotificationDropdown />
      <button
        aria-label="Menu Navigasi Mobile"
        className="block"
        onClick={() => setNavigationOpen(!navigationOpen)}
      >
        <span className="block relative cursor-pointer w-5 h-4 sm:w-5.5 sm:h-5">
          <span className="du-block absolute right-0 w-full h-full">
            <span className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${!navigationOpen && "!w-full delay-300"}`}></span>
            <span className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${!navigationOpen && "!w-full delay-400"}`}></span>
            <span className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${!navigationOpen && "!w-full delay-500"}`}></span>
          </span>
          <span className="block absolute right-0 w-full h-full rotate-45">
            <span className={`block bg-dark rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${!navigationOpen && "!h-0 delay-[0] "}`}></span>
            <span className={`block bg-dark rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${!navigationOpen && "!h-0 dealy-200"}`}></span>
          </span>
        </span>
      </button>
    </>
  );

  return (
    <>
    <header
      className={`fixed left-0 top-0 w-full z-[9999] bg-white transition-all ease-in-out duration-300 ${stickyMenu ? "shadow" : ""
        }`}
    >


      <div className="w-full border-b border-gray-3" style={{ overflowX: 'clip' }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7.5 xl:px-6 2xl:px-0 relative z-[60]">
          {/* <!-- header top start --> */}
          <div
            className={`flex flex-col lg:flex-row gap-5 items-center xl:justify-between ease-out duration-150 ${stickyMenu ? "py-3" : "py-3 lg:py-5"
              }`}
          >
            {/* <!-- header top left --> */}
            <div className="xl:w-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full lg:flex-1 xl:flex-none">
              <div className="flex items-center justify-between w-full sm:w-auto sm:flex-shrink-0 lg:w-auto">
                <Link className="flex-shrink-0 block outline-none focus:outline-none" href="/">
                    <Image
                      src="/images/logo/logo.svg"
                      alt="Logo"
                      width={220}
                      height={60}
                      priority
                      sizes="(max-width: 768px) 160px, 220px"
                      style={{ width: "auto", height: "auto" }}
                      className="h-10 w-auto"
                    />
                </Link>

                {/* Mobile Actions (Cart, Notifications & Hamburger) - Mobile Only */}
                <div className="flex items-center gap-3 xsm:gap-4 sm:hidden pr-1 xsm:pr-2">
                  {mobileActions}
                </div>
              </div>

              <div className="flex-1 w-full lg:max-w-none xl:max-w-[480px] relative z-[70]">
                <form onSubmit={handleSearch}>
                  <div className="search-wrapper flex items-center w-full bg-white border border-gray-3/60 rounded-[8px] shadow-sm relative">
                    <div className="flex-none w-[170px] sm:w-[180px] lg:w-[190px] xl:w-[230px]">
                      <CustomSelect
                        options={options}
                        value={selectedCategory}
                        onChange={(val) => {
                          setSelectedCategory(val);
                          const categoryOption = options.find(opt => opt.value === val);
                          if (categoryOption) {
                            if (val === "0") {
                              router.push(`/shop-with-sidebar`);
                            } else {
                              const formattedLabel = categoryOption.label.replace(/\s+/g, '-');
                              router.push(`/shop-with-sidebar?search=${formattedLabel}`);
                            }
                          }
                        }}
                      />
                    </div>

                    {/* <!-- divider --> */}
                    <span className="inline-block w-px h-5.5 bg-gray-4"></span>

                    <div className="relative flex-1 min-w-0">
                      <input
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                        type="search"
                        name="search"
                        id="search"
                        placeholder="Seragam..."
                        autoComplete="off"
                        className="w-full bg-transparent border-none py-2.5 pl-3 sm:pl-4 pr-10 outline-none ease-in duration-200 text-base placeholder:text-base text-dark"
                      />

                      <button
                        id="search-btn"
                        type="submit"
                        aria-label="Search"
                        className="flex items-center justify-center absolute right-3 top-1/2 -translate-y-1/2 ease-in duration-200 text-dark-4 hover:text-blue"
                      >
                        <svg
                          className="fill-current"
                          width="18"
                          height="18"
                          viewBox="0 0 18 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M17.2687 15.6656L12.6281 11.8969C14.5406 9.28123 14.3437 5.5406 11.9531 3.1781C10.6875 1.91248 8.99995 1.20935 7.19995 1.20935C5.39995 1.20935 3.71245 1.91248 2.44683 3.1781C-0.168799 5.79373 -0.168799 10.0687 2.44683 12.6844C3.71245 13.95 5.39995 14.6531 7.19995 14.6531C8.91558 14.6531 10.5187 14.0062 11.7843 12.8531L16.4812 16.65C16.5937 16.7344 16.7343 16.7906 16.875 16.7906C17.0718 16.7906 17.2406 16.7062 17.3531 16.5656C17.5781 16.2844 17.55 15.8906 17.2687 15.6656ZM7.19995 13.3875C5.73745 13.3875 4.38745 12.825 3.34683 11.7844C1.20933 9.64685 1.20933 6.18748 3.34683 4.0781C4.38745 3.03748 5.73745 2.47498 7.19995 2.47498C8.66245 2.47498 10.0125 3.03748 11.0531 4.0781C13.1906 6.2156 13.1906 9.67498 11.0531 11.7844C10.0406 12.825 8.66245 13.3875 7.19995 13.3875Z"
                            fill=""
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Mobile Actions (Cart, Notifications & Hamburger) - iPad Only */}
              <div className="hidden sm:flex xl:hidden items-center gap-4 lg:gap-5 pr-2 pl-1">
                {mobileActions}
              </div>
            </div>

            {/* <!-- header top right (Hidden on Mobile and iPad Pro) --> */}
            <div className="hidden xl:flex w-full xl:w-auto items-center gap-3">


              <div className="flex w-full lg:w-auto justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="hidden xl:flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-blue/20 bg-blue/5 flex items-center justify-center transition-all hover:border-blue/50">
                      {session ? (
                        session.user.user_metadata?.custom_avatar_url || session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture ? (
                          <Image
                            src={session.user.user_metadata.custom_avatar_url || session.user.user_metadata.avatar_url || session.user.user_metadata.picture}
                            alt="Profile"
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                        )
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3C50E0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                      )}
                    </div>

                    <div>
                      <span className="block text-2xs text-dark-4 uppercase">
                        Akun
                      </span>
                      <div className="font-medium text-custom-sm text-dark whitespace-nowrap">
                        {session ? (
                          <Link href="/my-account" className="hover:text-blue transition-colors">
                            {session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || "Profil Saya"}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-1">
                            <Link href="/signin" className="hover:text-blue transition-colors">Masuk</Link>
                            <span>/</span>
                            <Link href="/signup" className="hover:text-blue transition-colors">Daftar</Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <!-- Divider --> */}
                  <span className="hidden xl:block w-px h-7.5 bg-gray-4 mx-1"></span>

                  {/* <!-- Favorites --> */}
                  <Link
                    href="/wishlist"
                    className="relative hidden lg:flex items-center gap-2.5 group"
                  >
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-2 transition-all hover:bg-blue/10">
                      <svg
                        className="text-dark-4 group-hover:text-blue transition-colors"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                      <span suppressHydrationWarning className="flex items-center justify-center font-bold text-xs absolute -right-0.5 -top-0.5 bg-blue w-5 h-5 rounded-full text-white ring-2 ring-white shadow-sm">
                        {mounted ? wishlist.length : 0}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="block text-2xs text-dark-4 uppercase">
                        Favorit
                      </span>
                      <p className="font-medium text-custom-sm text-dark transition-colors group-hover:text-blue">
                        Favorit
                      </p>
                    </div>
                  </Link>

                  {/* <!-- Divider behind Favorites --> */}
                  <span className="hidden xl:block w-px h-7.5 bg-gray-4 mx-1"></span>

                  {/* <!-- Notifications --> */}
                  <NotificationDropdown />

                  {/* <!-- Divider behind Notifications --> */}
                  <span className="hidden xl:block w-px h-7.5 bg-gray-4 mx-1"></span>

                  <button
                    onClick={handleOpenCartModal}
                    className="flex items-center gap-2.5 group"
                  >
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-2 transition-all hover:bg-blue/10">
                      <svg
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-dark-4 group-hover:text-blue transition-colors"
                      >
                        <path
                          d="M15.5433 9.5172C15.829 9.21725 15.8174 8.74252 15.5174 8.45686C15.2175 8.17119 14.7428 8.18277 14.4571 8.48272L12.1431 10.9125L11.5433 10.2827C11.2576 9.98277 10.7829 9.97119 10.483 10.2569C10.183 10.5425 10.1714 11.0173 10.4571 11.3172L11.6 12.5172C11.7415 12.6658 11.9378 12.75 12.1431 12.75C12.3483 12.75 12.5446 12.6658 12.6862 12.5172L15.5433 9.5172Z"
                          fill="currentColor"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M1.29266 2.7512C1.43005 2.36044 1.8582 2.15503 2.24896 2.29242L2.55036 2.39838C3.16689 2.61511 3.69052 2.79919 4.10261 3.00139C4.54324 3.21759 4.92109 3.48393 5.20527 3.89979C5.48725 4.31243 5.60367 4.76515 5.6574 5.26153C5.66124 5.29706 5.6648 5.33321 5.66809 5.36996L17.1203 5.36996C17.9389 5.36995 18.7735 5.36993 19.4606 5.44674C19.8103 5.48584 20.1569 5.54814 20.4634 5.65583C20.7639 5.76141 21.0942 5.93432 21.3292 6.23974C21.711 6.73613 21.7777 7.31414 21.7416 7.90034C21.7071 8.45845 21.5686 9.15234 21.4039 9.97723L21.3935 10.0295L21.3925 10.0341L20.8836 12.5033C20.7339 13.2298 20.6079 13.841 20.4455 14.3231C20.2731 14.8346 20.0341 15.2842 19.6076 15.6318C19.1811 15.9793 18.6925 16.1226 18.1568 16.1882C17.6518 16.25 17.0278 16.25 16.2862 16.25L10.8804 16.25C9.53464 16.25 8.44479 16.25 7.58656 16.1283C6.69032 16.0012 5.93752 15.7285 5.34366 15.1022C4.79742 14.526 4.50529 13.9144 4.35897 13.0601C4.22191 12.2598 4.20828 11.2125 4.20828 9.75996V7.03832C4.20828 6.29837 4.20726 5.80316 4.16611 5.42295C4.12678 5.0596 4.05708 4.87818 3.96682 4.74609C3.87876 4.61723 3.74509 4.4968 3.44186 4.34802C3.11902 4.18961 2.68026 4.03406 2.01266 3.79934L1.75145 3.7075C1.36068 3.57012 1.15527 3.14197 1.29266 2.7512ZM5.70828 6.86996L5.70828 9.75996C5.70828 11.249 5.72628 12.1578 5.83744 12.8068C5.93933 13.4018 6.11202 13.7324 6.43219 14.0701C6.70473 14.3576 7.08235 14.5418 7.79716 14.6432C8.53783 14.7482 9.5209 14.75 10.9377 14.75H16.2406C17.0399 14.75 17.5714 14.7487 17.9746 14.6993C18.3573 14.6525 18.5348 14.571 18.66 14.469C18.7853 14.3669 18.9009 14.2095 19.024 13.8441C19.1537 13.4592 19.2623 12.9389 19.4237 12.156L19.9225 9.73591L19.9229 9.73369C20.1005 8.84376 20.217 8.2515 20.2444 7.80793C20.2704 7.38648 20.2043 7.23927 20.1429 7.15786C20.1367 7.15259 20.0931 7.11565 19.9661 7.07101C19.8107 7.01639 19.5895 6.97049 19.2939 6.93745C18.6991 6.87096 17.9454 6.86996 17.089 6.86996H5.70828Z"
                          fill="currentColor"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M5.2502 19.5C5.2502 20.7426 6.25756 21.75 7.5002 21.75C8.74285 21.75 9.7502 20.7426 9.7502 19.5C9.7502 18.2573 8.74285 17.25 7.5002 17.25C6.25756 17.25 5.2502 18.2573 5.2502 19.5ZM7.5002 20.25C7.08599 20.25 6.7502 19.9142 6.7502 19.5C6.7502 19.0857 7.08599 18.75 7.5002 18.75C7.91442 18.75 8.2502 19.0857 8.2502 19.5C8.2502 19.9142 7.91442 20.25 7.5002 20.25Z"
                          fill="currentColor"
                        />
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M14.25 19.5001C14.25 20.7427 15.2574 21.7501 16.5 21.7501C17.7426 21.7501 18.75 20.7427 18.75 19.5001C18.75 18.2574 17.7426 17.2501 16.5 21.7501C15.2574 17.2501 14.25 18.2574 14.25 19.5001ZM16.5 20.2501C16.0858 20.2501 15.75 19.9143 15.75 19.5001C15.75 19.0859 16.0858 18.7501 16.5 20.2501C16.9142 18.7501 17.25 19.0859 17.25 19.5001C17.25 19.9143 16.9142 20.2501 16.5 20.2501Z"
                          fill="currentColor"
                        />
                      </svg>
                      <span suppressHydrationWarning className="flex items-center justify-center font-bold text-xs absolute -right-0.5 -top-0.5 bg-blue w-5 h-5 rounded-full text-white ring-2 ring-white shadow-sm">
                        {mounted ? totalQuantity : 0}
                      </span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="block text-2xs text-dark-4 uppercase">
                        Keranjang
                      </span>
                      <p suppressHydrationWarning className="font-medium text-custom-sm text-dark transition-colors group-hover:text-blue">
                        Rp. {mounted ? totalPrice.toLocaleString('id-ID') : 0}
                      </p>
                    </div>
                  </button>
                </div>



                {/* <!-- Hamburger Toggle BTN --> */}
                <button
                  id="Toggle"
                  aria-label="Menu Navigasi Mobile"
                  className="xl:hidden block"
                  onClick={() => setNavigationOpen(!navigationOpen)}
                >
                  <span className="block relative cursor-pointer w-5.5 h-5.5">
                    <span className="du-block absolute right-0 w-full h-full">
                      <span
                        className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${!navigationOpen && "!w-full delay-300"
                          }`}
                      ></span>
                      <span
                        className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${!navigationOpen && "!w-full delay-400"
                          }`}
                      ></span>
                      <span
                        className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${!navigationOpen && "!w-full delay-500"
                          }`}
                      ></span>
                    </span>

                    <span className="block absolute right-0 w-full h-full rotate-45">
                      <span
                        className={`block bg-dark rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${!navigationOpen && "!h-0 delay-[0] "
                          }`}
                      ></span>
                      <span
                        className={`block bg-dark rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${!navigationOpen && "!h-0 dealy-200"
                          }`}
                      ></span>
                    </span>
                  </span>
                </button>
                {/* //   <!-- Hamburger Toggle BTN --> */}
              </div>
            </div>
          </div>
          {/* <!-- header top end --> */}
        </div>
      </div>

      <div className={`xl:border-b ${stickyMenu ? "border-gray-3/20" : "border-gray-3"} relative z-[50]`}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-7.5 xl:px-6 2xl:px-0">
          <div className="flex items-center justify-between">
            {/* <!--=== Main Nav Start ===--> */}
            {/* Main Nav for Desktop */}
            <nav className="hidden xl:block">
              <ul className="flex items-center gap-6">
                {menuData.map((menuItem, i) =>
                  menuItem.submenu ? (
                    <Dropdown
                      key={i}
                      menuItem={menuItem}
                      stickyMenu={stickyMenu}
                    />
                  ) : (
                    <li
                      key={i}
                      className={`group relative before:hidden xl:before:block before:w-0 before:h-[3px] before:bg-blue before:absolute before:left-0 before:top-0 before:rounded-b-[3px] before:ease-out before:duration-200 hover:before:w-full ${menuItem.mobileOnly ? "xl:hidden" : ""}`}
                    >
                      <Link
                        href={menuItem.path}
                        prefetch={menuItem.prefetch}
                        className={`hover:text-blue text-custom-sm font-medium text-dark flex items-center gap-3 py-6 outline-none focus:outline-none ${stickyMenu ? "xl:py-4" : "xl:py-6"
                          }`}
                      >
                        {menuItem.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* // <!--=== Main Nav End ===--> */}

            {/* // <!--=== Nav Right Start ===--> */}
            <div className="hidden xl:block">
              <ul className="flex items-center gap-5.5 py-4">
                <li className="flex items-center gap-2 px-4 py-2 bg-blue/[0.05] rounded-full border border-blue/10 transition-all hover:bg-blue/[0.08]">
                  <div className="flex items-center gap-2 text-xs font-medium text-dark-4">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-blue"
                    >
                      <path
                        d="M7 0.875C4.34375 0.875 2.1875 3.03125 2.1875 5.6875C2.1875 9.05625 6.475 12.8625 6.65 13.0375C6.7375 13.125 6.86875 13.125 6.95625 13.125C7.04375 13.125 7.175 13.125 7.2625 13.0375C7.4375 12.8625 11.725 9.05625 11.725 5.6875C11.8125 3.03125 9.65625 0.875 7 0.875ZM7 7.875C5.775 7.875 4.8125 6.9125 4.8125 5.6875C4.8125 4.4625 5.775 3.5 7 3.5C8.225 3.5 9.1875 4.4625 9.1875 5.6875C9.1875 6.9125 8.225 7.875 7 7.875Z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Lokasi: <span className="text-blue font-semibold">{userLocation}</span></span>
                  </div>
                </li>
              </ul>
            </div>
            {/* <!--=== Nav Right End ===--> */}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay & Sidebar (Moved for better layering and animation) */}
      <div
        className={`fixed inset-0 bg-dark/50 z-[100000] transition-opacity duration-200 xl:hidden ${navigationOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
          }`}
        onClick={() => setNavigationOpen(false)}
      />
      <div
        className={`fixed top-0 right-0 h-screen w-[300px] sm:w-[320px] bg-white shadow-2xl z-[100001] flex flex-col transform transition-transform duration-200 cubic-bezier(0.4, 0, 0.2, 1) xl:hidden ${navigationOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between pt-10 pb-4 px-5 border-b border-gray-3">
          <Link href="/" className="flex-shrink-0" onClick={() => setNavigationOpen(false)}>
            <Image 
              src="/images/logo/logo.svg" 
              alt="Logo" 
              width={160} 
              height={44} 
              style={{ width: "auto", height: "auto" }} 
              priority 
              sizes="160px"
            />
          </Link>
          <button
            onClick={() => setNavigationOpen(false)}
            aria-label="Tutup menu"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-1 text-dark-4 hover:text-dark transition-all duration-200"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-5">
          <ul className="flex flex-col gap-2 pb-20">
            {menuData.map((menuItem, i) =>
              menuItem.submenu ? (
                <Dropdown
                  key={i}
                  menuItem={menuItem}
                  stickyMenu={stickyMenu}
                  setNavigationOpen={setNavigationOpen}
                />
              ) : (
                <li key={i} className={menuItem.mobileOnly ? "xl:hidden" : ""}>
                    <Link
                      href={menuItem.path}
                      prefetch={menuItem.prefetch}
                      onClick={() => setNavigationOpen(false)}
                      className="text-dark font-medium text-custom-sm hover:text-blue transition-colors duration-200 flex items-center gap-3 py-2"
                    >
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue/5 text-blue group-hover:bg-blue group-hover:text-white transition-all duration-300 flex-shrink-0">
                      {menuItem.title === "Populer" && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      )}
                      {menuItem.title === "Toko" && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                      )}
                      {menuItem.title === "Blog" && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><path d="M22 6l-10 7L2 6" /></svg>
                      )}
                      {menuItem.title === "Kontak" && (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                      )}
                    </span>
                    {menuItem.title}
                  </Link>
                </li>
              )
            )}
            <li className="mt-4 border-t border-gray-3 pt-6 space-y-4">
              <div className="bg-blue/5 rounded-xl p-4 border border-blue/10">
                <div className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue">
                    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium text-dark-3">
                    Lokasi Saya: <span className="text-blue">{userLocation}</span>
                  </span>
                </div>
              </div>

              <Link
                href="/signin"
                onClick={() => setNavigationOpen(false)}
                className="flex items-center gap-3 p-2 text-dark text-custom-sm font-semibold hover:text-blue transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-blue/5 flex items-center justify-center text-blue">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                </div>
                <span>Masuk / Daftar</span>
              </Link>
            </li>
          </ul>
        </nav>


      </div>
    </header>

    <LocationPermissionModal
      isOpen={showLocationModal}
      onAllow={handleAllowLocation}
      onDeny={handleDenyLocation}
    />
    </>
  );
};

export default Header;
