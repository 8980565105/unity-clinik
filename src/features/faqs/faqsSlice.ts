import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFaqs,
  createFaqs,
  updateFaqs,
  deleteFaqs,
  bulkDeleteFaqs,
  updateFaqsStatus,
  saveFaqBanner,
  getFaqBanner,
} from "./faqsThunk";

interface Faq {
  _id: string;
  question: string;
  answer?: string;
  category?: string;
  status: string;
}

interface FaqBanner {
  image: string;
  title: string;
  description: string;
}

interface FaqState {
  faqs: Faq[];
  total: number;
  loading: boolean;
  error: string | null;
  banner: FaqBanner | null;
  bannerLoading: boolean;
}

const initialState: FaqState = {
  faqs: [],
  total: 0,
  loading: false,
  error: null,
  banner: null,
  bannerLoading: false,
};

const faqsSlice = createSlice({
  name: "faqs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFaqs.fulfilled, (state, action: any) => {
        state.loading = false;
        state.faqs = action.payload.faqs || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createFaqs.fulfilled, (state, action) => {
        state.faqs.unshift(action.payload);
      })

      .addCase(updateFaqs.fulfilled, (state, action) => {
        const index = state.faqs.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) state.faqs[index] = action.payload;
      })

      .addCase(updateFaqsStatus.fulfilled, (state, action) => {
        const index = state.faqs.findIndex((f) => f._id === action.payload._id);
        if (index !== -1) state.faqs[index] = action.payload;
      })

      .addCase(deleteFaqs.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter((f) => f._id !== action.payload);
      })

      .addCase(bulkDeleteFaqs.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter(
          (f) => !action.payload.includes(f._id),
        );
      })

      .addCase(saveFaqBanner.pending, (state) => {
        state.bannerLoading = true;
      })
      .addCase(saveFaqBanner.fulfilled, (state, action) => {
        state.bannerLoading = false;
        state.banner = action.payload?.banner ?? action.payload;
      })
      .addCase(saveFaqBanner.rejected, (state) => {
        state.bannerLoading = false;
      })

      .addCase(getFaqBanner.fulfilled, (state, action) => {
        state.banner = action.payload;
      });
  },
});

export default faqsSlice.reducer;