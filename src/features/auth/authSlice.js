import { createSlice } from "@reduxjs/toolkit";
import {
  loginUser,
  registerUser,
  fetchOwnProfile,
  updateOwnProfile,
  forgotPassword,
  resetPassword,
} from "./authThunk";
import { uploadProfilePicture, toFullImageUrl } from "../user/userThunk";

function safeParse(item) {
  try {
    const data = localStorage.getItem(item);
    return data && data !== "undefined" ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function normalizeUser(user) {
  if (!user) return null;
  return { ...user, profile_picture: toFullImageUrl(user.profile_picture) };
}

const initialState = {
  user: normalizeUser(safeParse("user")),
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
      localStorage.removeItem("cart_id");
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
      // ── Login ────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const { token, user } = action.payload.data || {};
        if (token && user) {
          const normalized = normalizeUser(user);
          state.token = token;
          state.user = normalized;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Login failed";
      })

      // ── Register ─────────────────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        const { token, user } = action.payload.data || {};
        if (token && user) {
          const normalized = normalizeUser(user);
          state.token = token;
          state.user = normalized;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Registration failed";
      })

      // ── Fetch Profile ─────────────────────────────────────────────────
      .addCase(fetchOwnProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOwnProfile.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload?.data?.user;
        if (user) {
          const normalized = normalizeUser(user);
          state.user = normalized;
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      })
      .addCase(fetchOwnProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch profile";
      })

      // ── Update Profile ────────────────────────────────────────────────
      .addCase(updateOwnProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOwnProfile.fulfilled, (state, action) => {
        state.loading = false;
        const user = action.payload?.data?.user;
        if (user) {
          const normalized = normalizeUser(user);
          state.user = normalized;
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      })
      .addCase(updateOwnProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Profile update failed";
      })

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
        state.otpError = action.payload || "Failed to send OTP";
      })

      // ── Reset Password ────────────────────────────────────────────────
      .addCase(resetPassword.pending, (state) => {
        state.resetLoading = true;
        state.resetSuccess = false;
        state.resetError = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.resetLoading = false;
        state.resetSuccess = true;
        state.resetError = null;

        // ✅ CRITICAL: Store token and user after password reset
        console.log(
          "✅ Reset Password Success - Full Payload:",
          action.payload,
        );

        const { token, user } = action.payload?.data || {};

        console.log("✅ Extracted Token:", token);
        console.log("✅ Extracted User:", user);

        if (token && user) {
          const normalized = normalizeUser(user);
          state.token = token;
          state.user = normalized;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(normalized));
          console.log("✅ Token and user saved to state and localStorage");
        } else {
          console.error("❌ Token or user missing in reset password response!");
          console.log("Response data:", action.payload?.data);
        }
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.resetLoading = false;
        state.resetSuccess = false;
        state.resetError = action.payload || "Password reset failed";
        console.error("❌ Reset Password Failed:", action.payload);
      })

      // ── Upload Profile Picture ────────────────────────────────────────
      .addCase(uploadProfilePicture.fulfilled, (state, action) => {
        if (state.user && action.payload?.profile_picture) {
          state.user = {
            ...state.user,
            profile_picture: action.payload.profile_picture,
          };
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      });
  },
});

export const { logout, clearPasswordResetState } = authSlice.actions;
export default authSlice.reducer;
