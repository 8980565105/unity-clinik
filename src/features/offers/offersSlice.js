import { createSlice } from "@reduxjs/toolkit";
import { fetchOffers } from "./offersThunk";

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const offersSlice = createSlice({
  name: "offer",
  initialState,
  reducers: {
    clearOffers(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOffers } = offersSlice.actions;
export default offersSlice.reducer;
