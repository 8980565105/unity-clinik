import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  forgotPassword,
  resetPassword,
} from "./authThunk";

interface AuthState {
  user: {
    name: string;
    email: string;
    role: "admin" | "store_owner" | "store_user";
  } | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  otpLoading: boolean;
  otpSent: boolean;
  otpError: string | null;
  resetLoading: boolean;
  resetSuccess: boolean;
  resetError: string | null;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
  otpLoading: false,
  otpSent: false,
  otpError: null,
  resetLoading: false,
  resetSuccess: false,
  resetError: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearPasswordResetState: (state) => {
      state.otpLoading = false;
      state.otpSent = false;
      state.otpError = null;
      state.resetLoading = false;
      state.resetSuccess = false;
      state.resetError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          name: action.payload.user.name,
          email: action.payload.user.email,
          role: action.payload.user.role,
        };
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: action.payload.user.name,
            email: action.payload.user.email,
            role: action.payload.user.role,
          }),
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = {
          name: action.payload.user.name,
          email: action.payload.user.email,
          role: action.payload.user.role,
        };
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: action.payload.user.name,
            email: action.payload.user.email,
            role: action.payload.user.role,
          }),
        );
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(forgotPassword.pending, (state) => {
        state.otpLoading = true;
        state.otpSent = false;
        state.otpError = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.otpLoading = false;
        state.otpSent = true;
        state.otpError = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.otpLoading = false;
        state.otpSent = false;
        state.otpError = (action.payload as string) || "Failed to send OTP";
      });

    builder
      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetSuccess = false;
        state.resetError = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.resetLoading = false;
        state.resetSuccess = true;
        state.resetError = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetSuccess = false;
        state.resetError =
          (action.payload as string) || "Password reset failed";
      });
  },
});

export const { logout, clearPasswordResetState } = authSlice.actions;
export default authSlice.reducer;
