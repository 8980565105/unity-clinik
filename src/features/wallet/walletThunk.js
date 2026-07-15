import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchBalance = createAsyncThunk(
  "wallet/fetchBalance",
  async (_params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.wallet.getBalance);
      if (!res.data.success) return rejectWithValue(res.data.message);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch balance",
      );
    }
  },
);

export const fetchHistory = createAsyncThunk(
  "wallet/fetchHistory",
  async (params = {}, { rejectWithValue }) => {
    try {
      const limit = params.limit || 50;
      const res = await api.get(`${ROUTES.wallet.getHistory}?limit=${limit}`);
      if (!res.data.success) return rejectWithValue(res.data.message);
      return res.data.data.transactions;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch history",
      );
    }
  },
);
export const addWalletMoney = createAsyncThunk(
  "wallet/addWalletMoney",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.wallet.addMoney, data);

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const debitWallet = createAsyncThunk(
  "wallet/debitWallet",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.wallet.debit, data); 
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const refundWallet = createAsyncThunk(
  "wallet/refundWallet",
  async (data, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.wallet.refund, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);