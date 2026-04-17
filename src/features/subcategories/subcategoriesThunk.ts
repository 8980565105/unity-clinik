//D:\mycara\admin-panal\src\features\categories\categoriesThunk.ts

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch categories with pagination and search
export const fetchsubCategories = createAsyncThunk(
  "subcategories/fetchsubCategories",
  async (
    params: { page?: number; limit?: number; search?: string; isDownload?: boolean,status?: "active" | "inactive"; } = {},
    { rejectWithValue }
  ) => {
    try {
      // Default isDownload to false
      const { isDownload = false, ...query } = params;

      const res = await api.get(ROUTES.subcategories.getAll, {
        params: { ...query, isDownload },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch categories");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Get category by ID
export const getsubCategoryById = createAsyncThunk(
  "subcategories/getsubCategoryById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.subcategories.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "subCategory not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Create category
export const createsubCategory = createAsyncThunk(
  "subcategories/createsubCategory",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.subcategories.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create subcategory");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);


export const updatesubCategory = createAsyncThunk(
  "subcategories/updatesubCategory",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
    const res = await api.put(ROUTES.subcategories.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update subcategory");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update category status
export const updatesubCategoryStatus = createAsyncThunk(
  "subcategories/updatesubCategoryStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.subcategories.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Delete category
export const deletesubCategory = createAsyncThunk(
  "subcategories/deletesubCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.subcategories.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete subcategory");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Bulk delete categories
export const bulkDeletesubCategories = createAsyncThunk(
  "subcategories/bulkDeletesubCategories",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.subcategories.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete subcategories");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

