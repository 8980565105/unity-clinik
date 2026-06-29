import { createSlice } from "@reduxjs/toolkit";
import { fetchPublicPopup } from "./popupThunk";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const popupSlice = createSlice({
  name: "popup",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPublicPopup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicPopup.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchPublicPopup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default popupSlice.reducer;
