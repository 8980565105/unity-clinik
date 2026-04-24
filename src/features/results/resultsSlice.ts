import { createSlice } from "@reduxjs/toolkit";
import {
  fetchResults,
  createResults,
  updateResults,
  deleteResults,
  bulkDeleteResults,
  updateResultsStatus,
} from "./resultsThunk";
interface ResultItem {
  _id: string;
  name: string;
  after_image_url: string;
  before_image_url: string;
  description?: string;
  status: "active" | "inactive";
  storeId?: string;
  createdAt?: string;
  updatedAt?: string;
}
interface ResultsState {
  results: ResultItem[];
  total: number;
  loading: boolean;
  error: string | null;
}
const initialState: ResultsState = {
  results: [],
  total: 0,
  loading: false,
  error: null,
};
const resultsSlice = createSlice({
  name: "results",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
        state.total = action.payload.total;
      })
      .addCase(fetchResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResults.fulfilled, (state, action) => {
        state.loading = false;
        state.results.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResults.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.results.findIndex(
          (s) => s._id === action.payload._id,
        );
        if (index !== -1) state.results[index] = action.payload;
      })
      .addCase(updateResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateResultsStatus.fulfilled, (state, action) => {
        const index = state.results.findIndex(
          (c) => c._id === action.payload._id,
        );
        if (index !== -1) state.results[index] = action.payload;
      })
      .addCase(deleteResults.fulfilled, (state, action) => {
        state.results = state.results.filter((s) => s._id !== action.payload);
        state.total -= 1;
      })
      .addCase(bulkDeleteResults.fulfilled, (state, action) => {
        state.results = state.results.filter(
          (s) => !action.payload.includes(s._id),
        );
        state.total -= action.payload.length;
      });
  },
});
export default resultsSlice.reducer;
