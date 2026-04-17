import { createSlice } from "@reduxjs/toolkit";
import { bulkDeleteProductLabels, createProductLabel, deleteProductLabel, fetchProductLabels, updateProductLabel, updateProductLabelStatus } from "./productLabelsThunk";


interface ProductLabel {
  _id: string;
  name: string;
  slug: string;
  color: string;
  status?: string;
  image_url?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProductLabelsState {
  labels: ProductLabel[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductLabelsState = {
  labels: [],
  total: 0,
  loading: false,
  error: null,
};

const productLabelsSlice = createSlice({
  name: "productLabels",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchProductLabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.labels = action.payload.labels;
        state.total = action.payload.total;
      })
      .addCase(fetchProductLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Create
      .addCase(createProductLabel.fulfilled, (state, action) => {
        state.labels.unshift(action.payload);
        state.total += 1;
      })

      // Update
      .addCase(updateProductLabel.fulfilled, (state, action) => {
        const index = state.labels.findIndex((l) => l._id === action.payload._id);
        if (index !== -1) state.labels[index] = action.payload;
      })

       .addCase(updateProductLabelStatus.fulfilled, (state, action) => {
              const index = state.labels.findIndex(
                (c) => c._id === action.payload._id
              );
              if (index !== -1) {
                state.labels[index] = action.payload;
              }
            })

      // Delete
      .addCase(deleteProductLabel.fulfilled, (state, action) => {
        state.labels = state.labels.filter((l) => l._id !== action.payload);
        state.total -= 1;
      })

      // Bulk delete
      .addCase(bulkDeleteProductLabels.fulfilled, (state, action) => {
        state.labels = state.labels.filter((l) => !action.payload.includes(l._id));
        state.total -= action.payload.length;
      });
  },
});

export default productLabelsSlice.reducer;
