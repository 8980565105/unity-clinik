import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";
export const fetchFooter = createAsyncThunk(
  "footer/fetchFooter",
  async ({ isPublic = false, params = {} } = {}, { rejectWithValue }) => {
    try {
      const url = isPublic
        ? ROUTES.footer.public 
        : ROUTES.footer.getAll; 

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
