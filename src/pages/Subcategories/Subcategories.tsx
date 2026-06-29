import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  bulkDeletesubCategories,
  deletesubCategory,
  fetchsubCategories,
  updatesubCategoryStatus,
} from "@/features/subcategories/subcategoriesThunk";

export default function subCategoriesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const columns = [
    {
      key: "image_url",
      label: "Image",
      render: (item: any) =>
        item.image_url ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.image_url}`}
            alt={item.name}
            className="h-10 w-10 rounded-md object-cover border"
          />
        ) : (

          ""
        ),

    },
    { key: "name", label: "Name", },
    {
      key: "parent_id",
      label: "Parent",
      render: (item: any) => item.parent_id?.name || "-",
    },
    { key: "order", label: "Order", },
  ];

  return (
    <GenericTable
      title="SubCategories"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      filters={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Ascending Order", value: "asc" },
        { label: "Descending Order", value: "desc" },

      ]}

      fetchData={async ({ page, limit, search, status }) => {
        try {

          let apiStatus = status;
          let sort: "asc" | "desc" | undefined;

          if (status === "asc") {
            apiStatus = undefined;
            sort = "asc";
          }

          if (status === "desc") {
            apiStatus = undefined;
            sort = "desc";
          }

          const res = await dispatch(
            fetchsubCategories({
              page,
              limit,
              search,
              status: apiStatus as any,
              sort,
            })
          ).unwrap();

          return {
            data: res.categories,
            total: res.total,
          };

        } catch (err: any) {
          throw new Error(err);
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deletesubCategory(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete category");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeletesubCategories(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete categories");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updatesubCategoryStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/subcategories/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add subCategory
          </Button>
        </Link>
      }
    />
  );
}
