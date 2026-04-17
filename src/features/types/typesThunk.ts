import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch types
export const fetchTypes = createAsyncThunk(
  "types/fetchTypes",
  async (params: { page?: number; limit?: number; search?: string; isDownload?: boolean,status?: "active" | "inactive"; } = {}, { rejectWithValue }) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.types.getAll, { params: { ...query, isDownload } });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch types");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Get type by ID
export const getTypeById = createAsyncThunk(
  "types/getTypeById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.types.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Type not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Create type
export const createType = createAsyncThunk(
  "types/createType",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.types.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create type");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Update type
export const updateType = createAsyncThunk(
  "types/updateType",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.types.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update type");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update type status
export const updateTypeStatus = createAsyncThunk(
  "types/updateTypeStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.types.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Delete type
export const deleteType = createAsyncThunk(
  "types/deleteType",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.types.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete type");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Bulk delete types
export const bulkDeleteTypes = createAsyncThunk(
  "types/bulkDeleteTypes",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.types.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete types");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
