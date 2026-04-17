import { createSlice } from "@reduxjs/toolkit";
import { fetchPages, fetchPageBySlug } from "./pagesThunk";

const initialState = {
  pages: [],
  currentPage: null,
  loading: false,
  slugLoading: false,
  error: null,
};

const pagesSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    clearPages: (state) => {
      state.pages = [];
      state.error = null;
    },
    clearCurrentPage: (state) => {
      state.currentPage = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchPages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPages.fulfilled, (state, action) => {
        state.loading = false;
        state.pages = action.payload.pages;
      })
      .addCase(fetchPages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch pages";
      })

      .addCase(fetchPageBySlug.pending, (state) => {
        state.slugLoading = true;
        state.error = null;
      })
      .addCase(fetchPageBySlug.fulfilled, (state, action) => {
        state.slugLoading = false;
        state.currentPage = action.payload;

        const exists = state.pages.find((p) => p._id === action.payload._id);
        if (!exists) {
          state.pages.push(action.payload);
        } else {
          const idx = state.pages.findIndex(
            (p) => p._id === action.payload._id,
          );
          state.pages[idx] = action.payload;
        }
      })
      .addCase(fetchPageBySlug.rejected, (state, action) => {
        state.slugLoading = false;
        state.error = action.payload || "Failed to fetch page";
      });
  },
});

export const { clearPages, clearCurrentPage } = pagesSlice.actions;
export default pagesSlice.reducer;
