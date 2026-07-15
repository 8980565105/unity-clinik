import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  fetchAllWallets,
  adminAddBalance,
  fetchMyWalletBalance,
  fetchMyWalletHistory,
  fetchUserWalletDetails,
} from "./walletThunk";

interface WalletUser {
  _id: string;
  walletId: string;
  name: string;
  email: string;
  mobile_number?: string;
  profile_picture?: string;
  balance: number;
  totalEarned: number;
  totalUsed: number;
}

interface WalletState {
  users: WalletUser[];
  total: number;
  loading: boolean;
  error: string | null;

  myBalance: number;
  myTotalEarned: number;
  myTotalUsed: number;
  myHistory: any[];
  myLoading: boolean;

  addBalanceLoading: boolean;
  addBalanceError: string | null;
  userWalletDetail: {
    user: any | null;
    balance: number;
    totalEarned: number;
    totalUsed: number;
    transactions: any[];
  };
  userWalletDetailLoading: boolean;
  userWalletDetailError: string | null;
}

const initialState: WalletState = {
  users: [],
  total: 0,
  loading: false,
  error: null,

  myBalance: 0,
  myTotalEarned: 0,
  myTotalUsed: 0,
  myHistory: [],
  myLoading: false,

  addBalanceLoading: false,
  addBalanceError: null,
  userWalletDetail: {
    user: null,
    balance: 0,
    totalEarned: 0,
    totalUsed: 0,
    transactions: [],
  },
  userWalletDetailLoading: false,
  userWalletDetailError: null,
};

const walletSlice = createSlice({
  name: "wallet",
  initialState,
  reducers: {
    clearAddBalanceError: (state) => {
      state.addBalanceError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Admin: fetch all wallets
      .addCase(fetchAllWallets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllWallets.fulfilled,
        (
          state,
          action: PayloadAction<{ users: WalletUser[]; total: number }>,
        ) => {
          state.loading = false;
          state.users = action.payload.users;
          state.total = action.payload.total;
        },
      )
      .addCase(fetchAllWallets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Admin: add balance
      .addCase(adminAddBalance.pending, (state) => {
        state.addBalanceLoading = true;
        state.addBalanceError = null;
      })
      .addCase(adminAddBalance.fulfilled, (state, action: any) => {
        state.addBalanceLoading = false;
        const { userId, balance, totalEarned, totalUsed } = action.payload;
        const idx = state.users.findIndex((u) => u._id === userId);
        if (idx !== -1) {
          state.users[idx].balance = balance;
          state.users[idx].totalEarned = totalEarned;
          state.users[idx].totalUsed = totalUsed;
        }
      })
      .addCase(adminAddBalance.rejected, (state, action) => {
        state.addBalanceLoading = false;
        state.addBalanceError = action.payload as string;
      })

      // User: own balance
      .addCase(fetchMyWalletBalance.pending, (state) => {
        state.myLoading = true;
      })
      .addCase(fetchMyWalletBalance.fulfilled, (state, action: any) => {
        state.myLoading = false;
        state.myBalance = action.payload.balance;
        state.myTotalEarned = action.payload.totalEarned;
        state.myTotalUsed = action.payload.totalUsed;
      })
      .addCase(fetchMyWalletBalance.rejected, (state, action) => {
        state.myLoading = false;
        state.error = action.payload as string;
      })

      // User: own history
      .addCase(fetchMyWalletHistory.fulfilled, (state, action: any) => {
        state.myHistory = action.payload;
      })
      .addCase(fetchUserWalletDetails.pending, (state) => {
        state.userWalletDetailLoading = true;
        state.userWalletDetailError = null;
      })
      .addCase(fetchUserWalletDetails.fulfilled, (state, action: any) => {
        state.userWalletDetailLoading = false;
        state.userWalletDetail = action.payload;
      })
      .addCase(fetchUserWalletDetails.rejected, (state, action) => {
        state.userWalletDetailLoading = false;
        state.userWalletDetailError = action.payload as string;
      });
  },
});

export const { clearAddBalanceError } = walletSlice.actions;
export default walletSlice.reducer;
