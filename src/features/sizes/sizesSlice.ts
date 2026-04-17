import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSizes,
  createSize,
  updateSize,
  deleteSize,
  bulkDeleteSizes,
  updateSizeStatus,
} from "./sizesThunk";

interface Size {
  _id: string;
  name: string;
  measurement?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SizesState {
  sizes: Size[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: SizesState = {
  sizes: [],
  total: 0,
  loading: false,
  error: null,
};

const sizesSlice = createSlice({
  name: "sizes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchSizes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSizes.fulfilled, (state, action) => {
        state.loading = false;
        state.sizes = action.payload.sizes;
        state.total = action.payload.total;
      })
      .addCase(fetchSizes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create
      .addCase(createSize.fulfilled, (state, action) => {
        state.sizes.unshift(action.payload);
        state.total += 1;
      })
      // Update
      .addCase(updateSize.fulfilled, (state, action) => {
        const index = state.sizes.findIndex(
          (s) => s._id === action.payload._id
        );
        if (index !== -1) state.sizes[index] = action.payload;
      })

      .addCase(updateSizeStatus.fulfilled, (state, action) => {
        const index = state.sizes.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.sizes[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteSize.fulfilled, (state, action) => {
        state.sizes = state.sizes.filter((s) => s._id !== action.payload);
        state.total -= 1;
      })
      // Bulk delete
      .addCase(bulkDeleteSizes.fulfilled, (state, action) => {
        state.sizes = state.sizes.filter(
          (s) => !action.payload.includes(s._id)
        );
        state.total -= action.payload.length;
      });
  },
});

export default sizesSlice.reducer;
