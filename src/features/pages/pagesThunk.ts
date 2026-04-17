import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// ✅ Fetch all pages
export const fetchPages = createAsyncThunk(
  "pages/fetchPages",
  async (
    params: { page?: number; limit?: number; search?: string; status?: "active" | "inactive"; isDownload?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(ROUTES.pages.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch pages");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Get page by ID
export const getPageById = createAsyncThunk(
  "pages/getPageById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.pages.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Page not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Create page
export const createPage = createAsyncThunk(
  "pages/createPage",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.pages.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create page");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update page
export const updatePage = createAsyncThunk(
  "pages/updatePage",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.pages.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update page");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update page status
export const updatePageStatus = createAsyncThunk(
  "pages/updatePageStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive"}, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.pages.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Delete page
export const deletePage = createAsyncThunk(
  "pages/deletePage",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.pages.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete page");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Bulk delete pages
export const bulkDeletePages = createAsyncThunk(
  "pages/bulkDeletePages",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.pages.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete pages");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
