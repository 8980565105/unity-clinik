//D:\mycara\frontend\src\features\wishlist\wishlistSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  addToWishlist,
  bulkDeleteWishlistItems,
  fetchWishlistByUser,
  removeWishlistItem,
} from "./wishlistThunk";

const initialState = {
  items: [],
  productIds: [],
  wishlistId: null,
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      state.items.push(action.payload);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const item = action.payload?.item;
        if (item && item.product_id?._id) {
          state.items.push(item);
          if (!state.productIds.includes(item.product_id._id)) {
            state.productIds.push(item.product_id._id);
          }
        }
      })

      .addCase(fetchWishlistByUser.fulfilled, (state, action) => {
        state.items = action.payload?.items || [];
        state.wishlistId = action.payload?._id;
        state.productIds = state.items.map((x) => x.product_id?._id);
      })

      .addCase(removeWishlistItem.fulfilled, (state, action) => {
        const removedId = action.meta.arg.item_id;
        state.items = state.items.filter((x) => x._id !== removedId);
        state.productIds = state.items.map((x) => x.product_id?._id);
      })

      .addCase(bulkDeleteWishlistItems.fulfilled, (state, action) => {
        state.loading = false;
        const deletedIds = action.meta.arg;
        state.items = state.items.filter(
          (item) => !deletedIds.includes(item._id),
        );
      });
  },
});

export const { removeFromWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
