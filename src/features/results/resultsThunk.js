import { createAsyncThunk } from "@reduxjs/toolkit";
import { ROUTES } from "../../services/routes";
import api from "../../services/api";
export const fetchResults = createAsyncThunk(
  "results/fetchResults",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = { page: 1, limit: 100, status: "active", ...params };
      const res = await api.get(ROUTES.results.getPublic, {
        params: queryParams,
      });

      if (res.data.success) {
        const data = res.data.data;
        if (Array.isArray(data)) {
          return { results: data, total: data.length };
        }
        return { results: data.results || [], total: data.total || 0 };
      }
      return rejectWithValue(res.data.message || "Failed to fetch results");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
