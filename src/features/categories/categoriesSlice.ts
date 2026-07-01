import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  bulkDeleteCategories,
  updateCategoryStatus,
  reorderCategories,
} from "./categoriesThunk";

interface Category {
  _id: string;
  order: number;
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

      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.unshift(action.payload);
        state.total += 1;
      })

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

      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c._id !== action.payload,
        );
        state.total -= 1;
      })

      .addCase(bulkDeleteCategories.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (c) => !action.payload.includes(c._id),
        );
        state.total -= action.payload.length;
      })
      .addCase(reorderCategories.fulfilled, (state, action) => {
        action.payload.forEach((item) => {
          const cat = state.categories.find((c) => c._id === item._id);
          if (cat) cat.order = item.order;
        });
        state.categories.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      });
  },
});

export default categoriesSlice.reducer;
