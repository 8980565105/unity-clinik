import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.settings.get);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch settings");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.settings.update, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update settings");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
