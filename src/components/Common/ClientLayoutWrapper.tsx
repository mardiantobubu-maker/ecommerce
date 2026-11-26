"use client";
import { useState, useEffect, Suspense, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";



import { ModalProvider } from "@/app/context/QuickViewModalContext";
import { CartModalProvider } from "@/app/context/CartSidebarModalContext";
import { ReduxProvider } from "@/redux/provider";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
const GlobalModals = dynamic(() => import("@/components/Common/GlobalModals"), { ssr: false });
import { PreviewSliderProvider } from "@/app/context/PreviewSliderContext";


const ScrollToTop = dynamic(() => import("@/components/Common/ScrollToTop"), { ssr: false });
const Footer = dynamic(() => import("@/components/Footer"), { ssr: true });
const BottomNav = dynamic(() => import("@/components/Common/BottomNav"), { ssr: false });

import PreLoader from "@/components/Common/PreLoader";

import { AuthProvider } from "@/app/context/AuthContext";
import { Toaster } from "react-hot-toast";


const SyncInitializer = dynamic(() => import("@/components/Common/SyncInitializer"), { ssr: false });
const OAuthSuccessHandler = dynamic(() => import("@/components/Common/OAuthSuccessHandler"), { ssr: false });
const ProfileStatusChecker = dynamic(() => import("@/components/Common/ProfileStatusChecker"), { ssr: false });

export default function ClientLayoutWrapper({
  children,
  initialCategories = [],
}: {
  children: React.ReactNode;
  initialCategories?: any[];
}) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        (err) => {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
    }
  }, []);

  return (
    <>
      <ReduxProvider>
        <AuthProvider>
          <SyncInitializer />
          <ProfileStatusChecker />
          <Suspense fallback={null}>
            <OAuthSuccessHandler />
          </Suspense>
          <CartModalProvider>
            <ModalProvider>
              <PreviewSliderProvider>
                <Header initialCategories={initialCategories} />
                <main className="pb-[80px] xl:pb-0">{children}</main>

                <GlobalModals />
              </PreviewSliderProvider>
            </ModalProvider>
          </CartModalProvider>
          <BottomNav />
          <ScrollToTop />
          <div className="hidden xl:block">
            <Footer />
          </div>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#1e293b',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                borderRadius: '8px',
                padding: '12px 16px',
              },
            }}
          />
        </AuthProvider>
      </ReduxProvider>
    </>
  );
}
