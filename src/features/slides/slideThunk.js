import { createAsyncThunk } from "@reduxjs/toolkit";
import { ROUTES } from "../../services/routes";
import api from "../../services/api";

export const fetchSlides = createAsyncThunk(
  "slides/fetchSlides",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.slide.getPublic, {
        params: { status: "active", ...params },
      });
      if (res.data.success) {
        const data = res.data.data;
        const slides = Array.isArray(data) ? data : data.slides || [];
        return { slides, total: slides.length };
      }
      return rejectWithValue(res.data.message || "Failed to fetch slides");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
