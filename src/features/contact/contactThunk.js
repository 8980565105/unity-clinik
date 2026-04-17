// import { createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../services/api";
// import { ROUTES } from "../../services/routes";

// // Fetch navbar items
// export const fetchContact = createAsyncThunk(
//   "contact-us/fetchContact",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const res = await api.get(ROUTES.contact.getAll, { params });

//       if (res.data.success) {
//         return res.data.data; 
//       }

//       return rejectWithValue(res.data.message || "Failed to fetch contact");
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// export const createContact = createAsyncThunk(
//   "contact-us/createContact",
//   async (formData, { rejectWithValue }) => {
//     try {
//       const res = await api.post(ROUTES.contact.getAll, formData);
//       return res.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response.data);
//     }
//   }
// );

import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchContact = createAsyncThunk(
  "contact-us/fetchContact",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.contact.getAll, { params });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch contact");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

export const createContact = createAsyncThunk(
  "contact-us/createContact",
  async (formData, { rejectWithValue }) => {
    try {
      // ── No auth header needed — public route ─────────────────────────────
      const res = await api.post(ROUTES.contact.getAll, formData);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to submit");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Server Error");
    }
  }
);