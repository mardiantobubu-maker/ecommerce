import { configureStore, Middleware } from "@reduxjs/toolkit";
import toast from "react-hot-toast";

import quickViewReducer from "./features/quickView-slice";
import cartReducer from "./features/cart-slice";
import wishlistReducer from "./features/wishlist-slice";
import productDetailsReducer from "./features/product-details";

import { TypedUseSelectorHook, useSelector, useDispatch } from "react-redux";

const notificationMiddleware: Middleware = () => (next) => (action: any) => {
  if (action.type === "cart/addItemToCart") {
    const { title, totalKodi, silent } = action.payload;
    const isProfileIncomplete = typeof window !== 'undefined' && localStorage.getItem('profile_incomplete') === 'true';
    
    if (!silent && !isProfileIncomplete) {
      const kodiText = totalKodi ? `${totalKodi} Kodi` : "Produk";
      toast.success(`${kodiText} ${title} ditambahkan ke keranjang!`, { id: "cart-notification" });
    }
  } else if (action.type === "cart/removeItemFromCart") {
    toast.success("Produk dihapus dari keranjang!", { id: "cart-notification" });
  } else if (action.type === "wishlist/addItemToWishlist") {
    const { title } = action.payload;
    toast.success(`${title} ditambahkan ke favorit!`, { id: "wishlist-notification" });
  } else if (action.type === "wishlist/removeItemFromWishlist") {
    toast.success("Produk dihapus dari favorit!", { id: "wishlist-notification" });
  }
  return next(action);
};

export const store = configureStore({
  reducer: {
    quickViewReducer,
    cartReducer,
    wishlistReducer,
    productDetailsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
