import { createSlice } from "@reduxjs/toolkit";
import {
  fetchMyAddress,
  updateMyAddress,
  updateUserAddressById,
} from "./addressThunk";

const initialState = {
  address: {
    street: "",
    city: "",
    state: "",
    country: "",
    zip_code: "",
  },
  loading: false,
  error: null,
  successMessage: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressStatus(state) {
      state.error = null;
      state.successMessage = null;
    },
    resetAddress(state) {
      state.address = initialState.address;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.address = action.payload || initialState.address;
      })
      .addCase(fetchMyAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateMyAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateMyAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.address = action.payload || initialState.address;
        state.successMessage = "Address saved successfully!";
      })
      .addCase(updateMyAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    builder
      .addCase(updateUserAddressById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateUserAddressById.fulfilled, (state, action) => {
        state.loading = false;
        state.address = action.payload || initialState.address;
        state.successMessage = "Address updated successfully!";
      })
      .addCase(updateUserAddressById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAddressStatus, resetAddress } = addressSlice.actions;
export default addressSlice.reducer;
