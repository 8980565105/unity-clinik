// store/payments/paymentsSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPayments,
  getPaymentById,
  deletePayment,
  bulkDeletePayments,
} from "./paymentsThunk";

interface Payment {
  _id: string;
  transaction_id: string;
  user_id: { name: string; email: string };
  discount_amount: number;
  amount_paid: number;
  status: string;
  payment_method: string;
  payment_date: string;
  updatedAt: string;
}

interface PaymentsState {
  payments: Payment[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedPayment?: Payment;
}

const initialState: PaymentsState = {
  payments: [],
  total: 0,
  loading: false,
  error: null,
  selectedPayment: undefined,
};

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.payments;
        state.total = action.payload.total;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get payment by ID
      .addCase(getPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedPayment = undefined;
      })
      .addCase(getPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPayment = action.payload;
      })
      .addCase(getPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Delete payment
      .addCase(deletePayment.fulfilled, (state, action) => {
        state.payments = state.payments.filter((p) => p._id !== action.payload);
        state.total -= 1;
      })

      // Bulk delete payments
      .addCase(bulkDeletePayments.fulfilled, (state, action) => {
        state.payments = state.payments.filter(
          (p) => !action.payload.includes(p._id),
        );
        state.total -= action.payload.length;
      });
  },
});

export default paymentsSlice.reducer;
