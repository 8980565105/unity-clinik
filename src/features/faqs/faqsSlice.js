import { createSlice } from "@reduxjs/toolkit";
import { fetchFaqs, getFaqsById, getFaqBanner } from "./faqsThunk";

const initialState = {
  faqs: [],
  faq: null,
  total: 0,
  loading: false,
  error: null,
  isBackup: false,
  isStatic: false,
  banner: null,
  bannerLoading: false,
};

const faqsSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {
    clearFaqs(state) {
      state.faqs = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isBackup = false;
        state.isStatic = false;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.faqs = action.payload.faqs || [];
        state.total = action.payload.total || 0;
        state.isBackup = action.payload.isBackup || false;
        state.isStatic = action.payload.isStatic || false;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getFaqsById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getFaqsById.fulfilled, (state, action) => {
        state.loading = false;
        state.faq = action.payload;
      })
      .addCase(getFaqsById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getFaqBanner.pending, (state) => {
        state.bannerLoading = true;
      })
      .addCase(getFaqBanner.fulfilled, (state, action) => {
        state.bannerLoading = false;
        state.banner = action.payload;
      })
      .addCase(getFaqBanner.rejected, (state) => {
        state.bannerLoading = false;
        state.banner = null;
      });
  },
});

export const { clearFaqs } = faqsSlice.actions;
export default faqsSlice.reducer;
