  import { createSlice } from "@reduxjs/toolkit";
  import {
    addReview,
    fetchAllReviews,
    fetchProductReviews,
  } from "./reviewsThunk";

  const reviewsSlice = createSlice({
    name: "reviews",
    initialState: {
      loading: false,
      error: null,
      success: false,
      productReviews: {},
      allReviews: [],
    },
    reducers: {
      resetReviewStatus: (state) => {
        state.success = false;
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(addReview.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(addReview.fulfilled, (state) => {
          state.loading = false;
          state.success = true;
        })
        .addCase(addReview.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })

        .addCase(fetchProductReviews.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchProductReviews.fulfilled, (state, action) => {
          state.loading = false;
          const productId = action.meta.arg?.productId;
          if (productId) {
            state.productReviews[productId] = action.payload?.data || {};
          }
        })
        .addCase(fetchProductReviews.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        })
        .addCase(fetchAllReviews.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(fetchAllReviews.fulfilled, (state, action) => {
          state.loading = false;
          state.allReviews = action.payload?.data?.customerReviews || []; 
        })
        .addCase(fetchAllReviews.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
        });
    },
  });

  export const { resetReviewStatus } = reviewsSlice.actions;
  export default reviewsSlice.reducer;
