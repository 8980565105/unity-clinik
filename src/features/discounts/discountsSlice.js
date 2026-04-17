import { createSlice } from "@reduxjs/toolkit";
import { fetchDiscounts, getDiscountById } from "./discountsThunk";

const initialState = {
  discounts: [],
  discount: null,
  loading: false,
  error: null,
};

const discountsSlice = createSlice({
  name: "discounts",
  initialState,
  reducers: {
    clearDiscounts(state) {
      state.discounts = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload?.discounts || [];
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getDiscountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDiscountById.fulfilled, (state, action) => {
        state.loading = false;
        state.discount = action.payload; 
      })
      .addCase(getDiscountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearDiscounts } = discountsSlice.actions;
export default discountsSlice.reducer;