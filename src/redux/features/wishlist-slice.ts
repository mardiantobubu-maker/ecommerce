import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type InitialState = {
  items: WishListItem[];
};

type WishListItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number;
  status?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
};

// Helper to load wishlist from localStorage
const loadWishlistFromStorage = (): WishListItem[] => {
  if (typeof window !== "undefined") {
    const savedWishlist = localStorage.getItem("wishlist_items");
    if (savedWishlist) {
      try {
        return JSON.parse(savedWishlist);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
};

// Helper to save wishlist to localStorage
const saveWishlistToStorage = (items: WishListItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("wishlist_items", JSON.stringify(items));
  }
};

const initialState: InitialState = {
  items: [],
};

export const wishlist = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addItemToWishlist: (state, action: PayloadAction<WishListItem>) => {
      const { id, title, price, quantity, imgs, discountedPrice, status } =
        action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.items.push({
          id,
          title,
          price,
          quantity,
          imgs,
          discountedPrice,
          status,
        });
      }
      saveWishlistToStorage(state.items);
    },
    removeItemFromWishlist: (state, action: PayloadAction<number>) => {
      const itemId = action.payload;
      state.items = state.items.filter((item) => item.id !== itemId);
      saveWishlistToStorage(state.items);
    },

    removeAllItemsFromWishlist: (state) => {
      state.items = [];
      saveWishlistToStorage([]);
    },
    setWishlistItems: (state, action: PayloadAction<WishListItem[]>) => {
      state.items = action.payload;
      saveWishlistToStorage(state.items);
    },
    hydrateWishlist: (state) => {
      state.items = loadWishlistFromStorage();
    },
  },
});

export const {
  addItemToWishlist,
  removeItemFromWishlist,
  removeAllItemsFromWishlist,
  setWishlistItems,
  hydrateWishlist,
} = wishlist.actions;
export default wishlist.reducer;
