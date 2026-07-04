import { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { supabase } from "@/lib/supabase";
import { setWishlistItems } from "@/redux/features/wishlist-slice";
import { useAuth } from "@/app/context/AuthContext";

const WISHLIST_STORAGE_KEY = "wishlist_items";

export const useWishlistSync = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);
  
  const isSyncing = useRef(false);

  // Function to sync a single item
  const syncItemToSupabase = useCallback(async (item: any, isAdding: boolean) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isAdding) {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', item.id);

      await supabase
        .from('wishlist_items')
        .insert({
          user_id: user.id,
          product_id: item.id,
          title: item.title,
          price: item.price,
          discounted_price: item.discountedPrice,
          image: item.imgs?.thumbnails[0] || ""
        });
    } else {
      await supabase
        .from('wishlist_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', item.id);
    }
  }, []);

  const clearAllWishlistSupabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id);
  }, []);

  const performWishlistSync = useCallback(async () => {
    if (!user || isSyncing.current) return;
    isSyncing.current = true;

    try {
      const { data } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('user_id', user.id);

      if (data && data.length > 0) {
        const items = data.map(item => ({
          id: item.product_id,
          title: item.title,
          price: Number(item.price),
          discountedPrice: Number(item.discounted_price),
          quantity: 1,
          imgs: { thumbnails: [item.image], previews: [item.image] }
        }));
        dispatch(setWishlistItems(items));
      }
    } finally {
      isSyncing.current = false;
    }
  }, [user?.id, dispatch]);

  return { syncItemToSupabase, clearAllWishlistSupabase, performWishlistSync };
};
