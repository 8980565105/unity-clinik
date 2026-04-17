import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

const BASE_URL = (
  process.env.REACT_APP_API_URL_IMAGE || "http://localhost:5000"
).replace(/\/$/, "");

export const toFullImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith("http")) return filename;
  return `${BASE_URL}/uploads/${filename}`;
};

export const uploadProfilePicture = createAsyncThunk(
  "user/uploadProfilePicture",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);

      const res = await api.put(ROUTES.user.updateOneProfile, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data?.data?.user;
      if (!updatedUser) {
        return rejectWithValue("Upload failed: No user data returned");
      }

      return {
        ...updatedUser,
        profile_picture: toFullImageUrl(updatedUser.profile_picture),
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Upload failed",
      );
    }
  },
);
