import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchsubCategories = createAsyncThunk(
  "subcategories/fetchsubCategories",
  async (_params = {}, { rejectWithValue, getState }) => {
    const { subcategories } = getState();
    if (
      Array.isArray(subcategories.items) &&
      subcategories.items.length > 0 &&
      !subcategories.error
    ) {
      return { subcategories: subcategories.items };
    }

    try {
      const res = await api.get(ROUTES.subcategories.getAll);
      if (res.data.success) {
        return { subcategories: res.data.data };
      }
      return rejectWithValue(
        res.data.message || "Failed to fetch subcategories",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
