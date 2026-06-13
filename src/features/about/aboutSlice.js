import { createSlice } from "@reduxjs/toolkit";
import { fetchabout } from "./aboutThunk";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchabout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchabout.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchabout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default aboutSlice.reducer;