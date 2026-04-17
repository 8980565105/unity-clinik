import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

// ✅ Fetch logged-in user info (/me)
export const fetchMe = createAsyncThunk(
  "profile/fetchMe",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.profile.get);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch user info");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ✅ Update profile (/me)
export const updateMe = createAsyncThunk(
  "profile/updateMe",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.profile.update, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update profile");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
