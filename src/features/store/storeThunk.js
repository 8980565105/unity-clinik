import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchStoreInfo = createAsyncThunk(
  "store",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.store.getinfo);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch store info");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
  {
    condition: (_, { getState }) => {
      const { store } = getState();
      if (store.loadingInfo) return false;
      if (store.info) return false;
      return true;
    },
  },
);

