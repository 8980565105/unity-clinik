// // import { createAsyncThunk } from "@reduxjs/toolkit";
// // import api from "@/services/api";
// // import { ROUTES } from "@/services/routes";

// // // Fetch footer items
// // export const fetchFooter = createAsyncThunk(
// //   "footer/fetchFooter",
// //   async (params: { page?: number; limit?: number; search?: string;status?: "active" | "inactive"; } = {}, { rejectWithValue }) => {
// //     try {
// //       const res = await api.get(ROUTES.footer.getAll, { params });
// //       if (res.data.success) return res.data.data;
// //       return rejectWithValue(res.data.message || "Failed to fetch footer items");
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "Server Error");
// //     }
// //   }
// // );

// // // Get footer item by ID
// // export const getFooterItemById = createAsyncThunk(
// //   "footer/getFooterItemById",
// //   async (id: string, { rejectWithValue }) => {
// //     try {
// //       const res = await api.get(ROUTES.footer.getById(id));
// //       if (res.data.success) return res.data.data;
// //       return rejectWithValue(res.data.message || "Footer item not found");
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "Server Error");
// //     }
// //   }
// // );

// // // Create footer item
// // export const createFooterItem = createAsyncThunk(
// //   "footer/createFooterItem",
// //   async (data: any, { rejectWithValue }) => {
// //     try {
// //       const res = await api.post(ROUTES.footer.create, data);
// //       if (res.data.success) return res.data.data;
// //       return rejectWithValue(res.data.message || "Failed to create footer item");
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "Server Error");
// //     }
// //   }
// // );

// // // Update footer item
// // export const updateFooterItem = createAsyncThunk(
// //   "footer/updateFooterItem",
// //   async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
// //     try {
// //       const res = await api.put(ROUTES.footer.update(id), data);
// //       if (res.data.success) return res.data.data;
// //       return rejectWithValue(res.data.message || "Failed to update footer item");
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "Server Error");
// //     }
// //   }
// // );

// // // ✅ Update brand status
// // export const updateFooterItemStatus = createAsyncThunk(
// //   "footer/updateFooterItemStatus",
// //   async ({ id, status }: { id: string; status: "active" | "inactive" }, { rejectWithValue }) => {
// //     try {
// //       const res = await api.put(ROUTES.footer.updateStatus(id), { status });
// //       if (res.data.success) return res.data.data;
// //       return rejectWithValue(res.data.message || "Failed to update status");
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "Server Error");
// //     }
// //   }
// // );

// // // Delete footer item
// // export const deleteFooterItem = createAsyncThunk(
// //   "footer/deleteFooterItem",
// //   async (id: string, { rejectWithValue }) => {
// //     try {
// //       const res = await api.delete(ROUTES.footer.delete(id));
// //       if (res.data.success) return id;
// //       return rejectWithValue(res.data.message || "Failed to delete footer item");
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "Server Error");
// //     }
// //   }
// // );

// // // Bulk delete footer items
// // export const bulkDeleteFooterItems = createAsyncThunk(
// //   "footer/bulkDeleteFooterItems",
// //   async (ids: string[], { rejectWithValue }) => {
// //     try {
// //       const res = await api.post(ROUTES.footer.bulkDelete, { ids });
// //       if (res.data.success) return ids;
// //       return rejectWithValue(res.data.message || "Failed to delete footer items");
// //     } catch (err: any) {
// //       return rejectWithValue(err.response?.data?.message || "Server Error");
// //     }
// //   }
// // );



// import { createAsyncThunk } from "@reduxjs/toolkit";
// import api from "@/services/api";
// import { ROUTES } from "@/services/routes";

