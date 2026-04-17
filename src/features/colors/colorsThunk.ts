import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch colors
export const fetchColors = createAsyncThunk(
  "colors/fetchColors",
  async (params: { page?: number; limit?: number; search?: string; isDownload?: boolean; status?: "active" | "inactive" } = {}, { rejectWithValue }) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.colors.getAll, { params: { ...query, isDownload } });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch colors");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Get color by ID
export const getColorById = createAsyncThunk(
  "colors/getColorById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.colors.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Color not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Create color
export const createColor = createAsyncThunk(
  "colors/createColor",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.colors.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create color");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Update color
export const updateColor = createAsyncThunk(
  "colors/updateColor",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.colors.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update color");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update color status
export const updateColorStatus = createAsyncThunk(
  "colors/updateColorStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.colors.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);


// Delete color
export const deleteColor = createAsyncThunk(
  "colors/deleteColor",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.colors.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete color");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Bulk delete colors
export const bulkDeleteColors = createAsyncThunk(
  "colors/bulkDeleteColors",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.colors.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete colors");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
