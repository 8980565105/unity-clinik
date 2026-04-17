import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
} from "./couponsThunk";

interface Coupon {
  _id: string;
  name: string;
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  usage_limit: number;
  used_count: number;
  min_purchase_amount: number;
  max_discount_amount: number | null;
  status?: "active" | "inactive";
  start_date: string;
  end_date: string;
  createdAt: string;
  updatedAt: string;
}

interface CouponsState {
  coupons: Coupon[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CouponsState = {
  coupons: [],
  total: 0,
  loading: false,
  error: null,
};

const couponsSlice = createSlice({
  name: "coupons",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ✅ Fetch
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload.coupons;
        state.total = action.payload.total;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Create
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.coupons.unshift(action.payload);
        state.total += 1;
      })

      // ✅ Update
      .addCase(updateCoupon.fulfilled, (state, action) => {
        const index = state.coupons.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.coupons[index] = action.payload;
      })

      .addCase(updateCouponStatus.fulfilled, (state, action) => {
        const index = state.coupons.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.coupons[index] = action.payload;
        }
      })

      // ✅ Delete
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter((c) => c._id !== action.payload);
        state.total -= 1;
      })

      // ✅ Bulk Delete
      .addCase(bulkDeleteCoupons.fulfilled, (state, action) => {
        state.coupons = state.coupons.filter(
          (c) => !action.payload.includes(c._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default couponsSlice.reducer;
