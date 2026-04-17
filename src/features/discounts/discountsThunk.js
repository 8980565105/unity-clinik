import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchDiscounts = createAsyncThunk(
  "discounts/fetchDiscounts",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { discounts } = getState();
      if (
        Array.isArray(discounts.discounts) &&
        discounts.discounts.length > 0 &&
        !discounts.error
      ) {
        return { discounts: discounts.discounts, total: discounts.discounts.length };
      }
    }
    try {
      const queryParams = {
        page: 1,
        limit: 0,
        status: "active",
        ...params,
      };

      const res = await api.get(ROUTES.discounts.getPublic, {
        params: queryParams,
      });

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          return { discounts: data, total: data.length };
        }
        return { discounts: data.discounts || [], total: data.total || 0 };
      }
      return rejectWithValue(res.data.message || "Failed to fetch discounts");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getDiscountById = createAsyncThunk(
  "discounts/getDiscountById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.discounts.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch discount");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch discount",
      );
    }
  },
);