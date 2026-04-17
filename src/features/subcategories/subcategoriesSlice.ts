import { createSlice } from "@reduxjs/toolkit";
import {
  fetchsubCategories,
  createsubCategory,
  updatesubCategory,
  deletesubCategory,
  bulkDeletesubCategories,
  updatesubCategoryStatus,
} from "./subcategoriesThunk";

interface subCategory {
  _id: string;
  name: string;
  slug: string;
  parent_id?: string | { _id: string; name: string };
  image_url: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesState {
  categories: subCategory[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  total: 0,
  loading: false,
  error: null,
};

const subcategoriesSlice = createSlice({
  name: "subcategories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchsubCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchsubCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.total = action.payload.total;
      })
      .addCase(fetchsubCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createsubCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updatesubCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c._id === action.payload.id,
        );
        if (index !== -1) state.categories[index] = action.payload;
      })

      .addCase(updatesubCategoryStatus.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })

      // Delete
      .addCase(deletesubCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload,
        );
        state.total -= 1;
      })

      // Bulk delete
      .addCase(bulkDeletesubCategories.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => !action.payload.includes(c._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default subcategoriesSlice.reducer;
