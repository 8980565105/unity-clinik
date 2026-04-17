import { createSlice } from "@reduxjs/toolkit";
import {
  fetchUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  updateUserStatus,
} from "./usersThunk";

interface User {
  _id: string;
  name: string;
  email: string;
  is_active: boolean;
  role: string;
  profile_picture: string;
  createdAt: string;
  updatedAt: string;
}

interface UsersState {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedUser?: User;
}

const initialState: UsersState = {
  users: [],
  total: 0,
  loading: false,
  error: null,
  selectedUser: undefined,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.total = action.payload.total;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(getUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload);
        state.total += 1;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u._id === action.payload._id
        );
        if (index !== -1) state.users[index] = action.payload;
        if (state.selectedUser?._id === action.payload._id)
          state.selectedUser = action.payload;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (c) => c._id === action.payload._id
        );
        if (index !== -1) {
          state.users[index] = action.payload;
        }
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.total -= 1;
      })
      .addCase(bulkDeleteUsers.fulfilled, (state, action) => {
        state.users = state.users.filter(
          (u) => !action.payload.includes(u._id)
        );
        state.total -= action.payload.length;
      });
  },
});

export default usersSlice.reducer;
