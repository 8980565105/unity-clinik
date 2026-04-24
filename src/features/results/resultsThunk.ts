import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";
export const fetchResults = createAsyncThunk(
  "results/fetchResults",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "active" | "inactive";
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.results.getAll, {
        params: { ...query, isDownload },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch results");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
export const getResultsById = createAsyncThunk(
  "results/getResultsById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.results.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Result not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
export const createResults = createAsyncThunk(
  "results/createResults",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.results.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create result");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
export const updateResults = createAsyncThunk(
  "results/updateResults",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.results.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update result");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
export const updateResultsStatus = createAsyncThunk(
  "results/updateResultsStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(ROUTES.results.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
export const deleteResults = createAsyncThunk(
  "results/deleteResults",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.results.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete result");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
export const bulkDeleteResults = createAsyncThunk(
  "results/bulkDeleteResults",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.results.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to bulk delete");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);