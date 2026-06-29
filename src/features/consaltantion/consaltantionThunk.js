import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchConsultationPage = createAsyncThunk(
  "consultationPage/fetchConsultationPage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ROUTES.consultationPage.getPublic);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message ||
          "Failed to fetch consultation page data",
      );
    }
  },
);
