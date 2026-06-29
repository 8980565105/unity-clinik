import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export const fetchConsultationPage = createAsyncThunk(
  "consultationpage/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.consultationpage.get);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(err?.response?.data?.message || "Failed to fetch");
    }
  },
);

export const updateConsultationPage = createAsyncThunk(
  "consultationpage/update",
  async (payload: any, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.consultationpage.update, payload);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to update",
      );
    }
  },
);
