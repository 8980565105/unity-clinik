import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch discounts
export const fetchDiscounts = createAsyncThunk(
  "discounts/fetchDiscounts",
  async (
    params: { page?: number; limit?: number; search?: string; status?: "active" | "inactive"; isDownload?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(ROUTES.discounts.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch discounts");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Get discount by ID
export const getDiscountById = createAsyncThunk(
  "discounts/getDiscountById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.discounts.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Discount not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Create discount
export const createDiscount = createAsyncThunk(
  "discounts/createDiscount",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.discounts.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create discount");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Update discount
export const updateDiscount = createAsyncThunk(
  "discounts/updateDiscount",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.discounts.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update discount");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update discount status
export const updateDiscountStatus = createAsyncThunk(
  "discounts/updateDiscountStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.discounts.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Delete discount
export const deleteDiscount = createAsyncThunk(
  "discounts/deleteDiscount",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.discounts.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete discount");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// Bulk delete discounts
export const bulkDeleteDiscounts = createAsyncThunk(
  "discounts/bulkDeleteDiscounts",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.discounts.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete discounts");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
