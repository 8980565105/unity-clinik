// export default customerReviewsSlice.reducer;
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCustomerReviews,
  deleteCustomerReview,
  bulkDeleteCustomerReviews,
  getCustomerReviewById,
  updateReviewsStatus,
  createCustomerReview,
  fetchPublicProductReviews,
} from "./customerReviewsThunk";

interface CustomerReviewState {
  customerReviews: any[]; // Admin/store panel list
  publicReviews: any[]; // Frontend product page reviews
  total: number;
  publicTotal: number;
  loading: boolean;
  submitting: boolean; // For frontend review form submit
  error: string | null;
  selectedReview: any | null;
}

const initialState: CustomerReviewState = {
  customerReviews: [],
  publicReviews: [],
  total: 0,
  publicTotal: 0,
  loading: false,
  submitting: false,
  error: null,
  selectedReview: null,
};

const customerReviewsSlice = createSlice({
  name: "customerReviews",
  initialState,
  reducers: {
    clearPublicReviews: (state) => {
      state.publicReviews = [];
      state.publicTotal = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // ─── Fetch all (admin/store panel) ─────────────────────────────────────
      .addCase(fetchCustomerReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.customerReviews = action.payload.customerReviews;
        state.total = action.payload.total;
      })
      .addCase(fetchCustomerReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ─── Get by ID ──────────────────────────────────────────────────────────
      .addCase(getCustomerReviewById.fulfilled, (state, action) => {
        state.selectedReview = action.payload;
      })

      // ─── Update status (approve/reject toggle) ──────────────────────────────
      .addCase(updateReviewsStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.customerReviews.findIndex(
          (r) => r._id === updated._id,
        );
        if (index !== -1) {
          state.customerReviews[index] = updated;
        }
      })

      // ─── Delete single ──────────────────────────────────────────────────────
      .addCase(deleteCustomerReview.fulfilled, (state, action) => {
        state.customerReviews = state.customerReviews.filter(
          (r) => r._id !== action.payload,
        );
        state.total -= 1;
      })

      // ─── Bulk delete ────────────────────────────────────────────────────────
      .addCase(bulkDeleteCustomerReviews.fulfilled, (state, action) => {
        state.customerReviews = state.customerReviews.filter(
          (r) => !action.payload.includes(r._id),
        );
        state.total -= action.payload.length;
      })

      // ─── Create review (frontend user submits) ──────────────────────────────
      .addCase(createCustomerReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createCustomerReview.fulfilled, (state, action) => {
        state.submitting = false;
        // Add to public reviews list if exists (optimistic update)
        state.publicReviews.unshift(action.payload);
        state.publicTotal += 1;
      })
      .addCase(createCustomerReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      })

      // ─── Fetch public product reviews (frontend product page) ───────────────
      .addCase(fetchPublicProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.publicReviews = action.payload.reviews;
        state.publicTotal = action.payload.total;
      })
      .addCase(fetchPublicProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPublicReviews } = customerReviewsSlice.actions;
export default customerReviewsSlice.reducer;
