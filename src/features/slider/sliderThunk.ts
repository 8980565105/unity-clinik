import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchSlides = createAsyncThunk(
  "slider/fetchSlides",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      status?: "active" | "inactive";
      section?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.slider.getAll, { params });
      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data.message || "Failed to fetch slides");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createSlide = createAsyncThunk(
  "slider/createSlide",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.slider.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create slide");
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || err.message || "Server Error",
      );
    }
  },
);

export const getSlideById = createAsyncThunk(
  "slider/getSlideById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.slider.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Slide not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateSlide = createAsyncThunk(
  "slider/updateSlide",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.slider.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update slide");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateSlideStatus = createAsyncThunk(
  "slider/updateSlideStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.slider.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteSlide = createAsyncThunk(
  "slider/deleteSlide",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.slider.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete slide");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteSlides = createAsyncThunk(
  "slider/bulkDeleteSlides",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.slider.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(
        res.data.message || "Failed to bulk delete slides",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
