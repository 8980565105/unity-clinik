import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";
export const fetchFabrics = createAsyncThunk(
  "fabrics/fetchFabrics",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { fabrics } = getState();
      if (
        Array.isArray(fabrics.fabrics) &&
        fabrics.fabrics.length > 0 &&
        !fabrics.error
      ) {
        return { fabrics: fabrics.fabrics, total: fabrics.fabrics.length };
      }
    }
    try {
      const queryParams = {
        page: 1,
        limit: 0,
        status: "active",
        ...params,
      };
      const res = await api.get(ROUTES.fabrics.getPublic, { params: queryParams });
      if (res.data.success) {
        const data = res.data.data;
        if (Array.isArray(data)) {
          return { fabrics: data, total: data.length };
        }
        return { fabrics: data.fabrics || [], total: data.total || 0 };
      }
      return rejectWithValue(res.data.message || "Failed to fetch fabrics");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getFabricById = createAsyncThunk(
  "fabrics/getFabricById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.fabrics.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch fabric");
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch fabric",
      );
    }
  },
);