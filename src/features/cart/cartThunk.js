import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";


const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const createCart = createAsyncThunk(
  "cart/createCart",
  async ({ user_id }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        ROUTES.cart.getAll,
        { user_id },
        { headers: getAuthHeaders() },
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
  async (cart_id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.cart.getById(cart_id), {
        headers: getAuthHeaders(),
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Fetch cart failed");
    }
  },
);
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { cart_id, product_id, variant_id, quantity },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post(
        ROUTES.cart.addItem,
        { cart_id, product_id, variant_id, quantity },
        { headers: getAuthHeaders() },
      );
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
        { headers: getAuthHeaders() },
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
        headers: getAuthHeaders(),
      });
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);
