import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";


export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.settings.get);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch settings");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Public (no auth) — Footer mate
export const fetchPublicSettings = createAsyncThunk(
  "settings/fetchPublicSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.settings.public); 
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch settings");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateSettings = createAsyncThunk(
  "settings/updateSettings",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.settings.update, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update settings");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
