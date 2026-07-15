import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useBasePath } from "@/hooks/useBasePath";

import { AppDispatch, RootState } from "@/store";
import {
  fetchUsers,
  deleteUser,
  bulkDeleteUsers,
  updateUserStatus,
} from "@/features/users/usersThunk";
import { GenericTable } from "@/components/ui/adminTable";

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";

  const columns = [
    {
      key: "name",
      label: "Name",
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            {item.profile_picture ? (
              <img
                src={`${import.meta.env.VITE_API_URL_IMAGE}/uploads/${item.profile_picture}`}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold">
                {item.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {item.name}
        </div>
      ),
    },
    { key: "email", label: "Email" },
    { key: "mobile_number", label: "phone" },
    { key: "authProvider", label: "Type" },
    { key: "role", label: "Role" },

  ];

  return (
    <GenericTable
      title="Users"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      viewEnabled={true}
      viewPath={(item: any) => `${basePath}/users/${item._id}/view`}
      editEnabled={isAdmin}
      filters={[
        { label: "Active", value: "true" },
        { label: "Inactive", value: "false" },
        { label: "Email User", value: "email" },
        { label: "Google User", value: "google" },
        { label: "Phone User", value: "phone" },
      ]}

      fetchData={async ({ page, limit, search, status }) => {
        const isActiveFilter = ["true", "false"].includes(status || "");
        const boolStatus = isActiveFilter
          ? status === "true"
          : undefined;
        const authProvider =
          !isActiveFilter && status ? status : undefined;

        try {
          const res = await dispatch(
            fetchUsers({
              page,
              limit,
              search,
              is_active: boolStatus,
              authProvider,
            })
          ).unwrap();

          const usersWithStatus = res.users.map((user: any) => ({
            ...user,
            status: user.is_active ? "active" : "inactive",
          }));

          return { data: usersWithStatus, total: res.total };
        } catch (err: any) {
          console.error("fetchData error:", err);
          throw new Error(err || "Failed to load users");
        }
      }}

      deleteItem={async (id) => {
        try {
          await dispatch(deleteUser(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete user");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteUsers(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete users");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateUserStatus({
              id,
              is_active: Boolean(newStatus),
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err?.message || "Failed to update status");
        }
      }}
      headerActions={
        <>
          <Link to={`${basePath}/users/add`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </Link>
        </>
      }
    />
  );
}

