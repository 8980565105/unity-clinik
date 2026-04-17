import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchSizes,
  deleteSize,
  bulkDeleteSizes,
  updateSizeStatus,
} from "@/features/sizes/sizesThunk";

export default function SizesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const columns = [
    { key: "name", label: "Name", width: "w-48" },
    { key: "measurement", label: "Measurement", width: "w-32" },
  ];

  return (
    <GenericTable
      title="Sizes"
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
          fetchSizes({ page, limit, search, status })
        ).unwrap();
        return { data: res.sizes, total: res.total };
      }}
      deleteItem={async (id) => {
        await dispatch(deleteSize(id)).unwrap();
      }}
      bulkDeleteItems={async (ids) => {
        await dispatch(bulkDeleteSizes(ids)).unwrap();
      }}
      onStatusToggle={async (id, newStatus) => {
        await dispatch(
          updateSizeStatus({ id, status: newStatus ? "active" : "inactive" })
        ).unwrap();
      }}
      headerActions={
        <Link to={`${basePath}/sizes/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Size
          </Button>
        </Link>
      }
    />
  );
}
