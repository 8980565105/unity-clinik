import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

// export const fetchFooter = createAsyncThunk(
//   "footer/fetchFooter",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const res = await api.get(ROUTES.footer.getAll, { params });

//       if (res.data.success) {
//         return res.data.data;
//       }

//       return rejectWithValue(res.data.message || "Failed to fetch footer labels");
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
//   {
//     condition: (params = {}, { getState }) => {
//       if (params && Object.keys(params).length > 0) return true;

//       const { footer } = getState();
//       if (footer.loading) return false;
//       if (Array.isArray(footer.footers) && footer.footers.length > 0) {
//         return false;
//       }

//       return true;
//     },
//   }
// );

export const fetchFooter = createAsyncThunk(
  "footer/fetchFooter",
  async ({ isPublic = false, params = {} } = {}, { rejectWithValue }) => {
    try {
      const url = isPublic
        ? ROUTES.footer.public // "/footer/public"
        : ROUTES.footer.getAll; // "/footer"

      const res = await api.get(url, { params });

      if (res.data.success) {
        return res.data.data;
      }

      return rejectWithValue(res.data.message);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
