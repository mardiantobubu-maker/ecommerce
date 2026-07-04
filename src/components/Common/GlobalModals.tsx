"use client";
import dynamic from "next/dynamic";
import { useModalContext } from "@/app/context/QuickViewModalContext";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { usePreviewSlider } from "@/app/context/PreviewSliderContext";
import { useEffect, useState } from "react";

const QuickViewModal = dynamic(() => import("@/components/Common/QuickViewModal"), { ssr: false });
const CartSidebarModal = dynamic(() => import("@/components/Common/CartSidebarModal"), { ssr: false });
const PreviewSliderModal = dynamic(() => import("@/components/Common/PreviewSlider"), { ssr: false });

export default function GlobalModals() {
  const { isModalOpen } = useModalContext();
  const { isCartModalOpen } = useCartModalContext();
  const { isModalPreviewOpen } = usePreviewSlider();

  // Keep track if any modal was ever opened to avoid unmounting during animations if needed,
  // but for main-thread work, simple conditional rendering is best.
  // We use a small delay for unmounting if we want to keep exit animations, 
  // but since these modals use CSS transitions/animations, we'll keep it simple.
  
  const [shouldRenderQuickView, setShouldRenderQuickView] = useState(false);
  const [shouldRenderCart, setShouldRenderCart] = useState(false);
  const [shouldRenderPreview, setShouldRenderPreview] = useState(false);

  useEffect(() => {
    if (isModalOpen) setShouldRenderQuickView(true);
  }, [isModalOpen]);

  useEffect(() => {
    if (isCartModalOpen) setShouldRenderCart(true);
  }, [isCartModalOpen]);

  useEffect(() => {
    if (isModalPreviewOpen) setShouldRenderPreview(true);
  }, [isModalPreviewOpen]);

  return (
    <>
      {shouldRenderQuickView && <QuickViewModal />}
      {shouldRenderCart && <CartSidebarModal />}
      {shouldRenderPreview && <PreviewSliderModal />}
    </>
  );
}
