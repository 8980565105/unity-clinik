import { createSlice } from "@reduxjs/toolkit";
import {
  bulkDeleteTypes,
  createType,
  deleteType,
  fetchTypes,
  updateType,
  updateTypeStatus,
} from "./typesThunk";

interface Type {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface TypesState {
  types: Type[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: TypesState = {
  types: [],
  total: 0,
  loading: false,
  error: null,
};

const typesSlice = createSlice({
  name: "types",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.types = action.payload.types;
        state.total = action.payload.total;
      })
      .addCase(fetchTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createType.fulfilled, (state, action) => {
        state.types.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateType.fulfilled, (state, action) => {
        const index = state.types.findIndex(
          (t) => t._id === action.payload._id
        );
        if (index !== -1) state.types[index] = action.payload;
      })

      .addCase(updateTypeStatus.fulfilled, (state, action) => {
        const index = state.types.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.types[index] = action.payload;
        }
      })
      // Delete
      .addCase(deleteType.fulfilled, (state, action) => {
        state.types = state.types.filter((t) => t._id !== action.payload);
        state.total -= 1;
      })

      // Bulk delete
      .addCase(bulkDeleteTypes.fulfilled, (state, action) => {
        state.types = state.types.filter(
          (t) => !action.payload.includes(t._id)
        );
        state.total -= action.payload.length;
      });
  },
});

export default typesSlice.reducer;
