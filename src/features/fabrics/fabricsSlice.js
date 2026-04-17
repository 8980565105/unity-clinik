import { createSlice } from "@reduxjs/toolkit";
import { fetchFabrics, getFabricById } from "./fabricsThunk";
const initialState = {
  fabrics: [],
  fabric: null,
  loading: false,
  error: null,
};
const fabricsSlice = createSlice({
  name: "fabrics",
  initialState,
  reducers: {
    clearFabrics(state) {
      state.fabrics = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFabrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFabrics.fulfilled, (state, action) => {
        state.loading = false;
        state.fabrics = action.payload?.fabrics || [];
      })
      .addCase(fetchFabrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getFabricById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFabricById.fulfilled, (state, action) => {
        state.loading = false;
        state.fabric = action.payload; 
      })
      .addCase(getFabricById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFabrics } = fabricsSlice.actions;
export default fabricsSlice.reducer;
