import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { bulkDeleteNavbarItems, deleteNavbarItem, fetchNavbar, updateNavbarItemStatus } from "@/features/navbar/navbarThunk";
import { useBasePath } from "@/hooks/useBasePath";

export default function NavbarPage() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

   const columns = [
    {
      key: "icon",
      label: "icon",
      width: "w-20",
      render: (item: any) =>
        item.icon ? (
          <img
            src={`${import.meta.env.VITE_API_URL_IMAGE}${item.icon}`}
            alt={item.label}
            className="h-10 w-10 rounded-md object-cover border border-gray-200"
          />
        ) : (
          <div className="h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed border-gray-300">
            —
          </div>
        ),
      exportValue: (item: any) => item.label, 
    },
    { key: "label", label: "Title" },
    { key: "url", label: "URL" },
    { key: "order", label: "Order" },
    {
      key: "createdAt",
      label: "Created At",
      render: (item: any) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",
    },
  ];

  return (
    <GenericTable
      title="Navbar"
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
            fetchNavbar({ page, limit, search, status })
          ).unwrap();
          return { data: res.navbars, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load brands");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteNavbarItem(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete brand");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteNavbarItems(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete brands");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateNavbarItemStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/navbar/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Navbar
          </Button>
        </Link>
      }
    />
  );
}
