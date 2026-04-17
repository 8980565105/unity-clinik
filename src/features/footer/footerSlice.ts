// // import { createSlice } from "@reduxjs/toolkit";
// // import {
// //   bulkDeleteFooterItems,
// //   createFooterItem,
// //   deleteFooterItem,
// //   fetchFooter,
// //   updateFooterItem,
// //   updateFooterItemStatus,
// // } from "./footerThunk";

// // interface FooterItem {
// //   _id: string;
// //   label: string;
// //   url: string;
// //   order?: number;
// //   status: "active" | "inactive";
// //   createdAt: string;
// //   updatedAt: string;
// // }

// // interface FooterState {
// //   footers: FooterItem[];
// //   total: number;
// //   loading: boolean;
// //   error: string | null;
// // }

// // const initialState: FooterState = {
// //   footers: [],
// //   total: 0,
// //   loading: false,
// //   error: null,
// // };

// // const footerSlice = createSlice({
// //   name: "footer",
// //   initialState,
// //   reducers: {},
// //   extraReducers: (builder) => {
// //     builder
// //       // Fetch
// //       .addCase(fetchFooter.pending, (state) => {
// //         state.loading = true;
// //         state.error = null;
// //       })
// //       .addCase(fetchFooter.fulfilled, (state, action) => {
// //         state.loading = false;
// //         state.footers = action.payload.footers;
// //         state.total = action.payload.total;
// //       })
// //       .addCase(fetchFooter.rejected, (state, action) => {
// //         state.loading = false;
// //         state.error = action.payload as string;
// //       })

// //       // Create
// //       .addCase(createFooterItem.fulfilled, (state, action) => {
// //         state.footers.unshift(action.payload);
// //         state.total += 1;
// //       })

// //       // Update
// //       .addCase(updateFooterItem.fulfilled, (state, action) => {
// //         const index = state.footers.findIndex(
// //           (i) => i._id === action.payload._id
// //         );
// //         if (index !== -1) state.footers[index] = action.payload;
// //       })

// //       .addCase(updateFooterItemStatus.fulfilled, (state, action) => {
// //         const index = state.footers.findIndex(
// //           (c) => c._id === action.payload._id
// //         );
// //         if (index !== -1) {
// //           state.footers[index] = action.payload;
// //         }
// //       })

// //       // Delete
// //       .addCase(deleteFooterItem.fulfilled, (state, action) => {
// //         state.footers = state.footers.filter((i) => i._id !== action.payload);
// //         state.total -= 1;
// //       })

// //       // Bulk delete
// //       .addCase(bulkDeleteFooterItems.fulfilled, (state, action) => {
// //         state.footers = state.footers.filter(
// //           (i) => !action.payload.includes(i._id)
// //         );
// //         state.total -= action.payload.length;
// //       });
// //   },
// // });

// // export default footerSlice.reducer;

// import { createSlice } from "@reduxjs/toolkit";
// import {
//   bulkDeleteFooterItems,
//   createFooterItem,
//   deleteFooterItem,
//   fetchFooter,
//   updateFooterItem,
//   updateFooterItemStatus,
// } from "./footerThunk";

// interface FooterItem {
//   _id: string;
//   label: string;
//   url: string;
//   status: "active" | "inactive";
//   storeId?: string | null;
//   createdAt: string;
//   updatedAt: string;
// }

// interface FooterState {
//   footers: FooterItem[];
//   total: number;
//   loading: boolean;
//   error: string | null;
// }

// const initialState: FooterState = {
//   footers: [],
//   total: 0,
//   loading: false,
//   error: null,
// };

// const footerSlice = createSlice({
//   name: "footer",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       // Fetch
//       .addCase(fetchFooter.pending, (state) => {
//         state.loading = true;
//         state.error = null;
//       })
//       .addCase(fetchFooter.fulfilled, (state, action) => {
//         state.loading = false;
//         state.footers = action.payload.footers;
//         state.total = action.payload.total;
//       })
//       .addCase(fetchFooter.rejected, (state, action) => {
//         state.loading = false;
//         state.error = action.payload as string;
//       })

//       // Create
//       .addCase(createFooterItem.fulfilled, (state, action) => {
//         state.footers.unshift(action.payload);
//         state.total += 1;
//       })

//       // Update
//       .addCase(updateFooterItem.fulfilled, (state, action) => {
//         const index = state.footers.findIndex(
//           (i) => i._id === action.payload._id,
//         );
//         if (index !== -1) state.footers[index] = action.payload;
//       })

//       // Update Status
//       .addCase(updateFooterItemStatus.fulfilled, (state, action) => {
//         const index = state.footers.findIndex(
//           (c) => c._id === action.payload._id,
//         );
//         if (index !== -1) {
//           state.footers[index] = action.payload;
//         }
//       })

//       // Delete
//       .addCase(deleteFooterItem.fulfilled, (state, action) => {
//         state.footers = state.footers.filter((i) => i._id !== action.payload);
//         state.total -= 1;
//       })

//       // Bulk delete
//       .addCase(bulkDeleteFooterItems.fulfilled, (state, action) => {
//         state.footers = state.footers.filter(
//           (i) => !action.payload.includes(i._id),
//         );
//         state.total -= action.payload.length;
//       });
//   },
// });

// export default footerSlice.reducer;


import { createSlice } from "@reduxjs/toolkit";
import {
  bulkDeleteFooterItems,
  createFooterItem,
  deleteFooterItem,
  fetchFooter,
  updateFooterItem,
  updateFooterItemStatus,
} from "./footerThunk";

interface FooterItem {
  _id: string;
  label: string;
  url: string;
  status: "active" | "inactive";
  storeId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FooterState {
  footers: FooterItem[];
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: FooterState = {
  footers: [],
  total: 0,
  loading: false,
  error: null,
};

const footerSlice = createSlice({
  name: "footer",
  initialState,
  reducers: {
    clearFooterError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── Fetch ──────────────────────────────────────────────────────────────
      .addCase(fetchFooter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFooter.fulfilled, (state, action) => {
        state.loading = false;
        state.footers = action.payload.footers ?? [];
        state.total = action.payload.total ?? 0;
      })
      .addCase(fetchFooter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ── Create ─────────────────────────────────────────────────────────────
      .addCase(createFooterItem.fulfilled, (state, action) => {
        state.footers.unshift(action.payload);
        state.total += 1;
      })

      // ── Update ─────────────────────────────────────────────────────────────
      .addCase(updateFooterItem.fulfilled, (state, action) => {
        const index = state.footers.findIndex((i) => i._id === action.payload._id);
        if (index !== -1) state.footers[index] = action.payload;
      })

      // ── Update Status ──────────────────────────────────────────────────────
      .addCase(updateFooterItemStatus.fulfilled, (state, action) => {
        const index = state.footers.findIndex((c) => c._id === action.payload._id);
        if (index !== -1) state.footers[index] = action.payload;
      })

      // ── Delete ─────────────────────────────────────────────────────────────
      .addCase(deleteFooterItem.fulfilled, (state, action) => {
        state.footers = state.footers.filter((i) => i._id !== action.payload);
        state.total -= 1;
      })

      // ── Bulk Delete ────────────────────────────────────────────────────────
      .addCase(bulkDeleteFooterItems.fulfilled, (state, action) => {
        state.footers = state.footers.filter(
          (i) => !action.payload.includes(i._id)
        );
        state.total -= action.payload.length;
      });
  },
});

export const { clearFooterError } = footerSlice.actions;
export default footerSlice.reducer;