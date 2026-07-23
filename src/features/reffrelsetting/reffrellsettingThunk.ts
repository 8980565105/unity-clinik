import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

export interface ReferralSettings {
  referrerPoints: number;
  refereePoints: number;
}
export interface WalletOffer {
  minAmount: number;
  bonusPoints: number;
  chargeType: "fixed" | "percentage" | "free_shipping";
  charge: number;
}
export interface WalletBox {
  amount: number;
  chargeType: "fixed" | "percentage";
  charge: number;
  badge?: string;
}
export interface faqs {
  question: string;
  answer: string;
}
export interface WalletPoint {
  image: string;
  text: string;
}
export interface ReferralSettings {
  referrerPoints: number;
  refereePoints: number;
  walletOffers: WalletOffer[];
  walletbox: WalletBox[];
  points: WalletPoint[];
  faqs: faqs[];
}

export const fetchReferralSettings = createAsyncThunk(
  "referral/fetchReferralSettings",
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.referral.get);
      if (!res.data.success) return rejectWithValue(res.data.message);
      return res.data.data as ReferralSettings;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch referral settings",
      );
    }
  },
);

export const updateReferralSettings = createAsyncThunk(
  "referral/updateReferralSettings",
  async (payload: ReferralSettings, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.referral.update, payload);
      if (!res.data.success) return rejectWithValue(res.data.message);
      return res.data.data as ReferralSettings;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to update referral settings",
      );
    }
  },
);
