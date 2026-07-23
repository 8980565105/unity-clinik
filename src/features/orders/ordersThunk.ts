import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: string;
      startDate?: string;
      endDate?: string;
      minPrice?: number;
      maxPrice?: number;
      user?: string;
      product?: string;
      color?: string;
      size?: string;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const filteredParams = Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && v !== "" && v !== null,
        ),
      );
      if (filteredParams.status === "all") delete filteredParams.status;

      const res = await api.get(ROUTES.orders.getAll, {
        params: filteredParams,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch orders");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.orders.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Order not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateOrder = createAsyncThunk(
  "orders/updateOrder",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.orders.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update order");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async (
    { id, status }: { id: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.orders.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete order");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteOrders = createAsyncThunk(
  "orders/bulkDeleteOrders",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.orders.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete orders");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ════════════════════════════════════════════════════════════════════════════════
// ORDER FLOW ACTIONS
// ════════════════════════════════════════════════════════════════════════════════

export const confirmOrder = createAsyncThunk(
  "orders/confirmOrder",
  async (
    { id, admin_note }: { id: string; admin_note?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.confirm(id), { admin_note });
      if (res.data.success) return res.data.data; 
      return rejectWithValue(res.data.message || "Failed to confirm order");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const cancelOrder = createAsyncThunk(
  "orders/cancelOrder",
  async (
    { id, reason }: { id: string; reason: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.cancel(id), { reason });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to cancel order");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const packOrder = createAsyncThunk(
  "orders/packOrder",
  async (
    { id, warehouse_name }: { id: string; warehouse_name: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.pack(id), { warehouse_name });
      if (res.data.success) return res.data.data; 
      return rejectWithValue(res.data.message || "Failed to pack order");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const assignCourier = createAsyncThunk(
  "orders/assignCourier",
  async (
    {
      id,
      partner,
      courier_name,
      awb_number,
      pickup_date,
    }: {
      id: string;
      partner: string;
      courier_name?: string;
      awb_number: string;
      pickup_date?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.assignCourier(id), {
        partner,
        courier_name,
        awb_number,
        pickup_date,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to assign courier");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const shipOrder = createAsyncThunk(
  "orders/shipOrder",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.orders.ship(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to ship order");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateTracking = createAsyncThunk(
  "orders/updateTracking",
  async (
    {
      id,
      tracking_url,
      note,
    }: { id: string; tracking_url?: string; note?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.tracking(id), {
        tracking_url,
        note,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update tracking");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const markDelivered = createAsyncThunk(
  "orders/markDelivered",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.orders.deliver(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to mark delivered");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const markRTO = createAsyncThunk(
  "orders/markRTO",
  async (
    {
      id,
      type,
      reason,
    }: { id: string; type: "rto" | "returned" | "refunded"; reason?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.rto(id), { type, reason });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
export const addTrackingAWB = createAsyncThunk(
  "orders/addTrackingAWB",
  async (
    {
      id,
      awb_number,
      courier_name,
    }: { id: string; awb_number: string; courier_name?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.patch(ROUTES.orders.addAwb(id), {
        awb_number,
        courier_name,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to add AWB");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const decideReturn = createAsyncThunk(
  "orders/decideReturn",
  async (
    {
      id,
      decision,
      note,
    }: { id: string; decision: "approved" | "rejected"; note?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.decideReturn(id), {
        decision,
        note,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update return");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const refundOrder = createAsyncThunk(
  "orders/refundOrder",
  async (
    { id, amount, note }: { id: string; amount: number; note?: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.orders.refund(id), { amount, note });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to refund order");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateOrderShippingDetails = createAsyncThunk(
  "orders/updateOrderShippingDetails",
  async (
    {
      id,
      shippingAddress,
      shipment_weight,
      shipment_length,
      shipment_width,
      shipment_height,
      awb_number,
      courier_name,
    }: {
      id: string;
      shippingAddress?: any;
      shipment_weight?: any;
      shipment_length?: any;
      shipment_width?: any;
      shipment_height?: any;
      awb_number?: string;
      courier_name?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.patch(ROUTES.orders.shippingDetails(id), {
        shippingAddress,
        shipment_weight,
        shipment_length,
        shipment_width,
        shipment_height,
        awb_number,
        courier_name,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to update shipping details",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const pushOrderToIthink = createAsyncThunk(
  "orders/pushOrderToIthink",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.orders.pushIthink(id));
      if (res.data.success) return res.data.data; 
      return rejectWithValue(
        res.data.message || "Failed to push order to iThink",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
