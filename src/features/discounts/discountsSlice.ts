import { createSlice } from "@reduxjs/toolkit";
import { bulkDeleteDiscounts, createDiscount, deleteDiscount, fetchDiscounts, updateDiscount, updateDiscountStatus } from "./discountsThunk";

interface Discount {
  _id: string;
  name: string;
  code:string;
  value: number;
  type: "percentage" | "fixed"
  status?: "active" | "inactive";
  start_date: string;
  end_date: string;
  createdAt: string;
  updatedAt: string;
}

interface DiscountsState {
  discounts: Discount[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: DiscountsState = {
  discounts: [],
  total: 0,
  loading: false,
  error: null,
};

const discountsSlice = createSlice({
  name: "discounts",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchDiscounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDiscounts.fulfilled, (state, action) => {
        state.loading = false;
        state.discounts = action.payload.discounts;
        state.total = action.payload.total;
      })
      .addCase(fetchDiscounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createDiscount.fulfilled, (state, action) => {
        state.discounts.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateDiscount.fulfilled, (state, action) => {
        const index = state.discounts.findIndex((d) => d._id === action.payload._id);
        if (index !== -1) state.discounts[index] = action.payload;
      })

       .addCase(updateDiscountStatus.fulfilled, (state, action) => {
              const index = state.discounts.findIndex(
                (c) => c._id === action.payload._id
              );
              if (index !== -1) {
                state.discounts[index] = action.payload;
              }
            })

      // Delete
      .addCase(deleteDiscount.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter((d) => d._id !== action.payload);
        state.total -= 1;
      })

      // Bulk delete
      .addCase(bulkDeleteDiscounts.fulfilled, (state, action) => {
        state.discounts = state.discounts.filter((d) => !action.payload.includes(d._id));
        state.total -= action.payload.length;
      });
  },
});

export default discountsSlice.reducer;
