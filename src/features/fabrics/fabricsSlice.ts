import { createSlice } from "@reduxjs/toolkit";
import {
  bulkDeleteFabrics,
  createFabric,
  deleteFabric,
  fetchFabrics,
  updateFabric,
  updateFabricStatus,
} from "./fabricsThunk";

interface Fabric {
  _id: string;
  name: string;
  slug: string;
  image_url?: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface FabricsState {
  fabrics: Fabric[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: FabricsState = {
  fabrics: [],
  total: 0,
  loading: false,
  error: null,
};

const fabricSlice = createSlice({
  name: "fabrics",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchFabrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFabrics.fulfilled, (state, action) => {
        state.loading = false;
        state.fabrics = action.payload.fabrics;
        state.total = action.payload.total;
      })
      .addCase(fetchFabrics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createFabric.fulfilled, (state, action) => {
        state.fabrics.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateFabric.fulfilled, (state, action) => {
        const index = state.fabrics.findIndex(
          (f) => f._id === action.payload._id
        );
        if (index !== -1) state.fabrics[index] = action.payload;
      })

      .addCase(updateFabricStatus.fulfilled, (state, action) => {
        const index = state.fabrics.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.fabrics[index] = action.payload;
        }
      })

      // Delete
      .addCase(deleteFabric.fulfilled, (state, action) => {
        state.fabrics = state.fabrics.filter((f) => f._id !== action.payload);
        state.total -= 1;
      })

      // Bulk delete
      .addCase(bulkDeleteFabrics.fulfilled, (state, action) => {
        state.fabrics = state.fabrics.filter(
          (f) => !action.payload.includes(f._id)
        );
        state.total -= action.payload.length;
      });
  },
});

export default fabricSlice.reducer;
