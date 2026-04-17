import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

// ─── Fetch all reviews (Admin Panel / Store Owner Panel) ──────────────────────
export const fetchCustomerReviews = createAsyncThunk(
  "customerReviews/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      is_approved?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.customerReviews.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// ─── Get review by ID ─────────────────────────────────────────────────────────
export const getCustomerReviewById = createAsyncThunk(
  "customerReviews/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.customerReviews.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// ─── Update review status (approve / reject toggle) ──────────────────────────
export const updateReviewsStatus = createAsyncThunk(
  "customerReviews/updateReviewsStatus",
  async (
    { id, is_approved }: { id: string; is_approved: boolean },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.customerReviews.updateStatus(id), {
        is_approved,
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

// ─── Delete single review ─────────────────────────────────────────────────────
export const deleteCustomerReview = createAsyncThunk(
  "customerReviews/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.customerReviews.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// ─── Bulk delete reviews ──────────────────────────────────────────────────────
export const bulkDeleteCustomerReviews = createAsyncThunk(
  "customerReviews/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.customerReviews.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// ─── Create review (Frontend user submits review on product page) ─────────────
// store_owner_id is auto-resolved on backend from product_id.createdBy
// Frontend just sends: product_id, rating, title, comment
export const createCustomerReview = createAsyncThunk(
  "customerReviews/create",
  async (
    reviewData: {
      product_id: string;
      rating: number;
      title: string;
      comment?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.post(ROUTES.customerReviews.getAll, reviewData);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to submit review");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// ─── Fetch public reviews for a product (Frontend product page — no auth) ─────
// Uses public route: GET /customer-reviews/product/:product_id
export const fetchPublicProductReviews = createAsyncThunk(
  "customerReviews/fetchPublic",
  async (
    {
      product_id,
      page = 1,
      limit = 5,
    }: { product_id: string; page?: number; limit?: number },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(
        `${ROUTES.customerReviews.getAll}/product/${product_id}`,
        { params: { page, limit } },
      );
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch reviews");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);
