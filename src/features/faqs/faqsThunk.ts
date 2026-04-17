import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchFaqs = createAsyncThunk(
  "faqs/fetchFaqs",
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
      const res = await api.get(ROUTES.faqs.getAll, { params });

      if (res.data.success) {
        localStorage.setItem("faqs_backup", JSON.stringify(res.data.data));
        return res.data.data;
      }

      return rejectWithValue("Failed to fetch FAQs");
    } catch (err: any) {
      const backup = localStorage.getItem("faqs_backup");
      if (backup) {
        return JSON.parse(backup);
      }

      return rejectWithValue("Server Error");
    }
  },
);

export const getFaqsById = createAsyncThunk(
  "faqs/getFaqById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.faqs.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue("FAQ not found");
    } catch (err: any) {
      return rejectWithValue("Server Error");
    }
  },
);

export const createFaqs = createAsyncThunk(
  "faqs/createFaq",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.faqs.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create FAQ");
    } catch {
      return rejectWithValue("Server Error");
    }
  },
);

export const updateFaqs = createAsyncThunk(
  "faqs/updateFaq",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.faqs.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue("Failed to update FAQ");
    } catch {
      return rejectWithValue("Server Error");
    }
  },
);

export const updateFaqsStatus = createAsyncThunk(
  "faqs/updateStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.faqs.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue("Failed to update status");
    } catch {
      return rejectWithValue("Server Error");
    }
  },
);

export const deleteFaqs = createAsyncThunk(
  "faqs/deleteFaq",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.faqs.delete(id));
      if (res.data.success) return id;
      return rejectWithValue("Delete failed");
    } catch {
      return rejectWithValue("Server Error");
    }
  },
);

export const bulkDeleteFaqs = createAsyncThunk(
  "faqs/bulkDelete",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.faqs.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue("Bulk delete failed");
    } catch {
      return rejectWithValue("Server Error");
    }
  },
);

export const saveFaqBanner = createAsyncThunk(
  "faqs/saveBanner",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.faqs.saveBanner, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.success) return res.data.data;
      return rejectWithValue("Failed to save banner");
    } catch {
      return rejectWithValue("Server Error");
    }
  },
);

export const getFaqBanner = createAsyncThunk(
  "faqs/getBanner",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.faqs.getBanner);
      if (res.data.success) return res.data.data;
      return rejectWithValue("Failed to fetch banner");
    } catch {
      return rejectWithValue("Server Error");
    }
  },
);
