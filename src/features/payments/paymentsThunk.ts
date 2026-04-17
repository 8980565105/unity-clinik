// store/payments/paymentsThunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch payments (with pagination/search)
export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "pending" | "completed" | "failed";
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.payments.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch payments");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Get payment by ID
export const getPaymentById = createAsyncThunk(
  "payments/getPaymentById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.payments.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Payment not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Delete payment
export const deletePayment = createAsyncThunk(
  "payments/deletePayment",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.payments.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete payment");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Bulk delete payments
export const bulkDeletePayments = createAsyncThunk(
  "payments/bulkDeletePayments",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.payments.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete payments");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
