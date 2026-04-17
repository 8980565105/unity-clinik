import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

// Fetch products with pagination/search
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "active" | "inactive";
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.products.getAll, {
        params: { ...query, isDownload },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch products");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Get product by ID
export const getProductById = createAsyncThunk(
  "products/getProductById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.products.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Product not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Create product
export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.products.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create product");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Update product
export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.products.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update product");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ✅ Update product status
export const updateProductStatus = createAsyncThunk(
  "products/updateProductStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.products.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.products.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete product");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// Bulk delete products
export const bulkDeleteProducts = createAsyncThunk(
  "products/bulkDeleteProducts",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.products.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete products");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
