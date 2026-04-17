import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCartItems,
  getCartItemById,
  deleteCartItem,
  bulkDeleteCartItems,
} from "./cartThunk";

interface CartState {
  carts: any[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedItem: any | null;
}

const initialState: CartState = {
  carts: [],
  total: 0,
  loading: false,
  error: null,
  selectedItem: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCartItems.fulfilled, (state, action) => {
        state.loading = false;
        state.carts = action.payload.carts;
        state.total = action.payload.total;
      })
      .addCase(fetchCartItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCartItemById.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      .addCase(deleteCartItem.fulfilled, (state, action) => {

        state.carts = state.carts.filter((cart) => cart._id !== action.payload);
      })
      .addCase(bulkDeleteCartItems.fulfilled, (state, action) => {
        state.carts = state.carts.filter(
          (item) => !action.payload.includes(item._id)
        );
      });
  },
});

export default cartSlice.reducer;
