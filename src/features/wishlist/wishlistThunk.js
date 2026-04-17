// D:\mycara\frontend\src\features\wishlist\wishlistThunk.js


import { createAsyncThunk } from "@reduxjs/toolkit";
import { ROUTES } from "../../services/routes";
import api from "../../services/api";


export const addToWishlist = createAsyncThunk(
  "wishlist/addToWishlist",
  async ({ user_id, product_id, variant_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        ROUTES.wishlist.addItem,
        { user_id, items: [{ product_id, variant_id }] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data.data.item;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const fetchWishlistByUser = createAsyncThunk(
  "wishlists/fetchWishlistByUser",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(ROUTES.wishlist.getByUser(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data;

      if (data.data) {
        return data.data;
      } else {
        return { items: [] };
      }

    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);


export const removeWishlistItem = createAsyncThunk(
  "wishlists/removeItem",
  async ({ wishlist_id, item_id }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.delete(ROUTES.wishlist.removeItem, {
        headers: { Authorization: `Bearer ${token}` },
       data: { wishlist_id, item_id },
      });
      return response.data.data; 
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Error removing item");
    }
  }
);



export const bulkDeleteWishlistItems = createAsyncThunk(
  "wishlists/bulkDeleteWishlistItems",
  async (ids, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token"); 
      const response = await api.post(
        ROUTES.wishlist.bulkDelete,
        { ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Bulk delete failed"
      );
    }
  }
);

