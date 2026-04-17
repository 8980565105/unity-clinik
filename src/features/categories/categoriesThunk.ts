//D:\mycara\admin-panal\src\features\categories\categoriesThunk.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch categories with pagination and search
export const fetchCategories = createAsyncThunk(
  "categories/fetchCategories",
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
      // Default isDownload to false
      const { isDownload = false, ...query } = params;

      const res = await api.get(ROUTES.categories.getAll, {
        params: { ...query, isDownload },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch categories");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Get category by ID
export const getCategoryById = createAsyncThunk(
  "categories/getCategoryById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.categories.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Category not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Create category
export const createCategory = createAsyncThunk(
  "categories/createCategory",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.categories.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create category");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Update category
export const updateCategory = createAsyncThunk(
  "categories/updateCategory",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.categories.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update category");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Update category status
export const updateCategoryStatus = createAsyncThunk(
  "categories/updateCategoryStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.categories.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Delete category
export const deleteCategory = createAsyncThunk(
  "categories/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.categories.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete category");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Bulk delete categories
export const bulkDeleteCategories = createAsyncThunk(
  "categories/bulkDeleteCategories",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.categories.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete categories");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
