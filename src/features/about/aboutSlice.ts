import { createSlice } from "@reduxjs/toolkit";
import { fetchAboutPage, updateAboutPage } from "./aboutThunk";

interface ContentSection {
  _id?: string;
  image: string;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  status: boolean;
}

interface MissionItem {
  _id?: string;
  icon: string;
  title: string;
  description: string;
  status: boolean;
}

interface AboutPageState {
  data: {
    title: string;
    description: string;
    contentSections: ContentSection[];
    missionSectionTitle: string;
    missionSectionDescription: string;
    missionItems: MissionItem[];
  } | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: AboutPageState = {
  data: null,
  loading: false,
  saving: false,
  error: null,
};

const aboutPageSlice = createSlice({
  name: "aboutpage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchAboutPage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAboutPage.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchAboutPage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // update
      .addCase(updateAboutPage.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateAboutPage.fulfilled, (state, action) => {
        state.saving = false;
        state.data = action.payload;
      })
      .addCase(updateAboutPage.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });
  },
});

export default aboutPageSlice.reducer;