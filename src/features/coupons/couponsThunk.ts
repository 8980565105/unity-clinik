import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// ✅ Fetch coupons
export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async (
    params: { page?: number; limit?: number; search?: string; status?: "active" | "inactive"; isDownload?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(ROUTES.coupons.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch coupons");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Get coupon by ID
export const getCouponById = createAsyncThunk(
  "coupons/getCouponById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.coupons.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Coupon not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Create coupon
export const createCoupon = createAsyncThunk(
  "coupons/createCoupon",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.coupons.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create coupon");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update coupon
export const updateCoupon = createAsyncThunk(
  "coupons/updateCoupon",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.coupons.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update coupon");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update coupon status
export const updateCouponStatus = createAsyncThunk(
  "coupons/updateCouponStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.coupons.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Delete coupon
export const deleteCoupon = createAsyncThunk(
  "coupons/deleteCoupon",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.coupons.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete coupon");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Bulk delete coupons
export const bulkDeleteCoupons = createAsyncThunk(
  "coupons/bulkDeleteCoupons",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.coupons.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete coupons");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
