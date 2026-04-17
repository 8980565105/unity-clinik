
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (orderData, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.orders.getAll, orderData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchOrder = createAsyncThunk(
  "orders/fetchOrder",
  async (orderId, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.orders.getById(orderId));
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchUserOrders = createAsyncThunk(
  "orders/fetchUserOrders",
  async ({ page = 1, limit = 5, search = "" } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.orders.getPublic, {
        params: { page, limit, search },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch orders");
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: err.message });
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (
    { orderId, reason = "Cancelled by customer" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(`${ROUTES.orders.getAll}/${orderId}/cancel`, {
        reason,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to cancel order");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);