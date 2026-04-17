import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch sizes
export const fetchSizes = createAsyncThunk(
  "sizes/fetchSizes",
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
      const res = await api.get(ROUTES.sizes.getAll, {
        params: { ...query, isDownload },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch sizes");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Get size by ID
export const getSizeById = createAsyncThunk(
  "sizes/getSizeById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.sizes.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Size not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Create size
export const createSize = createAsyncThunk(
  "sizes/createSize",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.sizes.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create size");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Update size
export const updateSize = createAsyncThunk(
  "sizes/updateSize",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.sizes.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update size");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Update sizes status
export const updateSizeStatus = createAsyncThunk(
  "sizes/updateSizeStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.sizes.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Delete size
export const deleteSize = createAsyncThunk(
  "sizes/deleteSize",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.sizes.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete size");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Bulk delete sizes
export const bulkDeleteSizes = createAsyncThunk(
  "sizes/bulkDeleteSizes",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.sizes.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete sizes");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
