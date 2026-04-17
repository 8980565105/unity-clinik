import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
  fetchCoupons,
  deleteCoupon,
  bulkDeleteCoupons,
  updateCouponStatus,
} from "@/features/coupons/couponsThunk";

export default function CouponsPage() {
  const dispatch = useDispatch<AppDispatch>();
 const basePath = useBasePath();
  const columns = [
    { key: "name", label: "Name", width: "w-40" },
    { key: "code", label: "Code", width: "w-28" },
    {
      key: "discount_type",
      label: "Type",
      width: "w-24",
    },
    {
      key: "discount_value",
      label: "Value",
      width: "w-24",
      render: (item: any) =>
        item.discount_type === "percentage"
          ? `${item.discount_value}%`
          : item.discount_value,
    },
    {
      key: "min_purchase_amount",
      label: "Min Purchase",
      width: "w-28",
      render: (item: any) => item.min_purchase_amount ?? 0,
    },
    {
      key: "max_discount_amount",
      label: "Max Discount",
      width: "w-28",
      render: (item: any) => item.max_discount_amount ?? "-",
    },
    {
      key: "start_date",
      label: "Start Date",
      width: "w-28",
      render: (item: any) =>
        item.start_date
          ? new Date(item.start_date).toLocaleDateString()
          : "-",
    },
    {
      key: "end_date",
      label: "End Date",
      width: "w-28",
      render: (item: any) =>
        item.end_date ? new Date(item.end_date).toLocaleDateString() : "-",
    },
  ];

  return (
    <GenericTable
      title="Coupons"
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
            fetchCoupons({ page, limit, search, status })
          ).unwrap();
          return { data: res.coupons, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load coupons");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteCoupon(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete coupon");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteCoupons(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete coupons");
        }
      }}
      onStatusToggle={async (id, newStatus) => {
        try {
          await dispatch(
            updateCouponStatus({
              id,
              status: newStatus ? "active" : "inactive",
            })
          ).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to update status");
        }
      }}
      headerActions={
        <Link to={`${basePath}/coupons/add`}>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> Add Coupon
          </Button>
        </Link>
      }
    />
  );
}
