import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch all paking
export const fetchpaking = createAsyncThunk(
  "packing/fetchpaking",
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.packing.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch packing");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// get paking by id
export const getpakingById = createAsyncThunk(
  "packing/getpakingById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.packing.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "paking not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

//create paking

export const createpaking = createAsyncThunk(
  "packing/createpaking",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.packing.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create paking");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

//update paking

export const updatepaking = createAsyncThunk(
  "paking/updatepaking",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.packing.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update paking");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

//delete paking
export const deletepaking = createAsyncThunk(
  "paking/deletepaking",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.packing.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete paking");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

//bulk delete paking
export const bulkDeletepaking = createAsyncThunk(
  "paking/bulkDeletepaking",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.packing.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete paking");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

//update status paking
export const updatepakingStatus = createAsyncThunk(
  "paking/updatepakingStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.packing.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
