import { createSlice } from "@reduxjs/toolkit";
import {
  createOrder,
  fetchOrder,
  fetchUserOrders,
  cancelOrder,
} from "./orderThunk";

const initialState = {
  orders: [],
  order: null,
  total: 0,
  loading: false,
  error: null,
};

const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrders: (state) => {
      state.orders = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    // ─── CREATE ORDER ─────────────────────────────────────────────────────────
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── FETCH SINGLE ORDER ───────────────────────────────────────────────────
    builder
      .addCase(fetchOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ─── FETCH USER ORDERS ────────────────────────────────────────────────────
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || action.payload;
      });

    // ─── CANCEL ORDER ─────────────────────────────────────────────────────────
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated?._id) {
          const idx = state.orders.findIndex((o) => o._id === updated._id);
          if (idx !== -1) state.orders[idx] = updated;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;
