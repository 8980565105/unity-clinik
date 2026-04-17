import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch fabrics
export const fetchFabrics = createAsyncThunk(
  "fabrics/fetchFabrics",
  async (
    params: { page?: number; limit?: number; search?: string; isDownload?: boolean,status?: "active" | "inactive"; } = {},
    { rejectWithValue }
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.fabrics.getAll, { params: { ...query, isDownload } });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch fabrics");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Get fabric by ID
export const getFabricById = createAsyncThunk(
  "fabrics/getFabricById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.fabrics.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Fabric not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Create fabric
export const createFabric = createAsyncThunk(
  "fabrics/createFabric",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.fabrics.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create fabric");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Update fabric
export const updateFabric = createAsyncThunk(
  "fabrics/updateFabric",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.fabrics.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update fabric");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);


// ✅ Update fabric status
export const updateFabricStatus = createAsyncThunk(
  "fabrics/updateFabricStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.fabrics.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);


// Delete fabric
export const deleteFabric = createAsyncThunk(
  "fabrics/deleteFabric",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.fabrics.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete fabric");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Bulk delete fabrics
export const bulkDeleteFabrics = createAsyncThunk(
  "fabrics/bulkDeleteFabrics",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.fabrics.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete fabrics");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
