import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBookings,
  deleteBooking,
  bulkDeleteBookings,
  fetchBookingById,
  updateBooking,
} from "./bookconsoltThunk";

interface Booking {
  _id: string;
  name?: string | null;
  email?: string | null;
  message?: string | null;
  phone: string;
  type: string;
  transaction_id?: string;
  amount?: number;
  product_id?: any;
  product_title?: string;
  slot_date?: string | null;
  slot_time?: string | null;
  slot_duration?: number | null;
  slot_status?: "pending" | "confirmed";
  createdAt: string;
  updatedAt: string;
}

interface BookingsState {
  bookings: Booking[];
  total: number;
  loading: boolean;
  error: string | null;
  singleBooking: Booking | null;
  singleLoading: boolean;
}

const initialState: BookingsState = {
  bookings: [],
  total: 0,
  loading: false,
  error: null,
  singleBooking: null,
  singleLoading: false,
};

// const bookconsaltansSlice = createSlice({
//   name: "bookconsaltans",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchBookings.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchBookings.fulfilled, (state, action) => {
//         state.loading = false;
//         state.bookings = action.payload.bookings;
//         state.total = action.payload.total;
//       })
//       .addCase(fetchBookings.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })
//       .addCase(deleteBooking.fulfilled, (state, action) => {
//         state.bookings = state.bookings.filter((b) => b._id !== action.payload);
//         state.total = Math.max(0, state.total - 1);
//       })
//       .addCase(bulkDeleteBookings.fulfilled, (state, action) => {
//         const deletedIds = action.payload as string[];
//         state.bookings = state.bookings.filter(
//           (b) => !deletedIds.includes(b._id),
//         );
//         state.total = Math.max(0, state.total - deletedIds.length);
//       })
//       .addCase(fetchBookingById.pending, (state) => {
//         state.singleLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchBookingById.fulfilled, (state, action) => {
//         state.singleLoading = false;
//         state.singleBooking = action.payload;
//       })
//       .addCase(fetchBookingById.rejected, (state, action) => {
//         state.singleLoading = false;
//         state.error = action.payload as string;
//       })
//       .addCase(fetchBookingById.rejected, (state, action) => {
//         state.singleLoading = false;
//         state.error = action.payload as string;
//       })
//       // .addCase(updateBooking.pending, (state) => {
//       //   state.singleLoading = true;
//       //   state.error = null;
//       // })
//       // .addCase(updateBooking.fulfilled, (state, action) => {
//       //   state.singleLoading = false;
//       //   state.singleBooking = action.payload;
//       //   state.bookings = state.bookings.map((b) =>
//       //     b._id === action.payload._id ? action.payload : b,
//       //   );
//       // })
//       // .addCase(updateBooking.rejected, (state, action) => {
//       //   state.singleLoading = false;
//       //   state.error = action.payload as string;
//       // });
//   },
// });

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
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(bulkDeleteBookings.fulfilled, (state, action) => {
        const deletedIds = action.payload as string[];
        state.bookings = state.bookings.filter(
          (b) => !deletedIds.includes(b._id),
        );
        state.total = Math.max(0, state.total - deletedIds.length);
      })
      .addCase(fetchBookingById.pending, (state) => {
        state.singleLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingById.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleBooking = action.payload;
      })
      .addCase(fetchBookingById.rejected, (state, action) => {
        state.singleLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBooking.pending, (state) => {
        state.singleLoading = true;
        state.error = null;
      })
      .addCase(updateBooking.fulfilled, (state, action) => {
        state.singleLoading = false;
        state.singleBooking = action.payload;
        state.bookings = state.bookings.map((b) =>
          b._id === action.payload._id ? action.payload : b,
        );
      })
      .addCase(updateBooking.rejected, (state, action) => {
        state.singleLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default bookconsaltansSlice.reducer;
