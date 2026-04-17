"use client";

import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  fetchCustomerReviews,
  deleteCustomerReview,
  bulkDeleteCustomerReviews,
  updateReviewsStatus,
} from "@/features/customerReviews/customerReviewsThunk";
import { GenericTable } from "@/components/ui/adminTable";

export default function CustomerReviewsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const columns = [
    {
      key: "user_id",
      label: "User",
      render: (item: any) => item.user_id?.name || "-",
    },
    {
      key: "user_id_email",
      label: "Email",
      render: (item: any) => item.user_id?.email || "-",
    },
    {
      key: "product_id",
      label: "Product",
      render: (item: any) => item.product_id?.name || "-",
    },
    { key: "rating", label: "Rating" },
    { key: "comment", label: "Comment" },
  ];

  return (
    <GenericTable
      title="Customer Reviews"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled
      statusKey="is_approved"
      filters={[
        { label: "Approved", value: "true" },
        { label: "Pending", value: "false" },
      ]}
      fetchData={async ({ page, limit, search, status }) => {
        const boolStatus =
          status === "true" ? true : status === "false" ? false : undefined;

        const res = await dispatch(
          fetchCustomerReviews({ page, limit, search, is_approved: boolStatus }),
        ).unwrap();

        return { data: res.customerReviews, total: res.total };
      }}

      deleteItem={async (id) => {
        await dispatch(deleteCustomerReview(id)).unwrap();
      }}

      bulkDeleteItems={async (ids) => {
        await dispatch(bulkDeleteCustomerReviews(ids)).unwrap();
      }}

      onStatusToggle={async (id, newStatus) => {
        await dispatch(
          updateReviewsStatus({ id, is_approved: newStatus }),
        ).unwrap();
      }}


    />
  );
}
