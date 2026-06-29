import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export const fetchFooter = createAsyncThunk(
  "footer/fetchFooter",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "active" | "inactive";
      isPublic?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { isDownload = false, isPublic = false, ...query } = params;

      const url = isPublic ? ROUTES.footer.public : ROUTES.footer.getAll;

      const res = await api.get(url, {
        params: { ...query, isDownload },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch footer items",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getFooterItemById = createAsyncThunk(
  "footer/getFooterItemById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.footer.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Footer item not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createFooterItem = createAsyncThunk(
  "footer/createFooterItem",
  async (
    data: { label: string; url: string; status?: string; storeId?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post(ROUTES.footer.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to create footer item",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateFooterItem = createAsyncThunk(
  "footer/updateFooterItem",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.footer.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to update footer item",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateFooterItemStatus = createAsyncThunk(
  "footer/updateFooterItemStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.footer.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteFooterItem = createAsyncThunk(
  "footer/deleteFooterItem",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.footer.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(
        res.data.message || "Failed to delete footer item",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteFooterItems = createAsyncThunk(
  "footer/bulkDeleteFooterItems",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.footer.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(
        res.data.message || "Failed to delete footer items",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
