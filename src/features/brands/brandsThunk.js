
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { brands } = getState();
      if (
        Array.isArray(brands.brands) &&
        brands.brands.length > 0 &&
        !brands.error
      ) {
        return { brands: brands.brands };
      }
    }

    try {
      const queryParams = { page: 1, limit: 0, status: "active", ...params };
      const res = await api.get(ROUTES.brands.getPublic, {
        params: queryParams,
      });

      if (res.data.success) {
        return { brands: res.data.data || [] };
      }

      return rejectWithValue(res.data.message || "Failed to fetch brands");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
