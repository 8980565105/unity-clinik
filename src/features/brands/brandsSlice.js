import { createSlice } from "@reduxjs/toolkit";
import { fetchBrands } from "./brandsThunk";

const initialState = {
  brands: [],
  loading: false,
  error: null,
};

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {
    clearBrands(state) {
      state.brands = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.brands || [];
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearBrands } = brandsSlice.actions;
export default brandsSlice.reducer;
