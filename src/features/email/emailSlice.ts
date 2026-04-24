import { createSlice } from "@reduxjs/toolkit";
import {
  fetchEmails,
  createEmails,
  updateEmails,
  deleteEmails,
  bulkDeleteEmails,
} from "./emailThunk";

interface Email {
  _id: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface EmailsState {
  emails: Email[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: EmailsState = {
  emails: [],
  total: 0,
  loading: false,
  error: null,
};

const emailsSlice = createSlice({
  name: "email",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails = action.payload.emails;
        state.total = action.payload.total;
      })
      .addCase(fetchEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmails.fulfilled, (state, action) => {
        state.loading = false;
        state.emails.unshift(action.payload);
        state.total += 1;
      })
      .addCase(createEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateEmails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEmails.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.emails.findIndex((e) => e._id === action.payload._id);
        if (index !== -1) state.emails[index] = action.payload;
      })
      .addCase(updateEmails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(deleteEmails.fulfilled, (state, action) => {
        state.emails = state.emails.filter((e) => e._id !== action.payload);
        state.total -= 1;
      })

      .addCase(bulkDeleteEmails.fulfilled, (state, action) => {
        const deletedIds = action.payload as string[];
        state.emails = state.emails.filter((e) => !deletedIds.includes(e._id));
        state.total -= deletedIds.length;
      });
  },
});

export default emailsSlice.reducer;