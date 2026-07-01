// import { createSlice } from "@reduxjs/toolkit";
// import { fetchBookings, deleteBooking } from "./bookconsoltThunk";

// interface Booking {
//   _id: string;
//   phone: string;
//   type: string;
//   transaction_id?: string;
//   amount?: number;
//   createdAt: string;
// }

// interface BookingsState {
//   bookings: Booking[];
//   total: number;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: BookingsState = {
//   bookings: [],
//   total: 0,
//   loading: false,
//   error: null,
// };

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
//       });
//   },
// });

// export default bookconsaltansSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import {
  fetchBookings,
  deleteBooking,
  bulkDeleteBookings,
} from "./bookconsoltThunk";

interface Booking {
  _id: string;
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
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(bulkDeleteBookings.fulfilled, (state, action) => {
        const deletedIds = action.payload as string[];
        state.bookings = state.bookings.filter(
          (b) => !deletedIds.includes(b._id),
        );
        state.total = Math.max(0, state.total - deletedIds.length);
      });
  },
});

export default bookconsaltansSlice.reducer;
