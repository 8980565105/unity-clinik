import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch product labels
export const fetchProductLabels = createAsyncThunk(
  "productLabels/fetchProductLabels",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "active" | "inactive";
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.productLabels.getAll, {
        params: { ...query, isDownload },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch product labels",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Get label by ID
export const getProductLabelById = createAsyncThunk(
  "productLabels/getProductLabelById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.productLabels.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Product label not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Create label
export const createProductLabel = createAsyncThunk(
  "productLabels/createProductLabel",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.productLabels.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to create product label",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Update label
export const updateProductLabel = createAsyncThunk(
  "productLabels/updateProductLabel",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.productLabels.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to update product label",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Update label status
export const updateProductLabelStatus = createAsyncThunk(
  "productLabels/updateProductLabelStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.productLabels.updateStatus(id), {
        status,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Delete label
export const deleteProductLabel = createAsyncThunk(
  "productLabels/deleteProductLabel",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.productLabels.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(
        res.data.message || "Failed to delete product label",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Bulk delete labels
export const bulkDeleteProductLabels = createAsyncThunk(
  "productLabels/bulkDeleteProductLabels",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.productLabels.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(
        res.data.message || "Failed to delete product labels",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
