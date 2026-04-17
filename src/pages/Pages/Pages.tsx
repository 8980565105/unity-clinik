"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { GenericTable } from "@/components/ui/adminTable";
import {
  bulkDeletePages,
  deletePage,
  fetchPages,
  updatePageStatus,
} from "@/features/pages/pagesThunk";
import { useBasePath } from "@/hooks/useBasePath";

export default function Pages() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const columns = [
    { key: "page_name", label: "Page Name" },
    { key: "slug", label: "Slug" },
    {
      key: "description",
      label: "Description",
      render: (item: any) =>
        item.description?.length > 80
          ? item.description.substring(0, 80) + "..."
          : item.description || "-",
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: any) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
    },
  ];

  return (
    <GenericTable
      title="Pages"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      filters={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}
      fetchData={async ({ page, limit, search, status }) => {
        try {
          const res = await dispatch(
            fetchPages({ page, limit, search, status })
          ).unwrap();
          return { data: res.pages, total: res.total };
        } catch (err: any) {
          console.error("Failed to fetch pages:", err);
          throw new Error(err?.message || "Failed to fetch pages");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deletePage(id)).unwrap();
        } catch (err: any) {
          throw new Error(err?.message || "Failed to delete page");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeletePages(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err?.message || "Failed to delete pages");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updatePageStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err?.message || "Failed to update page status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/pages/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Page
          </Button>
        </Link>
      }
    />
  );
}
