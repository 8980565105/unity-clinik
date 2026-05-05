import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchSystemSettings = createAsyncThunk(
  "systemsettings/fetchSystemSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/system-setting/public");
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch settings");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
