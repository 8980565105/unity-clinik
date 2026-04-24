import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";
import { ROUTES } from "../../services/routes";

export const createEmails = createAsyncThunk(
  "Emails/createEmails",
  async (emailData, { rejectWithValue }) => {
    try {
      const response = await api.post(ROUTES.emails.create, emailData);
      return response.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit email"
      );
    }
  }
);