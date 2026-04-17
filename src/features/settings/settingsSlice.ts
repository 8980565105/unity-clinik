

import { createSlice } from "@reduxjs/toolkit";
import { fetchSettings, updateSettings } from "./settingsThunk";

const initialState = {
  data: null,  
  loading: false,
  error: null,
};

const settingSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    clearSettings(state) {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; 
      })
      .addCase(fetchSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateSettings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; 
      })
      .addCase(updateSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
  },
});

export const { clearSettings } = settingSlice.actions;
export default settingSlice.reducer;