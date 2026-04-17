import { createSlice } from "@reduxjs/toolkit";
import {
  fetchOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  bulkDeleteOrders,
  updateOrderStatus,
  confirmOrder,
  cancelOrder,
  packOrder,
  assignCourier,
  shipOrder,
  updateTracking,
  markDelivered,
  markRTO,
} from "./ordersThunk";

export interface OrderItem {
  _id: string;
  product: { name: string; price: number; sku?: string };
  variant?: {
    color?: { name: string }[];
    size?: { name: string }[];
  };
  quantity: number;
  price_at_order: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  address: string;
  state: string;
  city: string;
  pincode: string;
  phone: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "packed"
  | "ready_to_ship"
  | "shipped"
  | "in_transit"
  | "completed"
  | "cancelled"
  | "rto"
  | "returned"
  | "refunded";

export interface Order {
  _id: string;
  order_number: string;
  user: { name: string; email: string };
  coupon_id?: { code: string; discount_value: number };
  total_price: number;
  status: OrderStatus;
  payment_method: "COD" | "Online";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  courier?: {
    partner?: string;
    name?: string;
    awb_number?: string;
    tracking_url?: string;
    pickup_date?: string;
    dispatched_at?: string;
    delivered_at?: string;
  };
  packing_id?: string | any;
  admin_note?: string;
  cancel_reason?: string;
  status_history: {
    status: string;
    changed_at: string;
    changed_by: string;
    note?: string;
  }[];
  invoice_generated?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrdersState {
  orders: Order[];
  total: number;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  selectedOrder?: Order | null;
}

const initialState: OrdersState = {
  orders: [],
  total: 0,
  loading: false,
  actionLoading: false,
  error: null,
  selectedOrder: null,
};

// ─── Helper: update order in list ────────────────────────────────────────────
const updateInList = (orders: Order[], updated: Order) => {
  const idx = orders.findIndex((o) => o._id === updated._id);
  if (idx !== -1) orders[idx] = updated;
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
    clearOrderError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchOrders
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // getOrderById
    builder
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload?.order || action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateOrder
    builder.addCase(updateOrder.fulfilled, (state, action) => {
      updateInList(state.orders, action.payload);
      if (state.selectedOrder?._id === action.payload._id)
        state.selectedOrder = action.payload;
    });

    // updateOrderStatus
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      updateInList(state.orders, action.payload);
    });

    // deleteOrder
    builder.addCase(deleteOrder.fulfilled, (state, action) => {
      state.orders = state.orders.filter((o) => o._id !== action.payload);
      state.total -= 1;
    });

    // bulkDeleteOrders
    builder.addCase(bulkDeleteOrders.fulfilled, (state, action) => {
      state.orders = state.orders.filter(
        (o) => !action.payload.includes(o._id),
      );
      state.total -= action.payload.length;
    });

    // ─── Flow actions — all share same pattern ───────────────────────────────
    const flowThunks = [
      confirmOrder,
      cancelOrder,
      packOrder,
      assignCourier,
      shipOrder,
      updateTracking,
      markDelivered,
      markRTO,
    ];

    flowThunks.forEach((thunk) => {
      builder
        .addCase(thunk.pending, (state) => {
          state.actionLoading = true;
          state.error = null;
        })
        .addCase(thunk.fulfilled, (state, action) => {
          state.actionLoading = false;
          // response can be { order, packing } or just order
          const updated = action.payload?.order || action.payload;
          if (updated?._id) {
            updateInList(state.orders, updated);
            if (state.selectedOrder?._id === updated._id)
              state.selectedOrder = updated;
          }
        })
        .addCase(thunk.rejected, (state, action) => {
          state.actionLoading = false;
          state.error = action.payload as string;
        });
    });
  },
});

export const { clearSelectedOrder, clearOrderError } = ordersSlice.actions;
export default ordersSlice.reducer;
