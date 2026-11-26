"use client";
import { useCartSync } from "@/hooks/useCartSync";
import { useWishlistSync } from "@/hooks/useWishlistSync";
import { useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { useAppDispatch } from "@/redux/store";
import { hydrateCart } from "@/redux/features/cart-slice";
import { hydrateWishlist } from "@/redux/features/wishlist-slice";

export default function SyncInitializer() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const { performGlobalSync } = useCartSync();
  const { performWishlistSync } = (useWishlistSync() as any);

  // Unified initialization logic
  useEffect(() => {
    // 1. Hydrate from localStorage immediately on mount
    dispatch(hydrateCart());
    dispatch(hydrateWishlist());

    // 2. If user is logged in, perform remote sync after a short delay
    if (user) {
      const deferSync = () => {
        performGlobalSync();
        if (performWishlistSync) performWishlistSync();
      };

      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(deferSync);
      } else {
        setTimeout(deferSync, 2000);
      }
    }
  }, [user?.id, dispatch, performGlobalSync, performWishlistSync]);

  return null;
}
