// // import { createSlice } from "@reduxjs/toolkit";
// // import { fetchReferralSettings } from "./reffrelThunk";

// // const initialState = {
// //   referrerPoints: 0,
// //   refereePoints: 0,
// //   walletOffers: [],
// //   loading: false,
// // };

// // const reffrelSlice = createSlice({
// //   name: "reffrel",
// //   initialState,
// //   reducers: {},
// //   extraReducers: (builder) => {
// //     builder
// //       .addCase(fetchReferralSettings.pending, (state) => {
// //         state.loading = true;
// //       })
// //       .addCase(fetchReferralSettings.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.referrerPoints = action.payload.referrerPoints;
// //         state.refereePoints = action.payload.refereePoints;
// //         state.walletOffers = (action.payload.walletOffers || [])
// //           .slice()
// //           .sort((a, b) => a.minAmount - b.minAmount); // low to high
// //       })
// //       .addCase(fetchReferralSettings.rejected, (state) => {
// //         state.loading = false;
// //       });
// //   },
// // });

// // export default reffrelSlice.reducer;
// import { createSlice } from "@reduxjs/toolkit";
// import { fetchReferralSettings } from "./reffrelThunk";

// const initialState = {
//   referrerPoints: 0,
//   refereePoints: 0,
//   walletOffers: [],
//   walletbox: [],
//   loading: false,
//   error: null,
// };

// const reffrelSlice = createSlice({
//   name: "reffrel",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchReferralSettings.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchReferralSettings.fulfilled, (state, action) => {
//         state.loading = false;
//         state.referrerPoints = action.payload.referrerPoints;
//         state.refereePoints = action.payload.refereePoints;
//         state.walletOffers = action.payload.walletOffers || [];
//         state.walletbox = action.payload.walletbox || [];
//       })
//       .addCase(fetchReferralSettings.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload;
//       });
//   },
// });

// export default reffrelSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import { fetchReferralSettings } from "./reffrelThunk";

const initialState = {
  referrerPoints: 0,
  refereePoints: 0,
  walletOffers: [],
  walletbox: [],
  points: [],
  faqs: [],
  loading: false,
  error: null,
};

const reffrelSlice = createSlice({
  name: "reffrel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReferralSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferralSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.referrerPoints = action.payload.referrerPoints;
        state.refereePoints = action.payload.refereePoints;
        state.walletOffers = action.payload.walletOffers || [];
        state.walletbox = action.payload.walletbox || [];
        state.points = action.payload.points || [];
        state.faqs = action.payload.faqs || [];
      })
      .addCase(fetchReferralSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default reffrelSlice.reducer;