// // Fetch footer items (admin sees all, store_owner sees own)
// export const fetchFooter = createAsyncThunk(
//   "footer/fetchFooter",
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
//       const res = await api.get(ROUTES.footer.getAll, {
//         params: { ...query, isDownload },
//       });
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to fetch footer items");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// // Get footer item by ID
// export const getFooterItemById = createAsyncThunk(
//   "footer/getFooterItemById",
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const res = await api.get(ROUTES.footer.getById(id));
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Footer item not found");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// // Create footer item
// export const createFooterItem = createAsyncThunk(
//   "footer/createFooterItem",
//   async (data: any, { rejectWithValue }) => {
//     try {
//       const res = await api.post(ROUTES.footer.create, data);
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(
//         res.data.message || "Failed to create footer item"
//       );
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// // Update footer item
// export const updateFooterItem = createAsyncThunk(
//   "footer/updateFooterItem",
//   async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
//     try {
//       const res = await api.put(ROUTES.footer.update(id), data);
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(
//         res.data.message || "Failed to update footer item"
//       );
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// // Update footer status
// export const updateFooterItemStatus = createAsyncThunk(
//   "footer/updateFooterItemStatus",
//   async (
//     { id, status }: { id: string; status: "active" | "inactive" },
//     { rejectWithValue }
//   ) => {
//     try {
//       const res = await api.put(ROUTES.footer.updateStatus(id), { status });
//       if (res.data.success) return res.data.data;
//       return rejectWithValue(res.data.message || "Failed to update status");
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// // Delete footer item
// export const deleteFooterItem = createAsyncThunk(
//   "footer/deleteFooterItem",
//   async (id: string, { rejectWithValue }) => {
//     try {
//       const res = await api.delete(ROUTES.footer.delete(id));
//       if (res.data.success) return id;
//       return rejectWithValue(
//         res.data.message || "Failed to delete footer item"
//       );
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );

// // Bulk delete footer items
// export const bulkDeleteFooterItems = createAsyncThunk(
//   "footer/bulkDeleteFooterItems",
//   async (ids: string[], { rejectWithValue }) => {
//     try {
//       const res = await api.post(ROUTES.footer.bulkDelete, { ids });
//       if (res.data.success) return ids;
//       return rejectWithValue(
//         res.data.message || "Failed to delete footer items"
//       );
//     } catch (err: any) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   }
// );



import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

// ─── FETCH (admin/store_owner: protected; public: domain-based) ───────────────
export const fetchFooter = createAsyncThunk(
  "footer/fetchFooter",
  async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      isDownload?: boolean;
      status?: "active" | "inactive";
      isPublic?: boolean; // pass true for storefront (no auth)
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const { isDownload = false, isPublic = false, ...query } = params;

      // Public storefront uses /footer/public — domain header auto-resolved by server
      const url = isPublic ? ROUTES.footer.public : ROUTES.footer.getAll;

      const res = await api.get(url, {
        params: { ...query, isDownload },
      });

      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to fetch footer items");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ─── GET BY ID ────────────────────────────────────────────────────────────────
export const getFooterItemById = createAsyncThunk(
  "footer/getFooterItemById",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.get(ROUTES.footer.getById(id));
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Footer item not found");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ─── CREATE ───────────────────────────────────────────────────────────────────
// store_owner: backend auto-assigns their storeId
// admin: can optionally pass storeId in data
export const createFooterItem = createAsyncThunk(
  "footer/createFooterItem",
  async (data: { label: string; url: string; status?: string; storeId?: string }, { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.footer.create, data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to create footer item");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ─── UPDATE ───────────────────────────────────────────────────────────────────
export const updateFooterItem = createAsyncThunk(
  "footer/updateFooterItem",
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const res = await api.put(ROUTES.footer.update(id), data);
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update footer item");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ─── UPDATE STATUS ────────────────────────────────────────────────────────────
export const updateFooterItemStatus = createAsyncThunk(
  "footer/updateFooterItemStatus",
  async (
    { id, status }: { id: string; status: "active" | "inactive" },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.put(ROUTES.footer.updateStatus(id), { status });
      if (res.data.success) return res.data.data;
      return rejectWithValue(res.data.message || "Failed to update status");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ─── DELETE ───────────────────────────────────────────────────────────────────
export const deleteFooterItem = createAsyncThunk(
  "footer/deleteFooterItem",
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await api.delete(ROUTES.footer.delete(id));
      if (res.data.success) return id;
      return rejectWithValue(res.data.message || "Failed to delete footer item");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);

// ─── BULK DELETE ──────────────────────────────────────────────────────────────
export const bulkDeleteFooterItems = createAsyncThunk(
  "footer/bulkDeleteFooterItems",
  async (ids: string[], { rejectWithValue }) => {
    try {
      const res = await api.post(ROUTES.footer.bulkDelete, { ids });
      if (res.data.success) return ids;
      return rejectWithValue(res.data.message || "Failed to delete footer items");
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  }
);