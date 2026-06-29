import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPopups,
  createPopup,
  updatePopup,
  deletePopup,
  bulkDeletePopups,
  updatePopupStatus,
} from "./PopupThunk";

export interface PopupItem {
  _id: string;
  type?: "coupon" | "consultation" | "BookConsultation";
  title?: string;
  couponCode?: string;
  description?: string;
  buttonText?: string;
  discount?: number;
  status: "active" | "inactive";
  title1?: string;
  title2?: string;
  image?: string;
  heading?: string;
  price?: number;
  offerPrice?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface PopupState {
  popups: PopupItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: PopupState = {
  popups: [],
  total: 0,
  loading: false,
  error: null,
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPopups.fulfilled, (state, action) => {
        state.loading = false;
        state.popups = action.payload.popups || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchPopups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createPopup.fulfilled, (state, action) => {
        state.popups.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updatePopup.fulfilled, (state, action) => {
        const index = state.popups.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) state.popups[index] = action.payload;
      })
      .addCase(updatePopupStatus.fulfilled, (state, action) => {
        const index = state.popups.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (index !== -1) {
          state.popups[index] = action.payload;
        }
      })
      .addCase(deletePopup.fulfilled, (state, action) => {
        state.popups = state.popups.filter((p) => p._id !== action.payload);
        state.total -= 1;
      })
      .addCase(bulkDeletePopups.fulfilled, (state, action) => {
        state.popups = state.popups.filter(
          (p) => !action.payload.includes(p._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default popupSlice.reducer;
