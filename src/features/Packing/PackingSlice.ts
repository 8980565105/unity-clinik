import { createSlice } from "@reduxjs/toolkit";
import {
  fetchpaking,
  getpakingById,
  createpaking,
  updatepaking,
  deletepaking,
  bulkDeletepaking,
  updatepakingStatus,
} from "./PackingThunk";

export interface Packing {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface PackingState {
  packings: Packing[];
  selectedPacking: Packing | null;
  loading: boolean;
  error: string | null;
  total: number;
}

const initialState: PackingState = {
  packings: [],
  selectedPacking: null,
  loading: false,
  error: null,
  total: 0,
};

const packingSlice = createSlice({
  name: "packing",
  initialState,
  reducers: {
    clearSelectedPacking(state) {
      state.selectedPacking = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchpaking
    builder
      .addCase(fetchpaking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchpaking.fulfilled, (state, action) => {
        state.loading = false;
        state.packings = action.payload.packings || action.payload;
        state.total = action.payload.total || action.payload.length;
      })
      .addCase(fetchpaking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getpakingById
    builder
      .addCase(getpakingById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getpakingById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPacking = action.payload;
      })
      .addCase(getpakingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createpaking
    builder
      .addCase(createpaking.pending, (state) => {
        state.loading = true;
      })
      .addCase(createpaking.fulfilled, (state, action) => {
        state.loading = false;
        state.packings.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createpaking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updatepaking
    builder
      .addCase(updatepaking.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatepaking.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.packings.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (idx !== -1) state.packings[idx] = action.payload;
        if (state.selectedPacking?._id === action.payload._id)
          state.selectedPacking = action.payload;
      })
      .addCase(updatepaking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // deletepaking
    builder
      .addCase(deletepaking.fulfilled, (state, action) => {
        state.packings = state.packings.filter((p) => p._id !== action.payload);
        state.total -= 1;
      })
      .addCase(deletepaking.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // bulkDeletepaking
    builder
      .addCase(bulkDeletepaking.fulfilled, (state, action) => {
        state.packings = state.packings.filter(
          (p) => !action.payload.includes(p._id),
        );
        state.total -= action.payload.length;
      })
      .addCase(bulkDeletepaking.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // updatepakingStatus
    builder
      .addCase(updatepakingStatus.fulfilled, (state, action) => {
        const idx = state.packings.findIndex(
          (p) => p._id === action.payload._id,
        );
        if (idx !== -1) state.packings[idx] = action.payload;
      })
      .addCase(updatepakingStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedPacking, clearError } = packingSlice.actions;
export default packingSlice.reducer;
