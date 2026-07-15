import { createSlice } from "@reduxjs/toolkit";
import {
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createConsultationBooking,
  markPaymentFailed,
} from "./paymentThunk";

const initialState = {
  payment: null,
  loading: false,
  error: null,
};

const paymentSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    resetPayment: (state) => {
      state.payment = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRazorpayOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.razorOrder = action.payload;
      })
      .addCase(createRazorpayOrder.rejected, (state) => {
        state.loading = false;
      })

      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.success = true;
        state.payment = action.payload;
      })

      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.payment = action.payload;
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createConsultationBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConsultationBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.consultationBooking = action.payload;
      })
      .addCase(createConsultationBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markPaymentFailed.pending, (state) => {
        state.loading = false;
      })
      .addCase(markPaymentFailed.fulfilled, (state, action) => {
        state.failedPayment = action.payload;
      })
      .addCase(markPaymentFailed.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
