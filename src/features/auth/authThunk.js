import { createAsyncThunk } from "@reduxjs/toolkit";
import { ROUTES } from "../../services/routes";
import api from "../../services/api";

const getCurrentDomain = () => {
  if (typeof window === "undefined") return "";
  return window.location.host;
};

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.auth.login, userData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (formData, { rejectWithValue }) => {
    try {
      const isFormData = formData instanceof FormData;
      const response = await api.post(ROUTES.auth.register, formData, {
        headers: {
          "Content-Type": isFormData
            ? "multipart/form-data"
            : "application/json",
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.response?.data ||
          "Registration failed",
      );
    }
  },
);

export const fetchOwnProfile = createAsyncThunk(
  "auth/fetchOwnProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.user.updateOneProfile);
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile",
      );
    }
  },
);

export const updateOwnProfile = createAsyncThunk(
  "auth/updateOwnProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.put(ROUTES.user.updateOneProfile, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed",
      );
    }
  },
);


export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const domain = getCurrentDomain();
      console.log("[forgotPassword] sending domain:", domain);
      const res = await api.post(ROUTES.auth.forgotPassword, { email, domain });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Failed to send OTP. Please try again.",
      );
    }
  },
);
 
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ email, otp, newPassword }, { rejectWithValue }) => {
    try {
      const domain = getCurrentDomain();
      console.log("[resetPassword] sending domain:", domain);
      const res = await api.post(ROUTES.auth.resetPassword, {
        email,
        otp,
        newPassword,
        domain,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Password reset failed. Please try again.",
      );
    }
  },
);