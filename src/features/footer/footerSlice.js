import { createSlice } from "@reduxjs/toolkit";
import { fetchFooter } from "./footerThunk";

const initialState = {
  footers: [],
  total: 0,
  loading: false,
  error: null,
};

const footerSlice = createSlice({
  name: "footer",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFooter.fulfilled, (state, action) => {
        state.loading = false;
        state.footers = action.payload.footers;
        state.total = action.payload.total;
      })
      .addCase(fetchFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default footerSlice.reducer;
