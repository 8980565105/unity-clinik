import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

interface FetchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export const fetchBookings = createAsyncThunk(
  "bookconsaltans/fetchAll",
  async (
    { page = 1, limit = 10, search = "", status }: FetchParams,
    { rejectWithValue },
  ) => {
    try {
      const params: any = { page, limit, search };
      if (status) params.status = status;
      const res = await api.get(ROUTES.bookconsaltans.getAll, { params });
      return res.data.data; // { bookings, total }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const deleteBooking = createAsyncThunk(
  "bookconsaltans/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(ROUTES.bookconsaltans.getById(id));
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const bulkDeleteBookings = createAsyncThunk(
  "bookconsaltans/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.bookconsaltans.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete bookings");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete bookings",
      );
    }
  },
);

export const fetchBookingById = createAsyncThunk(
  "bookconsaltans/fetchOne",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.bookconsaltans.getById(id));
      return res.data.data; // single booking object
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateBooking = createAsyncThunk(
  "bookconsaltans/update",
  async (
    { id, data }: { id: string; data: Record<string, any> },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.patch(ROUTES.bookconsaltans.getById(id), data);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);
