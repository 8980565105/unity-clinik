import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchShippingCharge = createAsyncThunk(
  "sippingcharge/fetchShippingCharge",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.sippingcharge.getPublic);
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch shipping charge",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
