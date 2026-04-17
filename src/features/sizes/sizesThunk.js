import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchSizes = createAsyncThunk(
  "sizes/fetchSizes",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { sizes } = getState();
      if (
        Array.isArray(sizes.sizes) &&
        sizes.sizes.length > 0 &&
        !sizes.error
      ) {
        return { sizes: sizes.sizes, total: sizes.sizes.length };
      }
    }

    try {
      const queryParams = {
        page: 1,
        limit: 0,
        status: "active",
        ...params,
      };

      const res = await api.get(ROUTES.sizes.getPublic, { params: queryParams });

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          return { sizes: data, total: data.length };
        }

        return { sizes: data.sizes || [], total: data.total || 0 };
      }

      return rejectWithValue(res.data.message || "Failed to fetch sizes");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getSizeById = createAsyncThunk(
  "sizes/getSizeById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.sizes.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch size");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch size",
      );
    }
  },
);