
import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { products } = getState();
      if (
        Array.isArray(products.products) &&
        products.products.length > 0 &&
        !products.error
      ) {
        return { products: products.products, total: products.products.length };
      }
    }

    try {
      const queryParams = {
        page: 1,
        limit: 50,
        status: "active",
        ...params,
      };

      const res = await api.get(ROUTES.products.getPublic, { params: queryParams });

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          return { products: data, total: data.length };
        }

        return {
          products: data.products || [],
          total: data.total || 0,
          page: data.page || 1,
          pages: data.pages || 1,
        };
      }

      return rejectWithValue(res.data.message || "Failed to fetch products");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.products.getPublicById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch product");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);