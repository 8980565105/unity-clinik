import { createSlice } from "@reduxjs/toolkit";
import { fetchSystemSettings, updateSystemSetting } from "./systemsettingThunk";

const initialState = {
  data: null as any,
  loading: false,
  error: null as string | null,
};

const systemsetingSlice = createSlice({
  name: "systemseting",
  initialState,
  reducers: {
    clearSystemSetting(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSystemSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSystemSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(updateSystemSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSystemSetting } = systemsetingSlice.actions;
export default systemsetingSlice.reducer;
