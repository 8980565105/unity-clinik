import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// Fetch Dashboard
export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.dashboard.getData);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch dashboard");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
