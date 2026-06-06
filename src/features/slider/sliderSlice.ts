

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchSlides,
  createSlide,
  updateSlide,
  deleteSlide,
  bulkDeleteSlides,
  updateSlideStatus,
  getSlideById,
} from "./sliderThunk";

export interface Hero1SlideItem {
  _id: string;
  title: string;
  description?: string;
  button_name?: string;
  button_link?: string;
  location?: string;
  name?: string;
  age?: string;
  review?: string;
  mainImage?: string | null;
  beforeImage?: string | null;
  afterImage?: string | null;
  status: "active" | "inactive";
  order?: number;
}

export interface Banner1SlideItem {
  _id: string;
  title: string;
  description?: string;
  button_name?: string;
  button_link?: string;
  badge?: string;
  bgImage?: string | null;
  productimg?: string | null;
  status: "active" | "inactive";
  order?: number;
}

export interface SliderSection {
  _id: string;
  section: "hero1" | "banner1";
  status: "active" | "inactive";
  hero1Slides?: Hero1SlideItem[];
  banner1Slides?: Banner1SlideItem[];
  storeId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface SliderState {
  slides: SliderSection[];
  currentSlide: SliderSection | null;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: SliderState = {
  slides: [],
  currentSlide: null,
  total: 0,
  loading: false,
  error: null,
};

const sliderSlice = createSlice({
  name: "slider",
  initialState,
  reducers: {
    clearCurrentSlide: (state) => {
      state.currentSlide = null;
    },
    clearError: (state) => {
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
        state.slides = action.payload?.slides ?? [];
        state.total  = action.payload?.total  ?? 0;
      })
      .addCase(fetchSlides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getSlideById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSlideById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSlide = action.payload;
      })
      .addCase(getSlideById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSlide.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?._id) {
          state.slides.unshift(action.payload);
          state.total += 1;
        }
      })
      .addCase(createSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateSlide.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSlide.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.slides.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.slides[idx] = action.payload;
      })
      .addCase(updateSlide.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteSlide.fulfilled, (state, action) => {
        state.slides = state.slides.filter((s) => s._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteSlide.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(bulkDeleteSlides.fulfilled, (state, action) => {
        const ids = action.payload as string[];
        state.slides = state.slides.filter((s) => !ids.includes(s._id));
        state.total = Math.max(0, state.total - ids.length);
      })
      .addCase(bulkDeleteSlides.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      .addCase(updateSlideStatus.fulfilled, (state, action) => {
        const idx = state.slides.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.slides[idx].status = action.payload.status;
      })
      .addCase(updateSlideStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearCurrentSlide, clearError } = sliderSlice.actions;
export default sliderSlice.reducer;