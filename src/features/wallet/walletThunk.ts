import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchAllWallets = createAsyncThunk(
  "wallet/fetchAllWallets",
  async (
    params: { page?: number; limit?: number; search?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.wallet.adminGetAll, { params });
      return res.data.data; 
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch wallets",
      );
    }
  },
);

export const adminAddBalance = createAsyncThunk(
  "wallet/adminAddBalance",
  async (
    {
      userId,
      amount,
      reason,
    }: { userId: string; amount: number; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post(ROUTES.wallet.adminAddBalance(userId), {
        amount,
        reason,
      });
      return { userId, ...res.data.data };
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to add balance",
      );
    }
  },
);

export const fetchMyWalletBalance = createAsyncThunk(
  "wallet/fetchMyWalletBalance",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wallet.getBalance);
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch balance",
      );
    }
  },
);

export const fetchMyWalletHistory = createAsyncThunk(
  "wallet/fetchMyWalletHistory",
  async (limit: number = 50, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wallet.getHistory, {
        params: { limit },
      });
      return res.data.data.transactions;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch history",
      );
    }
  },
);

export const fetchUserWalletDetails = createAsyncThunk(
  "wallet/fetchUserWalletDetails",
  async (
    { userId, days }: { userId: string; days?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.wallet.adminGetUserWallet(userId), {
        params: days ? { days } : {},
      });
      return res.data.data;
    } catch (err: any) {
      return rejectWithValue(
        err?.response?.data?.message || "Failed to fetch wallet details",
      );
    }
  },
);