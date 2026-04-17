import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.auth.login, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Invalid credentials");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data: any, { rejectWithValue }) => {
    try {
      const isStoreOwner = data.role === "store_owner" || data.storeName;
      const url = isStoreOwner
        ? ROUTES.auth.registerStoreOwner
        : ROUTES.auth.register;

      const res = await api.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Registration failed");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const forgotPassword = createAsyncThunk<
  { success: boolean; message: string },
  { email: string },
  { rejectValue: string }
>("auth/forgotPassword", async ({ email }, { rejectWithValue }) => {
  try {
    const res = await api.post(ROUTES.auth.forgotPassword, { email });
    return res.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to send OTP.",
    );
  }
});

export const resetPassword = createAsyncThunk<
  { success: boolean; message: string },
  { email: string; otp: string; newPassword: string },
  { rejectValue: string }
>(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.auth.resetPassword, {
        email,
        otp,
        newPassword,
      });
      return res.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed.",
      );
    }
  },
);
