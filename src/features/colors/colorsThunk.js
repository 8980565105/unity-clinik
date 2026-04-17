
import { createAsyncThunk } from "@reduxjs/toolkit";
import { ROUTES } from "../../services/routes";
import api from "../../services/api";

export const fetchColors = createAsyncThunk(
  "colors/fetchColors",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { colors } = getState();
      if (Array.isArray(colors.colors) && colors.colors.length > 0 && !colors.error) {
        return { colors: colors.colors, total: colors.colors.length };
      }
    }

    try {
      const queryParams = { page: 1, limit: 0, status: "active", ...params };
      const res = await api.get(ROUTES.colors.getPublic, { params: queryParams });

      if (res.data.success) {
        const data = res.data.data;
        if (Array.isArray(data)) {
          return { colors: data, total: data.length };
        }
        return { colors: data.colors || [], total: data.total || 0 };
      }

      return rejectWithValue(res.data.message || "Failed to fetch colors");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const fetchColorById = createAsyncThunk(
  "colors/fetchColorById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.colors.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch color");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch color");
    }
  },
);