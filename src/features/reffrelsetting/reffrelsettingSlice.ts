import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { fetchReferralSettings, updateReferralSettings, ReferralSettings } from "./reffrellsettingThunk";

interface ReferralState {
  data: ReferralSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ReferralState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
};

const referralSlice = createSlice({
  name: "referral",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchReferralSettings.fulfilled,
        (state, action: PayloadAction<ReferralSettings>) => {
          state.loading = false;
          state.data = action.payload;
        },
      )
      .addCase(fetchReferralSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateReferralSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(
        updateReferralSettings.fulfilled,
        (state, action: PayloadAction<ReferralSettings>) => {
          state.saving = false;
          state.data = action.payload;
        },
      )
      .addCase(updateReferralSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export default referralSlice.reducer;