import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  fetchPayments,
  deletePayment,
  bulkDeletePayments,
} from "@/features/payments/paymentsThunk";

export default function PaymentsPage() {
  const dispatch = useDispatch<AppDispatch>();

  const STATUS_VALUES = ["pending", "completed", "failed"];
  const TYPE_VALUES = ["order", "wallet_recharge", "book_consultation"];


  const columns = [
    { key: "transaction_id", label: "Transaction ID", width: "w-48" },
    {
      key: "user_id.name",
      label: "User",
      width: "w-32",
      render: (item: any) => item.user_id?.name || "-",
    },
    { key: "payment_method", label: "Payment Method", width: "w-48" },
    {
      key: "amount_paid",
      label: "Amount",
      width: "w-30",
      render: (item: any) => `$${item?.amount_paid?.toFixed(2) || "0.00"}`,
    },
    {
      key: "type",
      label: "Type",
      width: "w-40",
      render: (item: any) => {
        const map: Record<string, string> = {
          order: "Order Payment",
          wallet_recharge: "Wallet Recharge",
          book_consultation: "Book Consultation",
        };
        return map[item.type] || item.type;
      },
    },
    {
      key: "status",
      label: "Status",
      width: "w-30",
      render: (item: any) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "completed"
            ? "bg-green-100 text-green-800"
            : item.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
            }`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
    {
      key: "payment_date",
      label: "Payment Date",
      width: "w-48",
      render: (item: any) =>
        item.payment_date
          ? new Date(item.payment_date).toLocaleDateString()
          : "-",
    },
  ];

  return (
    <GenericTable
      title="Payments"
      columns={columns}
      rowKey="_id"
      searchEnabled
      statusToggleEnabled={false}
      editEnabled={false}
      filters={[
        { label: "Pending", value: "pending" },
        { label: "Completed", value: "completed" },
        { label: "Failed", value: "failed" },
        { label: "Order", value: "order" },
        { label: "Wallet Recharge", value: "wallet_recharge" },
        { label: "Book Consultation", value: "book_consultation" },
      ]}

      fetchData={async ({ page, limit, search, status }) => {
        try {
          const params: any = { page, limit, search };

          if (status) {
            if (STATUS_VALUES.includes(status)) {
              params.status = status;
            } else if (TYPE_VALUES.includes(status)) {
              params.type = status;
            }
          }

          const res = await dispatch(fetchPayments(params)).unwrap();
          return { data: res.payments, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load payments");
        }
      }
      }
      deleteItem={async (id) => {
        try {
          await dispatch(deletePayment(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete payment");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeletePayments(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete payments");
        }
      }}
    />
  );
}
