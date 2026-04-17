import { createSlice } from "@reduxjs/toolkit";
import { fetchMe, updateMe } from "./profileThunk";

interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
}

interface MeUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  profile_picture?: string;
  mobile_number?: string;
  gender?: string;
  date_of_birth?: string;
  address?: Address;
  createdAt: string;
  updatedAt: string;
}

interface MeState {
  user: MeUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: MeState = {
  user: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile(state) {
      state.user = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ Fetch Me
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Update Me
      .addCase(updateMe.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;
