import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      role?: string;
      is_active?: boolean;
    } = {},
    { rejectWithValue },
  ) => {
    try {
      const { role, ...query } = params;
      const queryParams: Record<string, any> = { ...query };
      if (query.is_active !== undefined) {
        queryParams.is_active = query.is_active.toString();
      }
      const url = ROUTES.users.getAll;
      const res = await api.get(url, { params: queryParams });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch users");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.users.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "User not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const createUser = createAsyncThunk(
  "users/createUser",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.users.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create user");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.users.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update user");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const updateUserStatus = createAsyncThunk(
  "users/updateUserStatus",
  async (
    { id, is_active }: { id: string; is_active?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const res = await api.put(ROUTES.users.updateStatus(id), { is_active });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.users.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete user");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);

export const bulkDeleteUsers = createAsyncThunk(
  "users/bulkDeleteUsers",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.users.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete users");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
