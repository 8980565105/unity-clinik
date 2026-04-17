import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const fetchNavbar = createAsyncThunk(
  "navbar/fetchNavbar",
  async (params = {}, { rejectWithValue, getState }) => {
    if (Object.keys(params).length === 0) {
      const { navbar } = getState();
      if (
        Array.isArray(navbar.navbars) &&
        navbar.navbars.length > 0 &&
        !navbar.error
      ) {
        return { navbars: navbar.navbars, total: navbar.navbars.length };
      }
    }

    try {
      const res = await api.get(ROUTES.navbar.getPublic, { params });

      if (res.data.success) {
        const data = res.data.data;

        if (Array.isArray(data)) {
          return { navbars: data, total: data.length };
        }

        return { navbars: data.navbars || [], total: data.total || 0 };
      }

      return rejectWithValue(
        res.data.message || "Failed to fetch navbar items",
      );
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
);
