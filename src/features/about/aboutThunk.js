import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchabout = createAsyncThunk(
  "about/fetchabout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.aboutpage.get);

      if (res.data.success) {
        return res.data.data;
      }

      return rejectWithValue(res.data.message);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch about page"
      );
    }
  }
);