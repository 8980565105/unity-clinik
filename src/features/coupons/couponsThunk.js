
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";


export const fetchCoupons = createAsyncThunk(
  "coupons/fetchCoupons",
  async (params, { rejectWithValue }) => {
    try {
      const result = await api.get(ROUTES.coupons.getPublic, { params });
      return result.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  },
);

export const fetchCouponById = createAsyncThunk(
  "coupons/fetchCouponById",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(ROUTES.coupons.getById(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);
 