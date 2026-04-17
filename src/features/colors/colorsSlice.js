
import { createSlice } from "@reduxjs/toolkit";
import { fetchColors, fetchColorById } from "./colorsThunk";

const initialState = {
  colors: [],
  color: null,
  loading: false,
  error: null,
};

const colorsSlice = createSlice({
  name: "colors",
  initialState,
  reducers: {
    clearColors(state) {
      state.colors = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchColors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.loading = false;
        state.colors = action.payload?.colors || [];
      })
      .addCase(fetchColors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(fetchColorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchColorById.fulfilled, (state, action) => {
        state.loading = false;
        state.color = action.payload;
      })
      .addCase(fetchColorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearColors } = colorsSlice.actions;
export default colorsSlice.reducer;
