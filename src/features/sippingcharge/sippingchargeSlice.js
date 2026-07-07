import { createSlice } from "@reduxjs/toolkit";
import { fetchShippingCharge } from "./sippingchargeThunk";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const sippingchargeSlice = createSlice({
  name: "sippingcharge",
  initialState,
  reducers: {
    clearShippingCharge(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchShippingCharge.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchShippingCharge.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchShippingCharge.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearShippingCharge } = sippingchargeSlice.actions;
export default sippingchargeSlice.reducer;
