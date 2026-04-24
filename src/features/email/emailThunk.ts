import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchEmails = createAsyncThunk(
  "Emails/fetchEmails",
  async (
    params: { page?: number; limit?: number; search?: string; isDownload?: boolean,status?: "active" | "inactive"; } = {},
    { rejectWithValue }
  ) => {
    try {
      const { isDownload = false, ...query } = params;
      const res = await api.get(ROUTES.emails.getAll, { params: { ...query, isDownload } });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch emails");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);


export const getEmailsById = createAsyncThunk(
  "Emails/getEmailsById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.emails.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Brand not Emails");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const createEmails = createAsyncThunk(
  "Emails/createEmails",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.emails.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create Emails");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const updateEmails = createAsyncThunk(
  "Emails/updateEmails",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.emails.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update Emails");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const deleteEmails = createAsyncThunk(
  "Emails/deleteEmails",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.emails.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete Emails");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const bulkDeleteEmails = createAsyncThunk(
  "Emails/bulkDeleteEmails",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.emails.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete Emails");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
