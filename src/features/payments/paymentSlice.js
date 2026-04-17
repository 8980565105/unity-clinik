import { createSlice } from "@reduxjs/toolkit";
import { createPayment } from "./paymentThunk";

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
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
