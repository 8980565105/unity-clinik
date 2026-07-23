import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchReferralSettings = createAsyncThunk(
  "reffrel/fetchReferralSettings",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.reffrel.getSettings);
      if (!res.data.success) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch referral settings"
      );
    }
  }
);