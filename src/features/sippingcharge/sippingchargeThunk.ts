  import { createAsyncThunk } from "@reduxjs/toolkit";
  import api from "@/services/api";
  import { ROUTES } from "@/services/routes";

  export const fetchShippingCharge = createAsyncThunk(
    "sippingcharge/fetchShippingCharge",
    async (_, { rejectWithValue }) => {
      try {
        const res = await api.get(ROUTES.sippingcharge.get);
        if (res.data.success) return res.data.data;
        return rejectWithValue(
          res.data.message || "Failed to fetch shipping charge",
        );
      } catch (err: any) {
        return rejectWithValue(err.response?.data?.message || "Server Error");
      }
    },
  );

  export const saveShippingCharge = createAsyncThunk(
    "sippingcharge/saveShippingCharge",
    async (data: any, { rejectWithValue }) => {
      try {
        const res = await api.post(ROUTES.sippingcharge.update, data);
        if (res.data.success) return res.data.data;
        return rejectWithValue(
          res.data.message || "Failed to update shipping charge",
        );
      } catch (err: any) {
        return rejectWithValue(err.response?.data || "Server Error");
      }
    },
  );
