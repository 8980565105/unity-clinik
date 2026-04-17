import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  bulkDeleteBrands,
  deleteBrand,
  fetchBrands,
  updateBrandStatus,
} from "@/features/brands/brandsThunk";

export default function BrandsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const columns = [
    {
      key: "image_url",
      label: "Logo",
      render: (item: any) =>
        item.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`}
            alt={item.name}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
            —
          </div>
        ),
      width: "w-20",
      exportValue: (item: any) =>
        item.image_url
          ? `${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`
          : "-",
    },
    { key: "name", label: "Name", width: "w-48" },
  ];

  return (
    <GenericTable
      title="Brands"
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
            fetchBrands({ page, limit, search, status })
          ).unwrap();
          return { data: res.brands, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load brands");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteBrand(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete brand");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteBrands(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete brands");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateBrandStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/brands/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Brand
          </Button>
        </Link>
      }
    />
  );
}
