// import { createSlice } from "@reduxjs/toolkit";
// import {
//   fetchPublicSettings,
//   fetchSettings,
//   updateSettings,
// } from "./settingThunk";

// const initialState = {
//   settings: {},
//   loading: false,
//   error: null,
// };

// const settingSlice = createSlice({
//   name: "settings",
//   initialState,
//   reducers: {
//     clearSettings(state) {
//       state.settings = {};
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchSettings.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchSettings.fulfilled, (state, action) => {
//         state.loading = false;
//         state.settings = action.payload?.settings || {};
//       })
//       .addCase(fetchSettings.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(updateSettings.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(updateSettings.fulfilled, (state, action) => {
//         state.loading = false;
//         state.settings = action.payload || {};
//       })
//       .addCase(updateSettings.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       })
//       .addCase(fetchPublicSettings.pending, (state) => {
//         state.loading = true;
//       })
//       .addCase(fetchPublicSettings.fulfilled, (state, action) => {
//         state.loading = false;
//         state.data = action.payload;
//       })
//       .addCase(fetchPublicSettings.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export const { clearSettings } = settingSlice.actions;
// export default settingSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";
import { fetchPublicSettings, fetchSettings, updateSettings } from "./settingThunk";

const initialState = {
  data: null,   // ✅ 'settings' nahi — 'data' rakho
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
      // fetchSettings
      .addCase(fetchSettings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // ✅ direct payload
      })
      .addCase(fetchSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // updateSettings
      .addCase(updateSettings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // ✅
      })
      .addCase(updateSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      // fetchPublicSettings
      .addCase(fetchPublicSettings.pending, (state) => { state.loading = true; })
      .addCase(fetchPublicSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload; // ✅
      })
      .addCase(fetchPublicSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearSettings } = settingSlice.actions;
export default settingSlice.reducer;