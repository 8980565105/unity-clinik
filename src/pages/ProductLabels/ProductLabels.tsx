import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  fetchProductLabels,
  deleteProductLabel,
  bulkDeleteProductLabels,
  updateProductLabelStatus,
} from "@/features/productLabels/productLabelsThunk";
import { useBasePath } from "@/hooks/useBasePath";
export default function ProductLabelsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const columns = [
    { key: "name", label: "Name", width: "w-48" },
    { key: "color", label: "Color", width: "w-32" },
  ];

  return (
    <GenericTable
      title="Product-Labels"
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
            fetchProductLabels({ page, limit, search, status })
          ).unwrap();
          return { data: res.labels, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load product labels");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteProductLabel(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete label");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteProductLabels(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete labels");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateProductLabelStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/product-labels/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Label
          </Button>
        </Link>
      }
    />
  );
}
