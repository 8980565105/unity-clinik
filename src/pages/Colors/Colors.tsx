import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchColors,
  deleteColor,
  bulkDeleteColors,
  updateColorStatus,
} from "@/features/colors/colorsThunk";

export default function ColorsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const columns = [
    { key: "name", label: "Name", width: "w-48" },
    { key: "code", label: "Code", width: "w-32" },

  ];

  return (
    <GenericTable
      title="Colors"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      filters={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}
      fetchData={async ({ page, limit, search, status }) => {
        const res = await dispatch(
          fetchColors({ page, limit, search, status })
        ).unwrap();
        return { data: res.colors, total: res.total };
      }}
      deleteItem={async (id) => {
        await dispatch(deleteColor(id)).unwrap();
      }}
      bulkDeleteItems={async (ids) => {
        await dispatch(bulkDeleteColors(ids)).unwrap();
      }}
      onStatusToggle={async (id, newStatus) => {
        await dispatch(
          updateColorStatus({ id, status: newStatus ? "active" : "inactive" })
        ).unwrap();
      }}
      headerActions={
        <Link to={`${basePath}/colors/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Color
          </Button>
        </Link>
      }
    />
  );
}
