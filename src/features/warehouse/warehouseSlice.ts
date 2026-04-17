import { createSlice } from "@reduxjs/toolkit";

import {
  fetchWarehouse,
  updatewarehouseStatus,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
  bulkDeleteWarehouse,
} from "./warehouseThunk";

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState: {
    warehouses: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload.warehouses;
        state.total = action.payload.total;
      })
      .addCase(fetchWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.warehouses.unshift(action.payload);
        state.total += 1;
      })
      // .addCase(updateWarehouse.fulfilled, (state, action) => {
      //   const index = state.warehouses.findIndex(
      //     (c) => c._id === action.payload._id,
      //   );
      //   if (index !== -1) state.warehouses[index] = action.payload;
      // })

      .addCase(updateWarehouse.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex(
          (c: any) => c._id === action.payload._id, // ખાતરી કરો કે અહિયાં _id છે
        );
        if (index !== -1) state.warehouses[index] = action.payload;
      })

      // .addCase(updatewarehouseStatus.fulfilled, (state, action) => {
      //   const index = state.warehouses.findIndex(
      //     (c) => c._id === action.payload._id,
      //   );
      //   if (index !== -1) {
      //     state.warehouses[index] = action.payload;
      //   }
      // })

      .addCase(updatewarehouseStatus.fulfilled, (state, action) => {
        const index = state.warehouses.findIndex(
          (c: any) => c._id === action.payload._id,
        );
        if (index !== -1) {
          state.warehouses[index] = action.payload;
        }
      })

      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.warehouses = state.warehouses.filter(
          (c) => c._id !== action.payload,
        );
        state.total -= 1;
      })
      .addCase(bulkDeleteWarehouse.fulfilled, (state, action) => {
        state.warehouses = state.warehouses.filter(
          (c) => !action.payload.includes(c._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default warehouseSlice.reducer;
