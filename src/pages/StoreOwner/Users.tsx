import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import { AppDispatch, RootState } from "@/store";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { toast } from "sonner";

import {
  fetchUsers,
  deleteUser,
  bulkDeleteUsers,
} from "@/features/users/usersThunk";

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const { users, total, loading } = useSelector(
    (state: RootState) => state.users
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const limit = 5;

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const { user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role; // now you have userRole
  console.log("userRole", userRole)


  useEffect(() => {
    dispatch(fetchUsers({
      page,
      limit,
      search: debouncedQuery,
      role: userRole,
    }));
  }, [debouncedQuery, page, userRole, dispatch]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      toast.success("User deleted successfully.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user.");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await dispatch(bulkDeleteUsers(selectedIds)).unwrap();
      toast.success(`${selectedIds.length} users deleted successfully.`);
      setSelectedIds([]);
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete users.");
    }
  };

  const handleSelect = (id: string) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const handleDownload = async () => {
    try {
      const result = await dispatch(fetchUsers({ isDownload: true })).unwrap();
      const data = result.users.map((u: any) => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Status: u.status,
        CreatedAt: new Date(u.createdAt).toLocaleString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(blob, `users_${Date.now()}.xlsx`);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };

  // Updated getStatusBadge using is_active
  const getStatusBadge = (is_active: boolean) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
    >
      {is_active ? "Active" : "Inactive"}
    </span>
  );

  if (loading) return <div>Loading users...</div>;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 p-6 mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Users
          </h1>
          <p className="text-sm text-gray-500">Manage your users</p>
        </div>
        <div className="flex gap-2">
          <Link to="/users/add">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </Link>
          <Button
            onClick={handleDownload}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Search & Bulk Actions */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {selectedIds.length > 0 && (
            <ConfirmDialog
              title="Delete Selected Users"
              description={`This will delete ${selectedIds.length} selected users.`}
              confirmText="Delete All"
              onConfirm={handleBulkDelete}
              danger
            >
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Delete Selected
              </Button>
            </ConfirmDialog>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Users <span className="text-gray-400 font-normal">({total})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-50 text-gray-700 text-sm font-medium">
                <tr>
                  <th className="p-3 w-10 text-left">
                    <Checkbox
                      checked={selectedIds.length === users.length && users.length > 0}
                      onCheckedChange={(checked) =>
                        setSelectedIds(checked ? users.map((u) => u._id) : [])
                      }
                    />
                  </th>
                  <th className="p-3 w-48 text-left">Name</th>
                  <th className="p-3 w-48 text-left">Email</th>
                  <th className="p-3 w-32 text-left">Role</th>
                  <th className="p-3 w-32 text-left">Status</th>
                  <th className="p-3 w-24 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3">
                        <Checkbox
                          checked={selectedIds.includes(user._id)}
                          onCheckedChange={() => handleSelect(user._id)}
                        />
                      </td>

                      <td className="p-3 font-medium text-gray-900 truncate flex items-center gap-2">
                        {/* Profile Picture or Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {user.profile_picture ? (
                            <img
                              src={`${import.meta.env.VITE_API_URL_IMAGE}${user.profile_picture}`}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold">
                              {user.name?.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        {user.name}
                      </td>

                      <td className="p-3 truncate">{user.email}</td>
                      <td className="p-3">{user.role}</td>
                      <td className="p-3">{getStatusBadge(user.is_active)}</td>

                      <td className="p-3 flex justify-end gap-2">
                        <Link
                          to={`/users/${user._id}/edit`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded-md transition"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Link>

                        <ConfirmDialog
                          title="Delete User"
                          description={`This will permanently delete user "${user.name}".`}
                          confirmText="Delete"
                          onConfirm={() => handleDelete(user._id)}
                          danger
                        >
                          <button className="p-1 text-red-600 hover:bg-red-50 rounded-md transition">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </ConfirmDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-4 text-center text-gray-500"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded-md text-sm ${page === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
