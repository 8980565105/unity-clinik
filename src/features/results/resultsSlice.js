import { createSlice } from "@reduxjs/toolkit";
import { fetchResults } from "./resultsThunk";

const initialState = {
  results: [],
  total: 0,
  loading: false,
  error: null,
};

const resultsSlice = createSlice({
  name: "results",
  initialState,
  reducers: {
    clearResults(state) {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload?.results || [];
        state.total = action.payload?.total || 0;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  },
});

export const { clearResults } = resultsSlice.actions;
export default resultsSlice.reducer;
