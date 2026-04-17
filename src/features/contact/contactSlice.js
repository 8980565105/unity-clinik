import { createSlice } from "@reduxjs/toolkit";
import { fetchContact } from "./contactThunk";

const initialState = {
  contact: [],
  total: 0,
  loading: false,
  error: null,
};

const contactSlice = createSlice({
  name: "contact",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContact.fulfilled, (state, action) => {
        state.loading = false;
        state.contact = action.payload.contact;
        state.total = action.payload.total;
      })
      .addCase(fetchContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Something went wrong";
      });
  },
});

export default contactSlice.reducer;
