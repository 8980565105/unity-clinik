import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchOffers = createAsyncThunk(
  "offer/fetchOffers",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { offer } = getState();
      if (offer && offer.items && offer.items.length > 0) {
        return offer.items;
      }
    }

    try {
      const response = await api.get(ROUTES.offers.getAll, { params });
      const data = response.data;

      if (data?.success && Array.isArray(data.data?.offers)) {
        return data.data.offers;
      }
      if (data?.success && Array.isArray(data.data)) {
        return data.data;
      }
      if (Array.isArray(data)) {
        return data;
      }

      return rejectWithValue("Unexpected response format");
    } catch (error) {
      return rejectWithValue(error.response?.data || "Something went wrong");
    }
  },
);
