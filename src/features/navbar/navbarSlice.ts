import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNavbar,
  createNavbarItem,
  updateNavbarItem,
  deleteNavbarItem,
  bulkDeleteNavbarItems,
  updateNavbarItemStatus,
} from "./navbarThunk";

interface NavbarItem {
  _id: string;
  label: string;
  url: string;
  icon?: string;
  order?: number;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
}

interface NavbarState {
  navbars: NavbarItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: NavbarState = {
  navbars: [],
  total: 0,
  loading: false,
  error: null,
};

const navbarSlice = createSlice({
  name: "navbar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNavbar.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNavbar.fulfilled, (state, action) => {
        state.loading = false;
        state.navbars = action.payload.navbars;
        state.total = action.payload.total;
      })
      .addCase(fetchNavbar.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createNavbarItem.fulfilled, (state, action) => {
        state.navbars.unshift(action.payload);
        state.total += 1;
      })

      .addCase(updateNavbarItem.fulfilled, (state, action) => {
        const index = state.navbars.findIndex(
          (i) => i._id === action.payload._id
        );
        if (index !== -1) state.navbars[index] = action.payload;
      })

      .addCase(updateNavbarItemStatus.fulfilled, (state, action) => {
        const index = state.navbars.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.navbars[index] = action.payload;
        }
      })

      .addCase(deleteNavbarItem.fulfilled, (state, action) => {
        state.navbars = state.navbars.filter((i) => i._id !== action.payload);
        state.total -= 1;
      })

      .addCase(bulkDeleteNavbarItems.fulfilled, (state, action) => {
        state.navbars = state.navbars.filter(
          (i) => !action.payload.includes(i._id)
        );
        state.total -= action.payload.length;
      });
  },
});

export default navbarSlice.reducer;
