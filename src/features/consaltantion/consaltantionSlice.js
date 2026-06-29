import { createSlice } from "@reduxjs/toolkit";
import { fetchConsultationPage } from "./consaltantionThunk";

const initialState = {
  data: null,
  loading: false,
  error: null,
};

const consultationPageSlice = createSlice({
  name: "consultationPage",
  initialState,
  reducers: {
    clearConsultationPage: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConsultationPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsultationPage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchConsultationPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearConsultationPage } = consultationPageSlice.actions;
export default consultationPageSlice.reducer;
