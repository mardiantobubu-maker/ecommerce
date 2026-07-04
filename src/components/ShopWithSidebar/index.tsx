"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import CustomSelect from "./CustomSelect";
import CategoryDropdown from "./CategoryDropdown";
import GenderDropdown from "./GenderDropdown";
import SizeDropdown from "./SizeDropdown";
import ColorsDropdwon from "./ColorsDropdwon";
import PriceDropdown from "./PriceDropdown";
import shopData from "../Shop/shopData";
import SingleGridItem from "../Shop/SingleGridItem";
import SingleListItem from "../Shop/SingleListItem";
import ProductSkeleton from "../Common/ProductSkeleton";
import { supabase } from "@/lib/supabase";

import { useSearchParams } from "next/navigation";

import { CATEGORIES } from "@/utils/constants";
const CATEGORY_ORDER = CATEGORIES;

const ShopWithSidebar = ({ initialProducts }: { initialProducts?: any[] }) => {
  const searchParams = useSearchParams();
  const query = searchParams.get("search");

  const [products, setProducts] = useState<any[]>(initialProducts || []);
  const [categoriesFromDB, setCategoriesFromDB] = useState<any[]>([]);

  const [loading, setLoading] = useState(!initialProducts);
  const [productStyle, setProductStyle] = useState("grid");
  const [productSidebar, setProductSidebar] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("popular");

  const ITEMS_PER_PAGE = 9;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ from: 0, to: 20000000 });

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      const mapped = data.map((item: any) => {
        const allPrices = [
          item.discounted_price,
          item.price,
          item.discounted_price_panjang,
          item.price_panjang
        ].filter(p => p && p > 0);

        const displayPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
        const normalPrice = item.price || item.price_panjang || displayPrice;

        return {
          ...item,
          imgs: {
            thumbnails: item.thumbnails || [item.image_url],
            previews: item.previews || [item.image_url]
          },
          discountedPrice: displayPrice,
          price: normalPrice,
          // Parse string fields into arrays for robust filtering
          colors: typeof item.colors === 'string' ? item.colors.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.colors) ? item.colors : []),
          sizes: typeof item.sizes === 'string' ? item.sizes.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.sizes) ? item.sizes : []),
          sleeves: typeof item.sleeves === 'string' ? item.sleeves.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.sleeves) ? item.sleeves : []),
        };
      });
      setProducts(mapped);
    }
    setLoading(false);
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (data) {
      setCategoriesFromDB(data);
    }
  };


  useEffect(() => {
    let isMounted = true;
    const fetchCategoriesSafe = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });
      if (isMounted && data) setCategoriesFromDB(data);
    };

    const fetchProductsSafe = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (isMounted) {
        if (data) {
          const mapped = data.map((item: any) => {
            const allPrices = [
              item.discounted_price,
              item.price,
              item.discounted_price_panjang,
              item.price_panjang
            ].filter(p => p && p > 0);

            const displayPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
            const normalPrice = item.price || item.price_panjang || displayPrice;

            return {
              ...item,
              imgs: {
                thumbnails: item.thumbnails || [item.image_url],
                previews: item.previews || [item.image_url]
              },
              discountedPrice: displayPrice,
              price: normalPrice,
              colors: typeof item.colors === 'string' ? item.colors.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.colors) ? item.colors : []),
              sizes: typeof item.sizes === 'string' ? item.sizes.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.sizes) ? item.sizes : []),
              sleeves: typeof item.sleeves === 'string' ? item.sleeves.split(/[;,]/).map((s: string) => s.trim()).filter(Boolean) : (Array.isArray(item.sleeves) ? item.sleeves : []),
            };
          });
          setProducts(mapped);
        }
        setLoading(false);
      }
    };

    fetchCategoriesSafe();
    // Always fetch full product list to ensure Category Counts and Filters are accurate
    fetchProductsSafe();
    return () => { isMounted = false; };
  }, []);

  const checkMatchesSearch = (item: any, q: string) => {
    if (!q) return true;
    const lowQ = q.toLowerCase().trim();
    const itemTitle = (item.title || "").toLowerCase();
    const getCatName = (c: any) => (typeof c === 'object' ? c?.name : c) || "";
    const itemCat = getCatName(item.category).toLowerCase().trim();

    const isAksesori = itemCat.includes("aksesori") || itemTitle.includes("aksesori");
    const isSD = itemCat.includes("sd") || itemTitle.includes("sd");
    const isSMP = itemCat.includes("smp") || itemTitle.includes("smp");
    const isSMA = itemCat.includes("sma") || itemTitle.includes("sma");

    if (lowQ === "seragam sd") return isSD && !isAksesori;
    if (lowQ === "seragam smp") return isSMP && !isAksesori;
    if (lowQ === "seragam sma") return isSMA && !isAksesori;

    return itemTitle.includes(lowQ) || itemCat.includes(lowQ);
  };

  const filteredProducts = products.filter(item => {
    // Normalisasi query (ganti - kembali ke spasi) untuk pencarian yang akurat
    const normalizedQuery = query ? query.replace(/-/g, ' ') : "";

    const matchesSearch = checkMatchesSearch(item, normalizedQuery);

    const matchesCategory = selectedCategories.length === 0 ||
      selectedCategories.some(selectedCat => {
        const getCatName = (c: any) => (typeof c === 'object' ? c?.name : c) || "";
        const itemCat = getCatName(item.category).toLowerCase().trim();
        const itemTitle = (item.title || "").toLowerCase();
        const targetCat = selectedCat.trim().toLowerCase();
        const isAksesori = itemCat.includes("aksesori") || itemTitle.includes("aksesori");

        if (targetCat === "seragam sd") return (itemCat.includes("sd") || itemTitle.includes("sd")) && !isAksesori;
        if (targetCat === "seragam smp") return (itemCat.includes("smp") || itemTitle.includes("smp")) && !isAksesori;
        if (targetCat === "seragam sma") return (itemCat.includes("sma") || itemTitle.includes("sma")) && !isAksesori;
        if (targetCat === "aksesoris" || targetCat === "aksesori") return isAksesori;

        return itemCat === targetCat;
      });

    const matchesGender = selectedGenders.length === 0 ||
      selectedGenders.some(gen => (item.gender || "").trim().toLowerCase() === gen.trim().toLowerCase());

    const matchesSize = selectedSizes.length === 0 ||
      (item.sizes && item.sizes.some(size => selectedSizes.includes(size)));

    const matchesColor = selectedColors.length === 0 ||
      (item.colors && item.colors.some(color => selectedColors.includes(color)));

    // Gunakan harga kodi (unit price * 20) untuk sinkronisasi dengan UI
    const pricePerKodi = (item.discountedPrice || item.price) * 20;
    const matchesPrice = pricePerKodi >= priceRange.from && pricePerKodi <= priceRange.to;

    return matchesSearch && matchesCategory && matchesGender && matchesSize && matchesColor && matchesPrice;
  });

  // Sort filtered products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    // "popular" = newest first (default)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, selectedGenders, selectedSizes, selectedColors, priceRange, query, sortBy]);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedGenders([]);
    setSelectedSizes([]);
    setSelectedColors([]);
    setPriceRange({ from: 0, to: 20000000 });
  };

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    if (productSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [productSidebar]);

  const options = [
    { label: "Paling Laris", value: "popular" },
    { label: "Produk Lama", value: "oldest" },
  ];

  const getCategoryCount = (categoryName: string) => {
    const normalizedQuery = query ? query.replace(/-/g, ' ') : "";
    return products.filter(item => {
      const matchesSearch = checkMatchesSearch(item, normalizedQuery);
      const matchesGender = selectedGenders.length === 0 ||
        selectedGenders.some(gen => (item.gender || "").trim().toLowerCase() === gen.trim().toLowerCase());
      const pricePerKodi = (item.discountedPrice || item.price) * 20;
      const matchesPrice = pricePerKodi >= priceRange.from && pricePerKodi <= priceRange.to;

      const getCatName = (c: any) => (typeof c === 'object' ? c?.name : c) || "";
      const itemCat = getCatName(item.category).toLowerCase().trim();
      const targetCat = categoryName.trim().toLowerCase();
      const itemTitle = (item.title || "").toLowerCase();

      let matchesThisCategory = false;
      if (targetCat === "seragam sd") {
        matchesThisCategory = itemCat.includes("sd") || itemTitle.includes("sd");
      } else if (targetCat === "seragam smp") {
        matchesThisCategory = itemCat.includes("smp") || itemTitle.includes("smp");
      } else if (targetCat === "seragam sma") {
        matchesThisCategory = itemCat.includes("sma") || itemTitle.includes("sma");
      } else if (targetCat === "aksesori" || targetCat === "aksesoris") {
        matchesThisCategory = itemCat.includes("aksesori") || itemTitle.includes("aksesori");
      } else {
        matchesThisCategory = itemCat === targetCat || itemCat.includes(targetCat);
      }

      return matchesThisCategory && matchesSearch && matchesGender && matchesPrice;
    }).length;
  };

  const getGenderCount = (genderName: string) => {
    const normalizedQuery = query ? query.replace(/-/g, ' ') : "";
    return products.filter(item => {
      const matchesSearch = checkMatchesSearch(item, normalizedQuery);
      const matchesCategory = selectedCategories.length === 0 ||
        selectedCategories.some(selectedCat => {
          const getCatName = (c: any) => (typeof c === 'object' ? c?.name : c) || "";
          const itemCat = getCatName(item.category).toLowerCase().trim();
          const targetCat = selectedCat.trim().toLowerCase();
          const isAksesori = itemCat.includes("aksesori");
          if (targetCat === "seragam sd") return itemCat.includes("sd") && !isAksesori;
          if (targetCat === "seragam smp") return itemCat.includes("smp") && !isAksesori;
          if (targetCat === "seragam sma") return itemCat.includes("sma") && !isAksesori;
          if (targetCat === "aksesoris" || targetCat === "aksesori") return isAksesori;
          return itemCat === targetCat;
        });
      const pricePerKodi = (item.discountedPrice || item.price) * 20;
      const matchesPrice = pricePerKodi >= priceRange.from && pricePerKodi <= priceRange.to;

      const itemGender = (item.gender || "Uniseks").trim().toLowerCase();
      const targetGender = genderName.trim().toLowerCase();

      const matchesGenderFilter = itemGender === targetGender;

      return matchesGenderFilter && matchesSearch && matchesCategory && matchesPrice;
    }).length;
  };

  const categories = categoriesFromDB.length > 0
    ? [...categoriesFromDB]
      .filter(cat => !cat.name.toLowerCase().startsWith("rok") && !cat.name.toLowerCase().startsWith("celana"))
      .sort((a, b) => {
        const indexA = CATEGORY_ORDER.indexOf(a.name);
        const indexB = CATEGORY_ORDER.indexOf(b.name);
        if (indexA === -1 && indexB === -1) return a.name.localeCompare(b.name);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      })
      .map(cat => ({
        name: cat.name,
        products: getCategoryCount(cat.name),
        isRefined: false
      }))
    : CATEGORIES.map(cat => ({
      name: cat,
      products: getCategoryCount(cat),
      isRefined: false
    }));


  const genders = [
    {
      name: "Laki-laki",
      products: getGenderCount("Laki-laki"),
    },
    {
      name: "Perempuan",
      products: getGenderCount("Perempuan"),
    },
    {
      name: "Uniseks",
      products: getGenderCount("Uniseks"),
    },
  ];

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);

    // closing sidebar while clicking outside
    function handleClickOutside(event) {
      if (!event.target.closest(".sidebar-content")) {
        setProductSidebar(false);
      }
    }

    if (productSidebar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  });

  return (
    <>
      <Breadcrumb
        title={"Jelajahi Semua Produk"}
        pages={["toko", "/", "toko dengan sidebar"]}
      />
      <section className="overflow-hidden relative mt-0 pt-[10px] pb-10 lg:pt-20 xl:pt-28 bg-white">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-6 2xl:px-0">
          <div className="flex gap-7.5">
            {/* <!-- Sidebar Start --> */}
            <div
              className={`sidebar-content fixed lg:static z-[9999] lg:z-1 left-0 top-0 h-screen lg:h-auto overflow-y-auto lg:overflow-visible transition-transform duration-300 lg:translate-x-0 max-w-[310px] lg:max-w-[270px] w-full bg-white lg:bg-transparent p-5 lg:p-0 border-r border-gray-3 lg:border-none shadow-xl lg:shadow-none ${productSidebar
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
                }`}
            >
              <button
                onClick={() => setProductSidebar(false)}
                aria-label="close sidebar"
                className="lg:hidden absolute top-4 right-4 text-dark hover:text-blue"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="flex flex-col gap-6">
                  {/* <!-- filter box --> */}
                  <div className="bg-white shadow-1 rounded-lg py-4 px-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-black uppercase text-[#212121] tracking-widest">Filter:</p>
                      <button
                        type="button"
                        onClick={handleClearAll}
                        className="text-blue hover:underline"
                      >
                        Bersihkan Semua
                      </button>
                    </div>
                  </div>

                  {/* <!-- category box --> */}
                  <CategoryDropdown
                    categories={categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                  />

                  {/* <!-- gender box --> */}
                  <GenderDropdown
                    genders={genders}
                    selectedGenders={selectedGenders}
                    setSelectedGenders={setSelectedGenders}
                  />

                  {/* // <!-- size box --> */}
                  <SizeDropdown
                    selectedSizes={selectedSizes}
                    setSelectedSizes={setSelectedSizes}
                  />

                  {/* // <!-- color box --> */}
                  <ColorsDropdwon
                    selectedColors={selectedColors}
                    setSelectedColors={setSelectedColors}
                  />

                  {/* // <!-- price range box --> */}
                  <PriceDropdown
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                  />
                </div>
              </form>
            </div>
            {/* // <!-- Sidebar End --> */}

            {/* // <!-- Content Start --> */}
            <div className="lg:max-w-[720px] xl:max-w-[870px] w-full">
              <div className="rounded-xl bg-white shadow-sm border border-gray-3/50 px-5 py-4 mb-6">
                <div className="flex flex-col gap-4">
                  {/* <!-- Toolbar Controls --> */}
                  <div className="flex items-center justify-between gap-4">
                    {/* <!-- left: filter & sort --> */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => setProductSidebar(true)}
                        className="lg:hidden flex items-center gap-2 px-4 h-10 bg-white border border-gray-3 rounded-md text-dark hover:text-blue hover:border-blue transition-colors text-sm font-medium"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        <span>Filter</span>
                      </button>
                      <CustomSelect options={options} onChange={(val) => setSortBy(val)} />
                    </div>

                    {/* <!-- right: view styles --> */}
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => setProductStyle("grid")}
                        aria-label="button for product grid tab"
                        className={`${productStyle === "grid"
                            ? "bg-blue border-blue text-white"
                            : "text-dark bg-white border-gray-3"
                          } flex items-center justify-center w-10 h-10 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                      </button>

                      <button
                        onClick={() => setProductStyle("list")}
                        aria-label="button for product list tab"
                        className={`${productStyle === "list"
                            ? "bg-blue border-blue text-white"
                            : "text-dark bg-white border-gray-3"
                          } flex items-center justify-center w-10 h-10 rounded-lg border ease-out duration-200 hover:bg-blue hover:border-blue hover:text-white`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>

                  {/* <!-- Product Count --> */}
                  <div className="flex items-center gap-1.5 text-sm text-dark-4">
                    <span>Menampilkan</span>
                    <span className="text-dark font-bold">{sortedProducts.length}</span>
                    <span>Produk</span>
                  </div>
                </div>
              </div>

              {/* <!-- Products Grid Tab Content Start --> */}
              <div
                className={`${productStyle === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-7.5 gap-y-9"
                    : "flex flex-col gap-7.5"
                  }`}
              >
                {loading ? (
                  Array(ITEMS_PER_PAGE).fill(0).map((_, i) => (
                    <div key={i}>
                      <ProductSkeleton />
                    </div>
                  ))
                ) : paginatedProducts.length > 0 ? (
                  paginatedProducts.map((item, key) =>
                    productStyle === "grid" ? (
                      <SingleGridItem item={item} key={key} priority={key < 3} />
                    ) : (
                      <SingleListItem item={item} key={key} priority={key < 3} />
                    )
                  )
                ) : (
                  <div className="col-span-full py-20 text-center">
                    <p className="text-xl font-medium text-dark">Maaf, produk tidak ditemukan.</p>
                    <p className="text-gray-500 mt-2">Coba gunakan kata kunci lain.</p>
                  </div>
                )}
              </div>
              {/* <!-- Products Grid Tab Content End --> */}

              {/* <!-- Products Pagination Start --> */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-15">
                  <div className="bg-white shadow-1 rounded-md p-2">
                    <ul className="flex items-center">
                      <li>
                        <button
                          id="paginationLeft"
                          aria-label="halaman sebelumnya"
                          type="button"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:hover:bg-transparent"
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
                              d="M12.1782 16.1156C12.0095 16.1156 11.8407 16.0594 11.7282 15.9187L5.37197 9.45C5.11885 9.19687 5.11885 8.80312 5.37197 8.55L11.7282 2.08125C11.9813 1.82812 12.3751 1.82812 12.6282 2.08125C12.8813 2.33437 12.8813 2.72812 12.6282 2.98125L6.72197 9L12.6563 15.0187C12.9095 15.2719 12.9095 15.6656 12.6563 15.9187C12.4876 16.0312 12.347 16.1156 12.1782 16.1156Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </li>

                      {getPageNumbers().map((page, index) => (
                        <li key={index}>
                          {page === "..." ? (
                            <span className="flex py-1.5 px-3.5 text-dark-4">...</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setCurrentPage(page as number)}
                              className={`flex py-1.5 px-3.5 duration-200 rounded-[3px] ${currentPage === page
                                  ? "bg-blue text-white"
                                  : "hover:text-white hover:bg-blue"
                                }`}
                            >
                              {page}
                            </button>
                          )}
                        </li>
                      ))}

                      <li>
                        <button
                          id="paginationRight"
                          aria-label="halaman selanjutnya"
                          type="button"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                          className="flex items-center justify-center w-8 h-9 ease-out duration-200 rounded-[3px] hover:text-white hover:bg-blue disabled:text-gray-4 disabled:hover:bg-transparent"
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
                              d="M5.82197 16.1156C5.65322 16.1156 5.5126 16.0594 5.37197 15.9469C5.11885 15.6937 5.11885 15.3 5.37197 15.0469L11.2782 9L5.37197 2.98125C5.11885 2.72812 5.11885 2.33437 5.37197 2.08125C5.6251 1.82812 6.01885 1.82812 6.27197 2.08125L12.6282 8.55C12.8813 8.80312 12.8813 9.19687 12.6282 9.45L6.27197 15.9187C6.15947 16.0312 5.99072 16.1156 5.82197 16.1156Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
              {/* <!-- Products Pagination End --> */}
            </div>
            {/* // <!-- Content End --> */}
          </div>
        </div>
      </section>
    </>
  );
};

export default ShopWithSidebar;
