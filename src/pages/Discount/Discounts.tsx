import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit2, Trash2, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useBasePath } from "@/hooks/useBasePath";
import { AppDispatch, RootState } from "@/store";


import {
  fetchDiscounts,
  deleteDiscount,
  bulkDeleteDiscounts,
  updateDiscountStatus,
} from "@/features/discounts/discountsThunk";
import { GenericTable } from "@/components/ui/adminTable";

export default function Discounts() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const columns = [
    { key: "name", label: "Name" },
    { key: "code", label: "Code" },
    { key: "type", label: "Type" },
    {
      key: "value",
      label: "Value",
      render: (item: any) =>
        item.type === "percentage" ? `${item.value}%` : item.value,
    },
    {
      key: "start_date",
      label: "Start Date",
      render: (item: any) =>
        item.start_date ? new Date(item.start_date).toLocaleDateString() : "-",
    },
    {
      key: "end_date",
      label: "End Date",
      render: (item: any) =>
        item.end_date ? new Date(item.end_date).toLocaleDateString() : "-",
    },
  ];

  return (
    <GenericTable
      title="Discounts"
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
            fetchDiscounts({ page, limit, search, status })
          ).unwrap();
          return { data: res.discounts, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load discounts");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteDiscount(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete brand");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteDiscounts(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete discounts");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateDiscountStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/discounts/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Discounts
          </Button>
        </Link>
      }
    />
  );
}
