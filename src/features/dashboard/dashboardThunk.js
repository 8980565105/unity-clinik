import { createAsyncThunk } from "@reduxjs/toolkit";
import { ROUTES } from "../../services/routes";
import api from "../../services/api";

// export const fetchDashboard = createAsyncThunk(
//   "dashboard/fetchDashboard",
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("Dashboard API HIT");
//       const res = await api.get(ROUTES.dashboard.get);

//       if (res.data.success) {
//         return res.data.data;
//       }
//       return rejectWithValue(res.data.message || "Failed to fetch dashboard");
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || "Server Error");
//     }
//   },
// );

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Dashboard API HIT");
      const res = await api.get(ROUTES.dashboard.get);

      if (res.data.success) {
        return res.data.data;
      }
      return rejectWithValue(res.data.message || "Failed to fetch dashboard");
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Server Error");
    }
  },
  // ✅ આ option add કરો
  {
    condition: (_, { getState }) => {
      const { totalUsers } = getState().dashboard;
      // જો data પહેલેથી છે તો API call CANCEL થશે
      if (totalUsers) return false;
      return true;
    },
  },
);
