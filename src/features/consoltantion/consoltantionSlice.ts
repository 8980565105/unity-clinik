import { createSlice } from "@reduxjs/toolkit";
import {
  fetchConsultationPage,
  updateConsultationPage,
} from "./consoltantionThunk";

interface ConsultationState {
  data: any | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: ConsultationState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
};

const consultationSlice = createSlice({
  name: "consultationpage",
  initialState,
  reducers: {},
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
        state.error = action.payload as string;
      })
      .addCase(updateConsultationPage.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateConsultationPage.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateConsultationPage.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export default consultationSlice.reducer;
