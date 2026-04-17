import { createSlice } from "@reduxjs/toolkit";
import { fetchProductLabels, getProductLabelById } from "./productlabelsThunk";

const initialState = {
  productLabels: [],
  productLabel: null,
  loading: false,
  error: null,
};

const productLabelsSlice = createSlice({
  name: "productLabels",
  initialState,
  reducers: {
    clearProductLabels(state) {
      state.productLabels = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductLabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.productLabels = action.payload?.labels || [];
      })
      .addCase(fetchProductLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getProductLabelById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductLabelById.fulfilled, (state, action) => {
        state.loading = false;
        state.productLabel = action.payload; 
      })
      .addCase(getProductLabelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProductLabels } = productLabelsSlice.actions;
export default productLabelsSlice.reducer;
