import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";

export const fetchSystemSettings = createAsyncThunk(
  "systemsettings/fetchSystemSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/system-setting");
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch settings");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateSystemSetting = createAsyncThunk(
  "systemsettings/updateSystemSetting",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.put("/system-setting", data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update settings");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
