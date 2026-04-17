
import { createSlice } from "@reduxjs/toolkit";
import { fetchProducts, fetchProductById } from "./productsThunk";

const initialState = {
  products: [],
  product: null,
  total: 0,
  page: 1,
  pages: 1,
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProducts(state) {
      state.products = [];
      state.total = 0;
      state.page = 1;
      state.pages = 1;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.products || [];
        state.total = action.payload?.total || 0;
        state.page = action.payload?.page || 1;
        state.pages = action.payload?.pages || 1;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.product = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
