import { useCallback, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/store";
import { supabase } from "@/lib/supabase";
import { setCartItems, selectCartItems, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useAuth } from "@/app/context/AuthContext";
import toast from "react-hot-toast";
import { store } from "@/redux/store";

export const useCartSync = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  
  const isSyncing = useRef(false);

  // Function to sync a single item (used by components)
  const syncCartItemToSupabase = useCallback(async (item: any, isRemoving: boolean = false) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (isRemoving) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', item.id)
        .eq('color', item.color || '')
        .eq('sleeve', item.sleeve || '')
        .eq('fit', item.fit || '');
    } else {
      const { data: existingData, error: lookupError } = await supabase
        .from('cart_items')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', item.id)
        .eq('color', item.color || '')
        .eq('sleeve', item.sleeve || '')
        .eq('fit', item.fit || '')
        .limit(1);

      if (lookupError) {
        console.error("Cart Lookup Error Detail:", JSON.stringify(lookupError, null, 2));
        return;
      }

      const existing = existingData && existingData.length > 0 ? existingData[0] : null;

      if (existing) {
        const { error: updateError } = await supabase
          .from('cart_items')
          .update({
            title: item.title,
            price: item.price,
            discounted_price: item.discountedPrice,
            quantity: item.quantity,
            image: item.image || (item.imgs?.thumbnails[0]) || "",
            variant_details: item.variantBreakdown || {}
          })
          .eq('id', existing.id);
          
      if (updateError) {
        console.error("Cart Update Error Detail:", updateError);
        toast.error("Gagal memperbarui keranjang di database");
      }
    } else {
      const insertData = {
        user_id: user.id,
        product_id: item.id,
        title: item.title || "Produk",
        price: Number(item.price || 0),
        discounted_price: Number(item.discountedPrice || item.discounted_price || item.price || 0),
        quantity: Number(item.quantity || 1),
        color: item.color || '',
        size: '', // B2B stores sizes in variant_details
        sleeve: item.sleeve || '',
        fit: item.fit || '',
        image: item.image || (item.imgs?.thumbnails?.[0]) || (item.imgs?.previews?.[0]) || "",
        variant_details: item.variantBreakdown || {}
      };

      const { error: insertError } = await supabase
        .from('cart_items')
        .insert(insertData);

      if (insertError) {
        console.error("Cart Insert Error Detail:", JSON.stringify(insertError, null, 2));
        console.error("Attempted Data:", JSON.stringify(insertData, null, 2));
      }
    }
    }
  }, []);

  const clearAllCartSupabase = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);
  }, []);

  // Global Sync Logic - Stabilized to avoid infinite loops
  const performGlobalSync = useCallback(async () => {
    if (!user || isSyncing.current) return;
    isSyncing.current = true;

    try {
      const { data: remoteData, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', user.id);

      const dbDuplicatesToCleanup: string[] = [];
      const consolidatedRemote = (remoteData || []).reduce((acc: any[], current: any) => {
        // Use consistent normalization for variant matching (B2B: size is in variantBreakdown)
        const color = (current.color === 'N/A' ? '' : current.color) || '';
        const sleeve = (current.sleeve === 'N/A' ? '' : current.sleeve) || '';
        const fit = (current.fit === 'Standard' || current.fit === 'N/A' ? '' : current.fit) || '';
        
        const variantKey = `${current.product_id}-${color}-${sleeve}-${fit}`;
        const existingIndex = acc.findIndex(item => {
          const iColor = (item.color === 'N/A' ? '' : item.color) || '';
          const iSleeve = (item.sleeve === 'N/A' ? '' : item.sleeve) || '';
          const iFit = (item.fit === 'Standard' || item.fit === 'N/A' ? '' : item.fit) || '';
          return `${item.id}-${iColor}-${iSleeve}-${iFit}` === variantKey;
        });

        if (existingIndex > -1) {
          dbDuplicatesToCleanup.push(current.id);
        } else {
          acc.push({
            id: current.product_id,
            title: current.title || "Produk",
            price: Number(current.price || 0),
            discountedPrice: Number(current.discounted_price || current.price || 0),
            quantity: Number(current.quantity || 1),
            color: color,
            size: '',
            sleeve: sleeve,
            fit: fit,
            variantBreakdown: current.variant_details || {},
            imgs: { 
              thumbnails: [current.image || "/images/products/seragam-smp.png"], 
              previews: [current.image || "/images/products/seragam-smp.png"] 
            },
          });
        }
        return acc;
      }, []);

      let hasChanges = false;
      const finalItems = [...consolidatedRemote];

      // Get the freshest state directly from the store to avoid race conditions with hydration
      const currentLocalItems = store.getState().cartReducer.items;

      for (const localItem of currentLocalItems) {
        // Normalize local item properties for consistent matching
        const lColor = (localItem.color === 'N/A' ? '' : localItem.color) || '';
        const lSleeve = (localItem.sleeve === 'N/A' ? '' : localItem.sleeve) || '';
        const lFit = (localItem.fit === 'Standard' || localItem.fit === 'N/A' ? '' : localItem.fit) || '';

        const variantKey = `${localItem.id}-${lColor}-${lSleeve}-${lFit}`;
        const remoteIdx = finalItems.findIndex(item => {
          const rColor = (item.color === 'N/A' ? '' : item.color) || '';
          const rSleeve = (item.sleeve === 'N/A' ? '' : item.sleeve) || '';
          const rFit = (item.fit === 'Standard' || item.fit === 'N/A' ? '' : item.fit) || '';
          return `${item.id}-${rColor}-${rSleeve}-${rFit}` === variantKey;
        });

        if (remoteIdx > -1) {
          if (finalItems[remoteIdx].quantity !== localItem.quantity) {
             finalItems[remoteIdx].quantity = Math.max(finalItems[remoteIdx].quantity, localItem.quantity);
             hasChanges = true;
          }
        } else {
          // Push normalized item
          finalItems.push({
            ...localItem,
            color: lColor,
            size: '',
            sleeve: lSleeve,
            fit: lFit
          });
          hasChanges = true;
        }
      }

      if (hasChanges || dbDuplicatesToCleanup.length > 0) {
        for (const item of finalItems) {
          await syncCartItemToSupabase(item);
        }
        
        if (dbDuplicatesToCleanup.length > 0) {
          await supabase.from('cart_items').delete().in('id', dbDuplicatesToCleanup);
        }
      }

      dispatch(setCartItems(finalItems));
    } finally {
      isSyncing.current = false;
    }
  }, [user?.id, dispatch, syncCartItemToSupabase]); // cartItems removed from dependencies

  return { syncCartItemToSupabase, clearAllCartSupabase, performGlobalSync };
};
