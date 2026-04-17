import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchFaqs = createAsyncThunk(
  "faqs/fetchFaqs",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.faqs.getPublic, {
        params: { status: "active", ...params },
      });

      if (res.data.success) {
        const data = res.data.data;
        if (Array.isArray(data)) {
          return { faqs: data, total: data.length };
        }
        return { faqs: data.faqs || [], total: data.total || 0 };
      }

      return rejectWithValue(res.data.message || "Failed to fetch FAQs");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getFaqsById = createAsyncThunk(
  "faqs/getFaqsById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.faqs.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch FAQ");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getFaqBanner = createAsyncThunk(
  "faqs/getBanner",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.faqs.getBanner);
      if (res.data.success) return res.data.data;
      return rejectWithValue("Failed to fetch banner");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
