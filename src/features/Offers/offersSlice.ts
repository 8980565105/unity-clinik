// import { createSlice } from "@reduxjs/toolkit";
// import {
//   fetchOffers,
//   createOffer,
//   getOfferById,
//   updateOffer,
//   updateOfferStatus,
//   deleteOffer,
//   bulkDeleteOffers,
// } from "./offersThunk";

// const offersSlice = createSlice({
//   name: "offers",
//   initialState: {
//     offers: [] as any[],
//     total: 0,
//     loading: false,
//     error: null as string | null,
//   },
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // Fetch Offers
//       .addCase(fetchOffers.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchOffers.fulfilled, (state, action) => {
//         state.loading = false;
//         state.offers = action.payload.offers;
//         state.total = action.payload.total;
//       })
//       .addCase(fetchOffers.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })

//       // Create Offer
//       .addCase(createOffer.fulfilled, (state, action) => {
//         state.offers.unshift(action.payload);
//         state.total += 1;
//       })

//       // Update Offer
//       .addCase(updateOffer.fulfilled, (state, action) => {
//         const index = state.offers.findIndex(
//           (o) => o._id === action.payload._id
//         );
//         if (index !== -1) state.offers[index] = action.payload;
//       })

//       // Update Offer Status
//       .addCase(updateOfferStatus.fulfilled, (state, action) => {
//         const index = state.offers.findIndex(
//           (o) => o._id === action.payload._id
//         );
//         if (index !== -1) state.offers[index] = action.payload;
//       })

//       // Get Offer By Id
//       .addCase(getOfferById.fulfilled, (state, action) => {
//         const index = state.offers.findIndex(
//           (o) => o._id === action.payload._id
//         );
//         if (index !== -1) {
//           state.offers[index] = action.payload;
//         } else {
//           state.offers.unshift(action.payload);
//           state.total += 1;
//         }
//       })
//       .addCase(getOfferById.rejected, (state, action) => {
//         state.error = action.payload as string;
//       })

//       // Delete Offer
//       .addCase(deleteOffer.fulfilled, (state, action) => {
//         state.offers = state.offers.filter((o) => o._id !== action.payload);
//         state.total -= 1;
//       })

//       // Bulk Delete
//       .addCase(bulkDeleteOffers.fulfilled, (state, action) => {
//         const deletedIds = action.payload as string[];
//         state.offers = state.offers.filter(
//           (o) => !deletedIds.includes(o._id)
//         );
//         state.total -= deletedIds.length;
//       });
//   },
// });

// export default offersSlice.reducer;