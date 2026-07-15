import { createSlice } from "@reduxjs/toolkit";
import {
  addWalletMoney,
  debitWallet,
  fetchBalance,
  fetchHistory,
  refundWallet,
} from "./walletThunk";

const initialState = {
  balance: 0,
  totalEarned: 0,
  totalUsed: 0,
  transactions: [],
  loading: false,
  historyLoading: false,
  error: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearWallet(state) {
      state.balance = 0;
      state.totalEarned = 0;
      state.totalUsed = 0;
      state.transactions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // balance
      .addCase(fetchBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance;
        state.totalEarned = action.payload.totalEarned;
        state.totalUsed = action.payload.totalUsed;
      })
      .addCase(fetchBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // history
      .addCase(fetchHistory.pending, (state) => {
        state.historyLoading = true;
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.error = action.payload;
      })
      .addCase(addWalletMoney.fulfilled, (state, action) => {
        state.balance = action.payload.data.balance;

        state.totalEarned = action.payload.data.totalEarned;

        state.totalUsed = action.payload.data.totalUsed;

        state.transactions = action.payload.data.transactions;
      })
      .addCase(debitWallet.fulfilled, (state, action) => {
        state.balance = action.payload.data.balance;
        state.totalEarned = action.payload.data.totalEarned;
        state.totalUsed = action.payload.data.totalUsed;
        state.transactions = action.payload.data.transactions;
      })
      .addCase(refundWallet.fulfilled, (state, action) => {
        state.balance = action.payload.data.balance;
        state.totalEarned = action.payload.data.totalEarned;
        state.totalUsed = action.payload.data.totalUsed;
        state.transactions = action.payload.data.transactions;
      });
  },
});

export const { clearWallet } = walletSlice.actions;
export default walletSlice.reducer;
