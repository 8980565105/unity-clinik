import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";
import { getOrCreateGuestId } from "../../utils/guestId";

const jsonHeaders = () => ({ "Content-Type": "application/json" });

const getCartIdentifier = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  if (token && user?._id) {
    return { user_id: user._id };
  }
  return { guest_id: getOrCreateGuestId() };
};

export const createCart = createAsyncThunk(
  "cart/createCart",
  async (_, { rejectWithValue }) => {
    try {
      const identifier = getCartIdentifier();
      const response = await api.post(
        ROUTES.cart.getAll,
        identifier,
        { headers: jsonHeaders() },
      );
      const cart = response.data.data;
      localStorage.setItem("cart_id", cart._id);
      return cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Create cart failed");
    }
  },
);

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const identifier = getCartIdentifier();
      const res = await api.get(ROUTES.cart.getByIdentifier, {
        params: identifier,
        headers: jsonHeaders(),
      });
      const cart = res.data.data;
      if (cart?._id) {
        localStorage.setItem("cart_id", cart._id);
      }
      return cart;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Fetch cart failed");
    }
  },
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.cart.addItem, payload, {
        headers: jsonHeaders(),
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Add to cart failed");
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ cart_id, item_id, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.put(
        ROUTES.cart.updateItem,
        { cart_id, item_id, quantity },
        { headers: jsonHeaders() },
      );
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update item",
      );
    }
  },
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async ({ cart_id, item_id }, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.cart.deleteItem, {
        data: { cart_id, item_id },
        headers: jsonHeaders(),
      });
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (user_id, { rejectWithValue }) => {
    try {
      const guest_id = getOrCreateGuestId();
      const res = await api.post(
        ROUTES.cart.merge,
        { guest_id, user_id },
        { headers: jsonHeaders() },
      );
      const cart = res.data.data;
      if (cart?._id) {
        localStorage.setItem("cart_id", cart._id);
      }
      return cart;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Merge cart failed");
    }
  },
);