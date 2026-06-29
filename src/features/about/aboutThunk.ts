import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export const fetchAboutPage = createAsyncThunk(
  "aboutpage/fetchAboutPage",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/aboutpage");

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

export const updateAboutPage = createAsyncThunk(
  "aboutpage/updateAboutPage",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await api.put("/aboutpage", payload);

      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);
