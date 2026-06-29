import { createSlice } from "@reduxjs/toolkit";
import { fetchBookings, deleteBooking } from "./bookconsoltThunk";

interface Booking {
  _id: string;
  phone: string;
  type: string;
  transaction_id?: string;
  amount?: number;
  createdAt: string;
}

interface BookingsState {
  bookings: Booking[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  total: 0,
  loading: false,
  error: null,
};

const bookconsaltansSlice = createSlice({
  name: "bookconsaltans",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.bookings = action.payload.bookings;
        state.total = action.payload.total;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBooking.fulfilled, (state, action) => {
        state.bookings = state.bookings.filter((b) => b._id !== action.payload);
      });
  },
});

export default bookconsaltansSlice.reducer;
