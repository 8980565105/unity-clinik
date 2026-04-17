import { createSlice } from "@reduxjs/toolkit";
import {
  fetchContactMessages,
  getContactMessageById,
  deleteContactMessage,
  bulkDeleteContactMessages,
} from "./contactUsThunk";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface ContactUsState {
  items: ContactMessage[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedItem: ContactMessage | null;
}

const initialState: ContactUsState = {
  items: [],
  total: 0,
  loading: false,
  error: null,
  selectedItem: null,
};

const contactUsSlice = createSlice({
  name: "contactUs",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchContactMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchContactMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.contacts || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchContactMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get by ID
      .addCase(getContactMessageById.fulfilled, (state, action) => {
        state.selectedItem = action.payload;
      })
      // Delete single
      .addCase(deleteContactMessage.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
      })
      // Bulk delete
      .addCase(bulkDeleteContactMessages.fulfilled, (state, action) => {
        state.items = state.items.filter(
          (item) => !action.payload.includes(item._id)
        );
      });
  },
});

export default contactUsSlice.reducer;
