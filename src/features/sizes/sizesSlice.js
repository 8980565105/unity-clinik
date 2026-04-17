import { createSlice } from "@reduxjs/toolkit";
import { fetchSizes, getSizeById } from "./sizesThunk";

const initialState = {
  sizes: [],
  size: null,
  loading: false,
  error: null,
};

const sizesSlice = createSlice({
  name: "sizes",
  initialState,
  reducers: {
    clearSizes(state) {
      state.sizes = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.sizes = action.payload?.sizes || [];
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getSizeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSizeById.fulfilled, (state, action) => {
        state.loading = false;
        state.size = action.payload;
      })
      .addCase(getSizeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSizes } = sizesSlice.actions;
export default sizesSlice.reducer;
