

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchPages = createAsyncThunk(
  "pages/fetchPages",
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = { status: "active", ...params };
      const res = await api.get(ROUTES.pages.getAll, { params: queryParams });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch pages");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
  {
    condition: (params = {}, { getState }) => {
      if (params && Object.keys(params).length > 0) return true;
      const { pages } = getState();
      if (pages.loading) return false;
      if (Array.isArray(pages.pages) && pages.pages.length > 0) return false;
      return true;
    },
  },
);


export const fetchPageBySlug = createAsyncThunk(
  "pages/fetchPageBySlug",
  async (slug, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.pages.getBySlug(slug));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Page not found");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);