import { createSlice } from "@reduxjs/toolkit";
import { createEmails } from "./emailsThunk";

const emailsSlice = createSlice({
  name: "emails",
  initialState: {
    loading: false,
    error: null,
    success: false,
  },
  reducers: {
    resetemailsStatus: (state) => {
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmails.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })

      .addCase(createEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetemailsStatus } = emailsSlice.actions;
export default emailsSlice.reducer;
