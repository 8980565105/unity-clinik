import { createSlice } from "@reduxjs/toolkit";
import { fetchShippingCharge, saveShippingCharge } from "./sippingchargeThunk";
const initialState = {
  data: null as any,
  loading: false,
  saving: false,
  error: null as string | null,
};

const sippingchargeSlice = createSlice({
  name: "sippingcharge",
  initialState,
  reducers: {
    clearShippingChargeError(state) {
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
        state.error = action.payload as string;
      })
      .addCase(saveShippingCharge.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveShippingCharge.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(saveShippingCharge.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearShippingChargeError } = sippingchargeSlice.actions;
export default sippingchargeSlice.reducer;
