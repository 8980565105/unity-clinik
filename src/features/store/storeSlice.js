import { createSlice } from "@reduxjs/toolkit";
import { fetchStoreInfo } from "./storeThunk";

const initialState = {
  info: null,
  settings: null,
  loadingInfo: false,
  loadingSettings: false,
  errorInfo: null,
  errorSettings: null,
};

const storeSlice = createSlice({
  name: "store",
  initialState,
  reducers: {
    clearStoreInfo: (state) => {
      state.info = null;
    },
    clearStoreSettings: (state) => {
      state.settings = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStoreInfo.pending, (state) => {
        state.loadingInfo = true;
        state.errorInfo = null;
      })
      .addCase(fetchStoreInfo.fulfilled, (state, action) => {
        state.loadingInfo = false;
        state.info = action.payload;
      })
      .addCase(fetchStoreInfo.rejected, (state, action) => {
        state.loadingInfo = false;
        state.errorInfo = action.payload;
      });
  },
});

export const { clearStoreInfo, clearStoreSettings } = storeSlice.actions;
export default storeSlice.reducer;
