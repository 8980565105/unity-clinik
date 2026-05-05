
import { createSlice } from "@reduxjs/toolkit";
import { fetchSlides } from "./slideThunk";

const initialState = {
  slides: [],
  total: 0,
  loading: false,
  error: null,
};

const slideSlice = createSlice({
  name: "slides",
  initialState,
  reducers: {
    clearSlides(state) {
      state.slides = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSlides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlides.fulfilled, (state, action) => {
        state.loading = false;
        state.slides = action.payload?.slides || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearSlides } = slideSlice.actions;
export default slideSlice.reducer;