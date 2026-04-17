import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch brands
export const fetchBrands = createAsyncThunk(
  "brands/fetchBrands",
  async (
    params: { page?: number; limit?: number; search?: string; isDownload?: boolean,status?: "active" | "inactive"; } = {},
    { rejectWithValue }
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.brands.getAll, { params: { ...query, isDownload } });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch brands");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Get brand by ID
export const getBrandById = createAsyncThunk(
  "brands/getBrandById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.brands.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Brand not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Create brand
export const createBrand = createAsyncThunk(
  "brands/createBrand",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.brands.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create brand");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Update brand
export const updateBrand = createAsyncThunk(
  "brands/updateBrand",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.brands.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update brand");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update brand status
export const updateBrandStatus = createAsyncThunk(
  "brands/updateBrandStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.brands.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Delete brand
export const deleteBrand = createAsyncThunk(
  "brands/deleteBrand",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.brands.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete brand");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Bulk delete brands
export const bulkDeleteBrands = createAsyncThunk(
  "brands/bulkDeleteBrands",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.brands.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete brands");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
