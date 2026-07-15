import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const createRazorpayOrder = createAsyncThunk(
  "payments/createRazorpayOrder",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.payments.createOrder, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const verifyRazorpayPayment = createAsyncThunk(
  "payments/verifyRazorpayPayment",
  async (data, { rejectWithValue }) => {
    try {
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


export const createPhonePeOrder = createAsyncThunk(
  "payments/createPhonePeOrder",
  async ({ amount, order_id, user_id, redirect_url }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.payments.createPhonePeOrder, {
        amount,
        order_id,
        user_id,
        redirect_url,
      });

      // ⬅️ NEW
      if (!res.data.success) {
        return rejectWithValue(res.data.message || "PhonePe order failed");
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const verifyPhonePePayment = createAsyncThunk(
  "payments/verifyPhonePePayment",
  async ({ merchantTransactionId, order_id }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.payments.verifyPhonePePayment, {
        merchantTransactionId,
        order_id,
      });

      if (!res.data.success) {
        return rejectWithValue(
          res.data.message || "Payment verification failed",
        );
      }

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const createConsultationBooking = createAsyncThunk(
  "payments/createConsultationBooking",
  async (bookingData, { rejectWithValue }) => {
    try {
      const res = await api.post("/bookconsaltans", bookingData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateBookingSlot = createAsyncThunk(
  "payments/updateBookingSlot",
  async (
    { booking_id, slot_date, slot_time, slot_duration },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.patch(`/bookconsaltans/${booking_id}/slot`, {
        slot_date,
        slot_time,
        slot_duration,
      });
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to save slot",
      );
    }
  },
);

export const fetchBookedSlots = createAsyncThunk(
  "payments/fetchBookedSlots",
  async ({ date, type }, { rejectWithValue }) => {
    try {
      const res = await api.get(`/bookconsaltans/slots`, {
        params: { date, type },
      });
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch booked slots",
      );
    }
  },
);

export const fetchMyBookings = createAsyncThunk(
  "payments/fetchMyBookings",
  async ({ user_id, phone } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get("/bookconsaltans/my-bookings", {
        params: { user_id, phone },
      });
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch bookings",
      );
    }
  },
);

export const markPaymentFailed = createAsyncThunk(
  "payments/markPaymentFailed",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post("/payments/mark-failed", data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);
