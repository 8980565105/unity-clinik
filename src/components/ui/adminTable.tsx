import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Link } from "react-router-dom";
import { Edit, Eye, Trash } from "lucide-react";
import { useBasePath } from "@/hooks/useBasePath";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  width?: string;
  exportValue?: (item: T) => any;
}

interface GenericTableProps<T> {
  title: string;
  fetchData: (params: any) => Promise<{ data: T[]; total: number }>;
  deleteItem?: (id: string) => Promise<any>;
  bulkDeleteItems?: (ids: string[]) => Promise<any>;
  columns: Column<T>[];
  rowKey: keyof T;
  searchEnabled?: boolean;
  filters?: { label: string; value: string }[];
  headerActions?: React.ReactNode;
  pageSize?: number;
  rowActions?: (item: T) => React.ReactNode;
  statusToggleEnabled?: boolean;
  onStatusToggle?: (id: string, newStatus: boolean) => Promise<void>;
  editEnabled?: boolean;
  statusKey?: string;
  showActionsColumn?: boolean;
  viewEnabled?: boolean;
  viewPath?: (item: T) => string;
}

export function GenericTable<T extends Record<string, any>>({
  title,
  fetchData,
  deleteItem,
  bulkDeleteItems,
  columns,
  rowKey,
  searchEnabled = true,
  filters,
  headerActions,
  pageSize = 10,
  rowActions,
  onStatusToggle,
  statusToggleEnabled = false,
  editEnabled = true,
  statusKey = "status",
  showActionsColumn = true,
  viewEnabled = false,
  viewPath,
}: GenericTableProps<T>) {
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const basePath = useBasePath();
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await fetchData({
        page,
        limit: pageSize,
        search: debouncedQuery,
        status: statusFilter,
      });

      if (result.data.length === 0 && page > 1) {
        setPage(page - 1);
      } else {
        setData(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [debouncedQuery, page, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!deleteItem) return;
    try {
      await deleteItem(id);
      toast.success("Deleted successfully");
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete item");
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length || !bulkDeleteItems) return;
    try {
      await bulkDeleteItems(selectedIds);
      toast.success(`${selectedIds.length} items deleted`);
      setSelectedIds([]);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete items");
    }
  };

  const getStatusChecked = (item: T): boolean => {
    const val = item[statusKey];
    if (typeof val === "boolean") return val;
    return val === "active";
  };

  const handleStatusToggle = async (item: T) => {
    if (!onStatusToggle) return;
    const currentStatus = getStatusChecked(item);
    const newStatus = !currentStatus;
    try {
      await onStatusToggle(item[rowKey] as string, newStatus);
      toast.success(`Status updated to ${newStatus ? "Active" : "Inactive"}`);
      loadData();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    }
  };

  const totalPages = Math.ceil(total / pageSize);
  const extraCols =
    (bulkDeleteItems ? 1 : 0) +
    (statusToggleEnabled ? 1 : 0) +
    (showActionsColumn ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-gray-500 mt-1">
            Manage and organize your {title.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {headerActions}
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const result = await fetchData({ isDownload: true });
                const exportData = (result.data || []).map((item: any) =>
                  columns.reduce(
                    (acc, col) => {
                      acc[col.label] = col.exportValue
                        ? col.exportValue(item)
                        : col.render
                          ? item[col.key]
                          : item[col.key];
                      return acc;
                    },
                    {} as Record<string, any>
                  )
                );

                const ws = XLSX.utils.json_to_sheet(exportData);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, title);
                const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
                saveAs(new Blob([buf]), `${title}_${Date.now()}.xlsx`);
                toast.success("Exported successfully");
              } catch (err: any) {
                toast.error(err?.message || "Export failed");
              }
            }}
          >
            Export
          </Button>

          {bulkDeleteItems && selectedIds.length > 0 && (
            <ConfirmDialog
              title="Delete Selected"
              description={`Delete ${selectedIds.length} selected items?`}
              confirmText="Delete All"
              onConfirm={handleBulkDelete}
              danger
            >
              <Button variant="destructive">Delete Selected</Button>
            </ConfirmDialog>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 items-center">
        {searchEnabled && (
          <Input
            placeholder={`Search ${title}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm bg-input border-border text-foreground"
          />
        )}
        {filters && (
          <Select
            value={statusFilter || "all"}
            onValueChange={(val) => setStatusFilter(val === "all" ? "" : val)}
          >
            <SelectTrigger className="w-[180px] bg-input border-border text-foreground">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border text-popover-foreground">
              <SelectItem value="all">All</SelectItem>
              {filters.map((f) => (
                <SelectItem key={f.value} value={f.value}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="overflow-x-auto border border-border rounded-lg bg-card shadow-sm">
        <table className="w-full table-fixed text-sm text-foreground">
          <thead className="bg-table-header text-muted-foreground border-b border-border">
            <tr>
              {bulkDeleteItems && (
                <th className="w-10 p-3 text-center">
                  <Checkbox
                    checked={
                      selectedIds.length === data.length && data.length > 0
                    }
                    onCheckedChange={(checked) =>
                      setSelectedIds(
                        checked ? data.map((d) => d[rowKey] as string) : []
                      )
                    }
                  />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.key} className={`p-3 text-left font-medium ${col.width || ""}`}>
                  {col.label}
                </th>
              ))}
              {statusToggleEnabled && (
                <th className="w-20 p-3 text-center font-medium">Status</th>
              )}
              {showActionsColumn && (
                <th className="w-28 p-3 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + extraCols}
                  className="p-6 text-center text-muted-foreground"
                >
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + extraCols}
                  className="p-6 text-center text-muted-foreground"
                >
                  No records found
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item[rowKey]} className="hover:bg-table-hover transition-colors">
                  {bulkDeleteItems && (
                    <td className="p-3 text-center">
                      <Checkbox
                        checked={selectedIds.includes(item[rowKey] as string)}
                        onCheckedChange={() =>
                          setSelectedIds((prev) =>
                            prev.includes(item[rowKey] as string)
                              ? prev.filter((i) => i !== item[rowKey])
                              : [...prev, item[rowKey] as string]
                          )
                        }
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="p-3 truncate text-foreground">
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                  {statusToggleEnabled && (
                    <td className="p-3 text-center">
                      <Switch
                        checked={getStatusChecked(item)}
                        onCheckedChange={() => handleStatusToggle(item)}
                      />
                    </td>
                  )}
                  {showActionsColumn && (
                    <td className="p-3 text-right whitespace-nowrap">
                    
                      {rowActions ? (
                        rowActions(item)
                      ) : (
                        <div className="flex justify-end items-center gap-1">

                          {editEnabled && (
                            <Link
                              to={`${basePath}/${title.toLowerCase().replace(/\s+/g, "-")}/${item[rowKey]}/edit`}
                              className="p-1 rounded hover:bg-muted flex items-center justify-center transition-colors"
                            >
                              <Edit className="w-5 h-5 text-primary hover:text-primary/80" />
                            </Link>
                          )}
                          {viewEnabled && (
                            <Link
                              to={
                                viewPath
                                  ? viewPath(item)
                                  : `${basePath}/${title.toLowerCase().replace(/\s+/g, "-")}/${item[rowKey]}/view`
                              }
                              className="p-1 rounded hover:bg-muted flex items-center justify-center transition-colors"
                            >
                              <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                            </Link>
                          )}

                          {deleteItem && (
                            <ConfirmDialog
                              title={`Delete ${title.slice(0, -1)}`}
                              description={`Are you sure you want to delete "${item.title || item.name || item[rowKey] || ""
                                }"?`}
                              confirmText="Delete"
                              danger
                              onConfirm={() =>
                                handleDelete(item[rowKey] as string)
                              }
                            >
                              <Trash className="w-5 h-5 text-destructive hover:text-destructive/80 cursor-pointer" />
                            </ConfirmDialog>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {
        totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="bg-card border-border text-foreground hover:bg-muted"
            >
              Prev
            </Button>
            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i}
                size="sm"
                variant={page === i + 1 ? "default" : "outline"}
                onClick={() => setPage(i + 1)}
                className={page === i + 1 ? "" : "bg-card border-border text-foreground hover:bg-muted"}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="bg-card border-border text-foreground hover:bg-muted"
            >
              Next
            </Button>
          </div>
        )
      }
    </div >
  );
}