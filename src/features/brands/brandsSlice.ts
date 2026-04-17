import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  bulkDeleteBrands,
  updateBrandStatus,
} from "./brandsThunk";

interface Brand {
  _id: string;
  name: string;
  slug: string;
  image_url?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface BrandsState {
  brands: Brand[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: BrandsState = {
  brands: [],
  total: 0,
  loading: false,
  error: null,
};

const brandsSlice = createSlice({
  name: "brands",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.brands = action.payload.brands;
        state.total = action.payload.total;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createBrand.fulfilled, (state, action) => {
        state.brands.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateBrand.fulfilled, (state, action) => {
        const index = state.brands.findIndex(
          (b) => b._id === action.payload._id
        );
        if (index !== -1) state.brands[index] = action.payload;
      })

      .addCase(updateBrandStatus.fulfilled, (state, action) => {
        const index = state.brands.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.brands[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter((b) => b._id !== action.payload);
        state.total -= 1;
      })

      // Bulk delete
      .addCase(bulkDeleteBrands.fulfilled, (state, action) => {
        state.brands = state.brands.filter(
          (b) => !action.payload.includes(b._id)
        );
        state.total -= action.payload.length;
      });
  },
});

export default brandsSlice.reducer;
