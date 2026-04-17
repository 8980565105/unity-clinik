import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
  createCart,
} from "./cartThunk";

const initialState = {
  cart: null,
  items: [],
  loading: false,
  error: null,
  deletingItemId: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.cart = null;
      state.error = null;
      localStorage.removeItem("cart_id");
    },
    updateLocalQuantity: (state, action) => {
      const { item_id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === item_id);
      if (item) item.quantity = quantity;
    },
  },
  extraReducers: (builder) => {
    builder

      // ── createCart ────────────────────────────────────────────────────────────
      .addCase(createCart.fulfilled, (state, action) => {
        state.cart = action.payload;
        state.items = action.payload?.items || [];
      })

      // ── fetchCart ─────────────────────────────────────────────────────────────
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── addToCart ─────────────────────────────────────────────────────────────
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ── updateCartItem ────────────────────────────────────────────────────────
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const updatedItem = action.payload?.item;
        if (!updatedItem) return;
        const existing = state.items.find((i) => i._id === updatedItem._id);
        if (existing) existing.quantity = updatedItem.quantity;
      })

      // ── deleteCartItem ────────────────────────────────────────────────────────
      .addCase(deleteCartItem.pending, (state, action) => {
        state.deletingItemId = action.meta.arg?.item_id;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {
        state.deletingItemId = null;
        state.cart = action.payload;
        state.items = action.payload?.items || [];
      })
      .addCase(deleteCartItem.rejected, (state) => {
        state.deletingItemId = null;
      });
  },
});

export const { clearCart, updateLocalQuantity } = cartSlice.actions;
export default cartSlice.reducer;
