import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchPopups = createAsyncThunk(
  "popup/fetchPopups",
  async (
    params: { page?: number; limit?: number; search?: string; status?: "active" | "inactive"; isDownload?: boolean } = {},
    { rejectWithValue }
  ) => {
    try {
      const res = await api.get(ROUTES.popup.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch popups");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const getPopupById = createAsyncThunk(
  "popup/getPopupById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.popup.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Popup not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const createPopup = createAsyncThunk(
  "popup/createPopup",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.popup.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create popup");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const updatePopup = createAsyncThunk(
  "popup/updatePopup",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.popup.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update popup");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const updatePopupStatus = createAsyncThunk(
  "popup/updatePopupStatus",
  async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.popup.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const deletePopup = createAsyncThunk(
  "popup/deletePopup",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.popup.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete popup");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const bulkDeletePopups = createAsyncThunk(
  "popup/bulkDeletePopups",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.popup.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete popups");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);
