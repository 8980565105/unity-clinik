import { createSlice } from "@reduxjs/toolkit";
import { fetchCouponById, fetchCoupons } from "./couponsThunk";

const initialState = {
  coupons: [],
  selectedCoupon: null,
  items: [],
  appliedCoupon: null,
  couponDiscount: 0,
  loading: false,
  error: null,
};

const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {
    clearSelectedCoupon(state) {
      state.selectedCoupon = null;
    },
    applyCoupon(state, action) {
      state.appliedCoupon = action.payload.coupon;
      state.couponDiscount = action.payload.discount;
    },
    removeCoupon(state) {
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchCouponById.fulfilled, (state, action) => {
        state.selectedCoupon = action.payload;
      });
  },
});

export const { clearSelectedCoupon, applyCoupon, removeCoupon } =
  couponsSlice.actions;
export default couponsSlice.reducer;
