// import { createAsyncThunk } from "@reduxjs/toolkit";
// import api from "../../services/api";
// import { ROUTES } from "../../services/routes";

// export const createOffer = createAsyncThunk(
//   "offer/createOffer",
//   async (data: any, { rejectWithValue }) => {
//     try {
//       const res = await api.post(ROUTES.offers.create, data);
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to create offer");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// export const fetchOffers = createAsyncThunk(
//   "offer/fetchOffers",
//   async (
//     params: {
//       page?: number;
//       limit?: number;
//       search?: string;
//       isDownload?: boolean;
//       status?: "active" | "inactive";
//     } = {},
//     { rejectWithValue }
//   ) => {
//     try {
//       const { isDownload = false, ...query } = params;
//       const res = await api.get(ROUTES.offers.getAll, {
//         params: { ...query, isDownload },
//       });
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to fetch offers");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// export const getOfferById = createAsyncThunk(
//   "offer/getOfferById",
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const res = await api.get(ROUTES.offers.getById(id));
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to fetch offer");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// export const updateOffer = createAsyncThunk(
//   "offer/updateOffer",
//   async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
//     try {
//       const res = await api.put(ROUTES.offers.update(id), data);
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to update offer");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// export const updateOfferStatus = createAsyncThunk(
//   "offer/updateOfferStatus",
//   async (
//     { id, status }: { id: string; status: "active" | "inactive" },
//     { rejectWithValue }
//   ) => {
//     try {
//       // ✅ uses dedicated /status route now
//       const res = await api.put(ROUTES.offers.updateStatus(id), { status });
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to update offer status");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// export const deleteOffer = createAsyncThunk(
//   "offer/deleteOffer",
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const res = await api.delete(ROUTES.offers.delete(id));
//       if (res.data.success) return id;
//       return rejectWithValue(res.data.message || "Failed to delete offer");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// export const bulkDeleteOffers = createAsyncThunk(
//   "offer/bulkDeleteOffers",
//   async (ids: string[], { rejectWithValue }) => {
//     try {
//       const res = await api.post(ROUTES.offers.bulkDelete, { ids });
//       if (res.data.success) return ids;
//       return rejectWithValue(res.data.message || "Failed to delete offers");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );