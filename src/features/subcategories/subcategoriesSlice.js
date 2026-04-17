    import { createSlice } from "@reduxjs/toolkit";
    import { fetchsubCategories } from "./subcategoriesThunk";
    const initialState = {
    items: [],
    loading: false,
    error: null,
    };

    const subcategorySlice = createSlice({
    name: "subcategories",
    initialState,
    reducers: {
        clearsubCategories(state) {
        state.items = [];
        state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchsubCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchsubCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload.subcategories || [];
        })
        .addCase(fetchsubCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
    });
    export const { clearsubCategories } = subcategorySlice.actions;
    export default subcategorySlice.reducer;
