import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { KODI_SIZE, getKodiDiscount, calculateKodiPrice } from "@/utils/kodiPricing";

type InitialState = {
  items: CartItem[];
};

export type CartItem = {
  id: number;
  title: string;
  price: number;
  discountedPrice: number;
  quantity: number; // This will represent total pieces
  color?: string;
  size?: string; // Legacy field
  sleeve?: string;
  fit?: string;
  variantBreakdown?: { [key: string]: number }; // Key: "size-color"
  totalKodi?: number;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  weight?: number; // In grams
  silent?: boolean;
};

// Helper to load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  if (typeof window !== "undefined") {
    const savedCart = localStorage.getItem("seragam_cart");
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        return [];
      }
    }
  }
  return [];
};

// Helper to save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("seragam_cart", JSON.stringify(items));
  }
};

const initialState: InitialState = {
  items: [],
};

export const cart = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      const { id, color, sleeve, fit, quantity, variantBreakdown } = action.payload;
      
      const existingItem = state.items.find(
        (item) => 
          item.id === id && 
          (item.color || '') === (color || '') && 
          (item.sleeve || '') === (sleeve || '') && 
          (item.fit || '') === (fit || '')
      );

      // Enforce B2B minimum of 20 units
      const finalQuantity = Math.max(quantity, 20);

      if (existingItem) {
        existingItem.quantity += finalQuantity;
        if (variantBreakdown && existingItem.variantBreakdown) {
          Object.entries(variantBreakdown).forEach(([key, qty]) => {
            existingItem.variantBreakdown![key] = (existingItem.variantBreakdown![key] || 0) + qty;
          });
        }
        existingItem.totalKodi = Math.floor(existingItem.quantity / KODI_SIZE);
      } else {
        const newItem = { ...action.payload, quantity: finalQuantity };
        newItem.totalKodi = Math.floor(newItem.quantity / KODI_SIZE);
        state.items.push(newItem);
      }
      saveCartToStorage(state.items);
    },
    removeItemFromCart: (state, action: PayloadAction<{id: number, color?: string, size?: string, sleeve?: string, fit?: string}>) => {
      const { id, color, size, sleeve, fit } = action.payload;
      state.items = state.items.filter(
        (item) => 
          !(item.id === id && 
            (item.color || '') === (color || '') && 
            (size ? item.size === size : true) && 
            (item.sleeve || '') === (sleeve || '') && 
            (item.fit || '') === (fit || ''))
      );
      saveCartToStorage(state.items);
    },
    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: number, quantity: number, color?: string, sleeve?: string, fit?: string, variantBreakdown?: { [key: string]: number } }>
    ) => {
      const { id, quantity, color, sleeve, fit, variantBreakdown } = action.payload;
      const existingItem = state.items.find(
        (item) => 
          item.id === id && 
          (item.color || '') === (color || '') && 
          (item.sleeve || '') === (sleeve || '') && 
          (item.fit || '') === (fit || '')
      );

      if (existingItem) {
        existingItem.quantity = quantity;
        if (variantBreakdown) {
          existingItem.variantBreakdown = variantBreakdown;
        }
        existingItem.totalKodi = Math.floor(existingItem.quantity / KODI_SIZE);
      }
      saveCartToStorage(state.items);
    },

    removeAllItemsFromCart: (state) => {
      state.items = [];
      saveCartToStorage([]);
    },
    hydrateCart: (state) => {
      const items = loadCartFromStorage();
      state.items = items.map(item => ({
        ...item,
        totalKodi: item.totalKodi || Math.floor((item.quantity || 0) / KODI_SIZE)
      }));
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload.map(item => ({
        ...item,
        totalKodi: item.totalKodi || Math.floor((item.quantity || 0) / KODI_SIZE)
      }));
      saveCartToStorage(state.items);
    }
  },
});

export const selectCartItems = (state: RootState) => state.cartReducer.items;

export const selectTotalKodi = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => total + (item.totalKodi || 0), 0);
});

export const selectCartSubtotal = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => total + (item.discountedPrice * item.quantity), 0);
});

export const selectTotalPrice = createSelector([selectCartItems], (items) => {
  const subtotal = items.reduce((total, item) => total + (item.discountedPrice * item.quantity), 0);
  
  // Calculate global discount based on total kodi
  const totalKodiCount = items.reduce((sum, item) => sum + (item.totalKodi || 0), 0);
  const discountInfo = getKodiDiscount(totalKodiCount);
  
  if (discountInfo) {
    return subtotal * (1 - discountInfo.discount);
  }
  
  return subtotal;
});

export const selectTotalQuantity = createSelector([selectCartItems], (items) => {
  return items.reduce((total, item) => total + item.quantity, 0);
});

export const selectTotalWeight = createSelector([selectCartItems], (items) => {
  // Default weight 250g per item if not specified
  return items.reduce((total, item) => total + (item.weight || 250) * item.quantity, 0);
});

export const {
  addItemToCart,
  removeItemFromCart,
  updateCartItemQuantity,
  removeAllItemsFromCart,
  hydrateCart,
  setCartItems,
} = cart.actions;
export default cart.reducer;
