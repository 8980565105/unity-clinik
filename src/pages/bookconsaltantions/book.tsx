
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { deleteBooking, fetchBookings } from "@/features/bookconsoltantion/bookconsoltThunk";

export default function BookConsoltantion() {
    const dispatch = useDispatch<AppDispatch>();

    const columns = [
        {
            key: "phone",
            label: "Phone",
            width: "w-40",
        },
        {
            key: "transaction_id",
            label: "Transaction ID",
            width: "w-48",
            render: (item: any) => item.transaction_id || "-",
        },
        {
            key: "product_id",
            label: "Product",
            width: "w-56",
            render: (item: any) =>
                item.product_id?.name || item.product_title || "-",
        },
        {
            key: "amount",
            label: "Amount",
            width: "w-28",
            render: (item: any) =>
                item.amount ? `₹${item.amount}` : "-",
        },
        {
            key: "type",
            label: "Type",
            width: "w-32",
            render: (item: any) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${item.type === "voice call"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                        }`}
                >
                    {item.type === "voice call" ? "📞 Voice" : "🎥 Video"}
                </span>
            ),
        },
        {
            key: "createdAt",
            label: "Booked On",
            width: "w-40",
            render: (item: any) =>
                item.createdAt
                    ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                    })
                    : "-",
        },
    ];

    return (
        <GenericTable
            title="Consultation Bookings"
            columns={columns}
            rowKey="_id"
            searchEnabled
            statusToggleEnabled={false}
            editEnabled={false}
            fetchData={async ({ page, limit, search, status }) => {
                try {
                    const res = await dispatch(
                        fetchBookings({ page, limit, search, status })
                    ).unwrap();
                    return { data: res.bookings, total: res.total };
                } catch (err: any) {
                    throw new Error(err || "Failed to load bookings");
                }
            }}
            deleteItem={async (id) => {
                try {
                    await dispatch(deleteBooking(id)).unwrap();
                } catch (err: any) {
                    throw new Error(err || "Failed to delete booking");
                }
            }}
        />
    );
}