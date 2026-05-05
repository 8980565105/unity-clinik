import { createSlice } from "@reduxjs/toolkit";
import { fetchSystemSettings } from "./systemsetting.Thunk";

const initialState = {
  data: null,
  loading: false,
  error: null,
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
        state.error = action.payload;
      });
  },
});
export const { clearSystemSetting } = systemsetingSlice.actions;
export default systemsetingSlice.reducer;
