
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import { Edit, Trash } from "lucide-react";
import {
  fetchFooter,
  deleteFooterItem,
  bulkDeleteFooterItems,
  updateFooterItemStatus,
} from "@/features/footer/footerThunk";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
export default function FooterPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

  const columns = [
    { key: "label", label: "Label", width: "w-48" },
    { key: "url", label: "URL", width: "w-64" },
  ];

  return (
    <GenericTable
      title="Footer Items"
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
          fetchFooter({ page, limit, search, status, isPublic: false })
        ).unwrap();
        return { data: res.footers, total: res.total };
      }}
      deleteItem={async (id) => {
        await dispatch(deleteFooterItem(id)).unwrap();
      }}
      bulkDeleteItems={async (ids) => {
        await dispatch(bulkDeleteFooterItems(ids)).unwrap();
      }}
      onStatusToggle={async (id, newStatus) => {
        await dispatch(
          updateFooterItemStatus({
            id,
            status: newStatus ? "active" : "inactive",
          })
        ).unwrap();
      }}
      headerActions={
        <Link to={`${basePath}/footer/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Footer Item
          </Button>
        </Link>
      }
      rowActions={(item: any) => (
        <div className="flex justify-end items-center gap-2">
          <Link
            to={`${basePath}/footer/${item._id}/edit`}
            className="p-1 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <Edit className="w-5 h-5 text-blue-600 hover:text-blue-800" />
          </Link>

          <ConfirmDialog
            title="Delete Footer Item"
            description={`Are you sure you want to delete "${item.label}"?`}
            confirmText="Delete"
            danger
            onConfirm={() => dispatch(deleteFooterItem(item._id)).unwrap()}
          >
            <Trash className="w-5 h-5 text-red-600 hover:text-red-800 cursor-pointer" />
          </ConfirmDialog>
        </div>
      )}
    />
  );
}