
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchProductLabels = createAsyncThunk(
  "productLabels/fetchProductLabels",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { productLabels } = getState();
      if (
        Array.isArray(productLabels.productLabels) &&
        productLabels.productLabels.length > 0 &&
        !productLabels.error
      ) {
        return {
          labels: productLabels.productLabels,
          total: productLabels.productLabels.length,
        };
      }
    }

    try {
      const queryParams = {
        page: 1,
        limit: 0,
        status: "active",
        ...params,
      };

      const res = await api.get(ROUTES.productLabels.getPublic, {
        params: queryParams,
      });

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          return { labels: data, total: data.length };
        }

        return { labels: data.labels || [], total: data.total || 0 };
      }

      return rejectWithValue(
        res.data.message || "Failed to fetch product labels",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getProductLabelById = createAsyncThunk(
  "productLabels/getProductLabelById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.productLabels.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch product label",
      );
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch product label",
      );
    }
  },
);