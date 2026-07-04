"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/store";

const BottomNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const navItems = [
    {
      name: "Beranda",
      href: "/",
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "1" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <path d="M9 22V12h6v10" fill={isActive ? "#ffffff" : "none"}></path>
        </svg>
      ),
    },
    {
      name: "Kategori",
      href: "/shop-with-sidebar",
      icon: (isActive: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="8" height="8" rx="1.5" fill={isActive ? "currentColor" : "none"}></rect>
          <rect x="13" y="3" width="8" height="8" rx="1.5" fill={isActive ? "currentColor" : "none"}></rect>
          <rect x="13" y="13" width="8" height="8" rx="1.5" fill={isActive ? "currentColor" : "none"}></rect>
          <rect x="3" y="13" width="8" height="8" rx="1.5" fill={isActive ? "currentColor" : "none"}></rect>
        </svg>
      ),
    },
    {
      name: "Transaksi",
      href: "/transactions",
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "1" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"></path>
          <path d="M16 8h-6" stroke={isActive ? "#ffffff" : "currentColor"} strokeWidth="2"></path>
          <path d="M16 12H8" stroke={isActive ? "#ffffff" : "currentColor"} strokeWidth="2"></path>
          <path d="M13 16H8" stroke={isActive ? "#ffffff" : "currentColor"} strokeWidth="2"></path>
        </svg>
      ),
    },
    {
      name: "Favorit",
      href: "/wishlist",
      icon: (isActive: boolean) => (
        <div className="relative">
          <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "1" : "2"} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span className="absolute -top-2 -right-2.5 flex h-[19px] min-w-[19px] px-1 items-center justify-center rounded-full bg-blue text-[10px] font-black text-white border-[1.5px] border-white shadow-sm">
            {wishlistItems.length}
          </span>
        </div>
      ),
    },
    {
      name: "Akun",
      href: "/my-account",
      icon: (isActive: boolean) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill={isActive ? "currentColor" : "none"} stroke="currentColor" strokeWidth={isActive ? "1" : "2"} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
  ];

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 z-[999] w-full bg-white pb-4 pt-2 px-2 border-t border-gray-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
      style={{ transform: "translateZ(0)", WebkitTransform: "translateZ(0)" }}
    >
      <ul className="flex items-center justify-between pb-2">
        {navItems.map((item, idx) => {
          const currentTab = searchParams.get("tab");
          const isActive = item.href.includes("tab=")
            ? (pathname === item.href.split("?")[0] && currentTab === item.href.split("=")[1])
            : (pathname === item.href && (item.name !== "Akun" || !currentTab)) || (item.name === "Akun" && pathname === "/signin");

          return (
            <li key={idx} className="flex-1">
              <Link
                href={item.href}
                className={`group flex flex-col items-center justify-center gap-1 relative py-1 transition-all duration-300 ease-in-out ${isActive ? "text-blue" : "text-dark-4 hover:text-blue"
                  }`}
              >
                {/* Background Indicator for Active Item */}
                <div
                  className={`absolute top-0 w-12 h-12 bg-blue/10 rounded-full transition-transform duration-300 ease-out ${isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                    }`}
                />

                <div className={`relative z-10 transition-transform duration-300 ${isActive ? "-translate-y-1" : ""}`}>
                  {item.icon(isActive)}
                </div>

                <span className={`text-[12px] font-medium tracking-tight relative z-10 transition-all duration-300 ${isActive ? "font-bold" : ""
                  }`}>
                  {item.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default BottomNav;
