import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export const fetchNavbar = createAsyncThunk(
  "navbar/fetchNavbar",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: "active" | "inactive";
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.navbar.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch navbar items",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getNavbarItemById = createAsyncThunk(
  "navbar/getNavbarItemById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.navbar.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Navbar item not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createNavbarItem = createAsyncThunk(
  "navbar/createNavbarItem",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.navbar.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to create navbar item",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateNavbarItem = createAsyncThunk(
  "navbar/updateNavbarItem",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.navbar.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to update navbar item",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateNavbarItemStatus = createAsyncThunk(
  "navbar/updateNavbarItemStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.navbar.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteNavbarItem = createAsyncThunk(
  "navbar/deleteNavbarItem",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.navbar.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(
        res.data.message || "Failed to delete navbar item",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteNavbarItems = createAsyncThunk(
  "navbar/bulkDeleteNavbarItems",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.navbar.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(
        res.data.message || "Failed to delete navbar items",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
