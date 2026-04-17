import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchTypes,
  deleteType,
  bulkDeleteTypes,
  updateTypeStatus,
} from "@/features/types/typesThunk";

export default function TypesPage() {
  const dispatch = useDispatch<AppDispatch>();
 const basePath = useBasePath();
  const columns = [
    { key: "name", label: "Name", width: "w-48" },
    {
      key: "description",
      label: "Description",
      width: "w-64",
      exportValue: (item: any) => item.description || "-",
    },
  ];

  return (
    <GenericTable
      title="Types"
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
            fetchTypes({ page, limit, search, status })
          ).unwrap();
          return { data: res.types, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load types");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteType(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete type");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteTypes(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete types");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateTypeStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/types/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Type
          </Button>
        </Link>
      }
    />
  );
}
