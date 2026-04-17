import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchMyAddress = createAsyncThunk(
  "address/fetchMyAddress",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.user.updateOneProfile);
      return res.data.data.user.address;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch address",
      );
    }
  },
);

export const updateMyAddress = createAsyncThunk(
  "address/updateMyAddress",
  async (addressData, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.user.updateOneProfile, {
        address: addressData,
      });
      return res.data.data.user.address;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update address",
      );
    }
  },
);

export const updateUserAddressById = createAsyncThunk(
  "address/updateUserAddressById",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.user.updateProfile(id), {
        address: addressData,
      });
      return res.data.data.user.address;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update address",
      );
    }
  },
);
