import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";
export const fetchWarehouse = createAsyncThunk(
  "warehouse/fetchWarehouse",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: "active" | "inactive";
      isDownload?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.warehouse.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch warehouse");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Get warehouse by ID

export const getWarehouseById = createAsyncThunk(
  "warehouse/getWarehouseById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.warehouse.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Warehouse not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Create warehouse
export const createWarehouse = createAsyncThunk(
  "warehouse/createWarehouse",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.warehouse.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create warehouse");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Update warehouse
export const updateWarehouse = createAsyncThunk(
  "warehouse/updateWarehouse",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.warehouse.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update warehouse");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// update warehouse status

export const updatewarehouseStatus = createAsyncThunk(
  "warehouse/updatewarehouseStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.warehouse.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Delete warehouse
export const deleteWarehouse = createAsyncThunk(
  "warehouse/deleteWarehouse",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.warehouse.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete warehouse");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Bulk delete warehouse

export const bulkDeleteWarehouse = createAsyncThunk(
  "warehouse/bulkDeleteWarehouse",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.warehouse.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete warehouse");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
