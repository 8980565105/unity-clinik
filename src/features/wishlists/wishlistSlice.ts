import { createSlice } from "@reduxjs/toolkit";
import {
  fetchWishlistItems,
  getWishlistItemById,
  deleteWishlistItem,
  bulkDeleteWishlistItems,
} from "./wishlistThunk";

interface WishlistState {
  items: any[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedItem: any | null;
}

const initialState: WishlistState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  selectedItem: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchWishlistItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWishlistItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.wishlists || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchWishlistItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get by ID
      .addCase(getWishlistItemById.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      // Delete single
      .addCase(deleteWishlistItem.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      // Bulk delete
      .addCase(bulkDeleteWishlistItems.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => !action.payload.includes(item._id)
        );
      });
  },
});

export default wishlistSlice.reducer;
