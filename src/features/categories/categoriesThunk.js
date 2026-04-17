import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
  async (_params = {}, { rejectWithValue, getState }) => {
    const { categories } = getState();
    if (
      Array.isArray(categories.items) &&
      categories.items.length > 0 &&
      !categories.error
    ) {
      return { categories: categories.items };
    }

    try {
      const res = await api.get(ROUTES.categories.getAll);
      if (res.data.success) {
        return { categories: res.data.data };
      }
      return rejectWithValue(res.data.message || "Failed to fetch categories");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
