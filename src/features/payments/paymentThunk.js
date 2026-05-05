import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";
export const createRazorpayOrder = createAsyncThunk(
  "payments/createRazorpayOrder",
  async (data, { rejectWithValue }) => {
    try {
      // const res = await api.post("", data);
      const res = await api.post(ROUTES.payments.createOrder , data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

// 🔥 Verify Payment
export const verifyRazorpayPayment = createAsyncThunk(
  "payments/verifyRazorpayPayment",
  async (data, { rejectWithValue }) => {
    try {
      // const res = await api.post("/payment/verify", data);
      const res = await api.post(ROUTES.payments.verify, data);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const createPayment = createAsyncThunk(
  "payments/createPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const items = paymentData.items || [];
      const firstItem = items[0];
      const rawCreatedBy =
        firstItem?.product_id?.createdBy?._id ||
        firstItem?.product_id?.createdBy ||
        null;
      const store_owner_id = rawCreatedBy ? rawCreatedBy.toString() : null;
      const payload = {
        ...paymentData,
        store_owner_id,
        items: undefined,
      };
      Object.keys(payload).forEach(
        (k) => payload[k] === undefined && delete payload[k],
      );
      const res = await api.post(ROUTES.payments.getAll, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);
