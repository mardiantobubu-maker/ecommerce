"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { useRouter } from "next/navigation";

const AdminLogin = dynamic(() => import("../../../components/Admin/AdminLogin"), { ssr: false });
const AdminProducts = dynamic(() => import("../../../components/Admin/Products"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminOrders = dynamic(() => import("../../../components/Admin/Orders"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminShipping = dynamic(() => import("../../../components/Admin/Shipping"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminTestimonials = dynamic(() => import("../../../components/Admin/Testimonials"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminCoupons = dynamic(() => import("../../../components/Admin/Coupons"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminMessages = dynamic(() => import("../../../components/Admin/Messages"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminCategories = dynamic(() => import("../../../components/Admin/Categories"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminCountdown = dynamic(() => import("../../../components/Admin/Countdown"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminBlogs = dynamic(() => import("../../../components/Admin/Blogs"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminCustomers = dynamic(() => import("../../../components/Admin/Customers"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });
const AdminPromoBanners = dynamic(() => import("../../../components/Admin/PromoBanners"), { ssr: false, loading: () => <div className="py-10 text-center text-dark-4">Memuat...</div> });

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("products");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Cek apakah admin sudah login sebelumnya di sesi ini
    const loggedIn = localStorage.getItem("isAdminLoggedIn");
    if (loggedIn === "true") {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("isAdminLoggedIn");
    setIsLoggedIn(false);
  };

  if (loading) return <div className="py-20 text-center">Memuat...</div>;

  // Tampilkan halaman login jika belum login
  if (!isLoggedIn) {
    return (
      <>
        <Breadcrumb title={"Login Admin"} pages={["admin", "login"]} />
        <AdminLogin onLogin={setIsLoggedIn} />
      </>
    );
  }

  return (
    <>
      <div className="hidden md:block">
        <Breadcrumb title={"Dashboard Admin"} pages={["admin"]} maxW="max-w-[1280px]" />
      </div>

      <section className="overflow-hidden pt-[170px] px-0 pb-[16px] md:py-20 bg-white min-h-screen">
        <div className="max-w-[1280px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col xl:flex-row gap-5 xl:gap-7.5">
            {/* Sidebar Admin */}
            <div className="xl:max-w-[270px] w-full bg-white rounded-xl shadow-1 p-4 xl:p-6 h-fit border border-gray-3 sticky top-[65px] z-[40] xl:static">
              <div className="flex flex-row xl:flex-col gap-3 overflow-x-auto xl:overflow-x-visible no-scrollbar py-2 xl:pb-0">
                <button
                  onClick={() => setActiveTab("products")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "products" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Produk
                </button>
                <button
                  onClick={() => setActiveTab("blogs")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "blogs" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Blog
                </button>
                <button
                  onClick={() => setActiveTab("categories")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "categories" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Kategori
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "shipping" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Pengiriman
                </button>
                <button
                  onClick={() => setActiveTab("countdown")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "countdown" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Promo Countdown
                </button>
                <button
                  onClick={() => setActiveTab("promo_banners")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "promo_banners" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Banner Promo
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "orders" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Pesanan
                </button>
                <button
                  onClick={() => setActiveTab("testimonials")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "testimonials" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Testimoni
                </button>
                <button
                  onClick={() => setActiveTab("coupons")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "coupons" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Kupon
                </button>
                <button
                  onClick={() => setActiveTab("messages")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "messages" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Pesan
                </button>
                <button
                  onClick={() => setActiveTab("customers")}
                  className={`flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap transition-all ${activeTab === "customers" ? "bg-blue text-white shadow-md" : "bg-gray-1 text-dark hover:bg-gray-3"
                    }`}
                >
                  Pelanggan
                </button>

                <div className="xl:mt-8 xl:pt-4 xl:border-t xl:border-gray-3 flex items-center">
                  <button
                    onClick={handleLogout}
                    className="flex items-center rounded-md gap-3.5 py-2.5 xl:py-3 px-5 font-medium whitespace-nowrap text-red bg-red/5 hover:bg-red/10 transition-all"
                  >
                    Keluar
                  </button>
                </div>
              </div>
            </div>

            {/* Content Admin */}
            <div className="flex-1 bg-white rounded-xl shadow-1 mt-10 md:mt-0 p-4 sm:p-6 border border-gray-3 overflow-hidden">
              {activeTab === "products" && <AdminProducts />}
              {activeTab === "blogs" && <AdminBlogs />}
              {activeTab === "categories" && <AdminCategories />}
              {activeTab === "shipping" && <AdminShipping />}
              {activeTab === "countdown" && <AdminCountdown />}
              {activeTab === "promo_banners" && <AdminPromoBanners />}
              {activeTab === "orders" && <AdminOrders />}
              {activeTab === "testimonials" && <AdminTestimonials />}
              {activeTab === "coupons" && <AdminCoupons />}
              {activeTab === "messages" && <AdminMessages />}
              {activeTab === "customers" && <AdminCustomers />}

            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AdminDashboard;
