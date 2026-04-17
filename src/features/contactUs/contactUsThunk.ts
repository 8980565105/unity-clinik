import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

// Fetch all contact messages
export const fetchContactMessages = createAsyncThunk(
  "contactUs/fetchAll",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const res = await api.get(ROUTES.contactUs.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(
        res.data.message || "Failed to fetch contact messages",
      );
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// Get contact message by ID
export const getContactMessageById = createAsyncThunk(
  "contactUs/getById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.contactUs.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Contact message not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// Delete single contact message
export const deleteContactMessage = createAsyncThunk(
  "contactUs/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.contactUs.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete message");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);

// Bulk delete contact messages
export const bulkDeleteContactMessages = createAsyncThunk(
  "contactUs/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.contactUs.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete messages");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server error");
    }
  },
);
