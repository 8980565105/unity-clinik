
"use client";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
  fetchWishlistItems,
  deleteWishlistItem,
  bulkDeleteWishlistItems,
} from "@/features/wishlists/wishlistThunk";
import { ConfirmDialog } from "@/components/ui/confirmDialog";

export default function Wishlist() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: wishlists, total } = useSelector(
    (state: RootState) => state.wishlists,
  );

  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === "admin";
  const isStoreOwner = user?.role === "store_owner";

  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const limit = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setPage(1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchData = async () => {
      setTableLoading(true);
      try {
        await dispatch(
          fetchWishlistItems({ page, limit, search: debouncedQuery }),
        ).unwrap();
      } catch {
        toast.error("Failed to fetch wishlist.");
      } finally {
        setTableLoading(false);
      }
    };
    fetchData();
  }, [dispatch, page, debouncedQuery]);

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteWishlistItem(id)).unwrap();
      toast.success("Wishlist item deleted.");
      dispatch(fetchWishlistItems({ page, limit, search: debouncedQuery }));
    } catch {
      toast.error("Failed to delete item.");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await dispatch(bulkDeleteWishlistItems(selectedIds)).unwrap();
      toast.success("Selected items deleted.");
      setSelectedIds([]);
      dispatch(fetchWishlistItems({ page, limit, search: debouncedQuery }));
    } catch {
      toast.error("Bulk delete failed.");
    }
  };

  const handleDownload = async () => {
    try {
      const res = await dispatch(
        fetchWishlistItems({ isDownload: true }),
      ).unwrap();

      const data: any[] = [];
      res.wishlists.forEach((wishlist: any) => {
        wishlist.items.forEach((item: any) => {
          data.push({
            "User Name": wishlist.user_id?.name || "N/A",
            "User Email": wishlist.user_id?.email || "N/A",
            Product: item.product_id?.name || "N/A",
            Quantity: item.quantity || 1,
            "Unit Price": item.variant_id?.price || 0,
            Total: (item.quantity || 1) * (item.variant_id?.price || 0),
            "Added At": new Date(wishlist.createdAt).toLocaleString(),
          });
        });
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "WishlistItems");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buffer]), `wishlist_items_${Date.now()}.xlsx`);
    } catch {
      toast.error("Failed to export.");
    }
  };

  const totalPages = Math.ceil(total / limit);

  const grandTotal = wishlists.reduce((sum, wishlist) => {
    return (
      sum +
      wishlist.items.reduce((itemSum, item) => {
        return itemSum + (item.quantity || 1) * (item.variant_id?.price || 0);
      }, 0)
    );
  }, 0);

  const allItemIds = wishlists.flatMap((w) => w.items.map((item) => item._id));

  return (
    <div className="space-y-8 p-6 mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Wishlist
          </h1>
          <p className="text-sm text-gray-500">
            {isAdmin
              ? "Manage all customer wishlists"
              : "Manage customer wishlists products"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      <Card className="shadow-sm border border-gray-200">
        <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              ref={inputRef}
              placeholder="Search by user or product..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isAdmin && selectedIds.length > 0 && (
            <ConfirmDialog
              title="Delete Selected"
              description={`Delete ${selectedIds.length} items permanently.`}
              confirmText="Delete"
              onConfirm={handleBulkDelete}
              danger
            >
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" /> Delete Selected (
                {selectedIds.length})
              </Button>
            </ConfirmDialog>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            Wishlist Items{" "}
            {/* <span className="text-gray-400 font-normal">({total})</span> */}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200 relative">
            {tableLoading && (
              <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded-lg">
                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Loading...
                </div>
              </div>
            )}

            <table className="w-full text-sm table-fixed">
              <thead className="bg-gray-50 text-gray-700 text-sm font-medium">
                <tr>
                  {isAdmin && (
                    <th className="p-3 w-10 text-left">
                      <Checkbox
                        checked={
                          allItemIds.length > 0 &&
                          selectedIds.length === allItemIds.length
                        }
                        onCheckedChange={(checked) => {
                          setSelectedIds(checked ? allItemIds : []);
                        }}
                      />
                    </th>
                  )}
                  <th className="p-3 text-left">User</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Quantity</th>
                  <th className="p-3 text-left">Price</th>
                  <th className="p-3 text-left">Total</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!tableLoading && wishlists.length === 0 ? (
                  <tr>
                    <td
                      className="p-6 text-center text-gray-400"
                      colSpan={isAdmin ? 8 : 7}
                    >
                      No wishlist items found.
                    </td>
                  </tr>
                ) : (
                  wishlists.flatMap((w) =>
                    w.items.map((item) => (
                      <tr
                        key={item._id}
                        className="border-t hover:bg-gray-50"
                      >
                        {isAdmin && (
                          <td className="p-3">
                            <Checkbox
                              checked={selectedIds.includes(item._id)}
                              onCheckedChange={() =>
                                setSelectedIds((prev) =>
                                  prev.includes(item._id)
                                    ? prev.filter((id) => id !== item._id)
                                    : [...prev, item._id],
                                )
                              }
                            />
                          </td>
                        )}
                        <td className="p-3 truncate">{w.user_id?.name || "N/A"}</td>
                        <td className="p-3 truncate">{w.user_id?.email || "N/A"}</td>
                        <td className="p-3 truncate">
                          {item.product_id?.name || "N/A"}
                        </td>
                        <td className="p-3">{item.quantity || 1}</td>
                        <td className="p-3">
                          ₹{item.variant_id?.price?.toFixed(2) || "0.00"}
                        </td>
                        <td className="p-3">
                          ₹
                          {(
                            (item.quantity || 1) *
                            (item.variant_id?.price || 0)
                          ).toFixed(2)}
                        </td>
                        <td className="p-3 text-right">
                          <ConfirmDialog
                            title="Delete Item"
                            description="Are you sure you want to delete this wishlist item?"
                            confirmText="Delete"
                            onConfirm={() => handleDelete(item._id)}
                            danger
                          >
                            <button className="text-red-600 hover:bg-red-50 p-1 rounded">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </ConfirmDialog>
                        </td>
                      </tr>
                    )),
                  )
                )}
                {!tableLoading &&
                  wishlists.every((w) => w.items.length === 0) &&
                  wishlists.length > 0 && (
                    <tr>
                      <td
                        className="p-6 text-center text-gray-400"
                        colSpan={isAdmin ? 8 : 7}
                      >
                        No wishlist items found.
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>

          <div className="text-right mt-4 font-semibold text-lg">
            Grand Total: ₹{grandTotal.toFixed(2)}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-end gap-2 mt-4">
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
                  className={`px-3 py-1 rounded ${page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100"}`}
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