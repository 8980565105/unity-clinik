//D:\mycara\admin-panal\src\features\categories\categoriesSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  updateCategoryStatus,
} from "./categoriesThunk";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parent_id?: string | { _id: string; name: string };
  image_url: string;
  status: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface CategoriesState {
  categories: Category[];
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

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.total = action.payload.total;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateCategory.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c._id === action.payload.id,
        );
        if (index !== -1) state.categories[index] = action.payload;
      })

      .addCase(updateCategoryStatus.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload,
        );
        state.total -= 1;
      })

      // Bulk delete
      .addCase(bulkDeleteCategories.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => !action.payload.includes(c._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default categoriesSlice.reducer;
