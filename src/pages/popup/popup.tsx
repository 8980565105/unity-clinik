import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchPopups,
  deletePopup,
  bulkDeletePopups,
  updatePopupStatus,
} from "@/features/popup/PopupThunk";

function Popup() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();

  const columns = [
    {
      key: "type",
      label: "Type",
      render: (item: any) => {
        const styles = {
          coupon: "bg-blue-100 text-blue-800",
          consultation: "bg-emerald-100 text-emerald-800",
          BookConsultation: "bg-purple-100 text-purple-800",
        };

        return (
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${styles[item.type as keyof typeof styles] ||
              "bg-gray-100 text-gray-800"
              }`}
          >
            {item.type === "BookConsultation"
              ? "Book Consultation"
              : item.type === "consultation"
                ? "Consultation"
                : "Coupon"}
          </span>
        );
      },
    },
  ];

  return (
    <GenericTable
      title="Popup"
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
            fetchPopups({ page, limit, search, status })
          ).unwrap();
          return { data: res.popups || [], total: res.total || 0 };
        } catch (err: any) {
          throw new Error(err || "Failed to load popups");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deletePopup(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete popup");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeletePopups(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete popups");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updatePopupStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/popup/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Popup
          </Button>
        </Link>
      }
    />
  );
}

export default Popup;
