import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { bulkDeleteBookings, deleteBooking, fetchBookings } from "@/features/bookconsoltantion/bookconsoltThunk";
import { useBasePath } from "@/hooks/useBasePath";

export default function BookConsoltantion() {
    const dispatch = useDispatch<AppDispatch>();
      const basePath = useBasePath();
    

    const columns = [
        {
            key: "phone",
            label: "Phone",
        },
        {
            key: "name",
            label: "name",
            render: (item: any) => item.name || "-",
        },
        {
            key: "message",
            label: "message",
            render: (item: any) =>
                item.message || "-",
        },
        {
            key: "amount",
            label: "Amount",
            render: (item: any) =>
                item.amount ? `₹${item.amount}` : "-",
        },
        {
            key: "type",
            label: "Type",
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
            key: "slot_time",
            label: "Slot Time",
        },
        {
            key: "slot_date",
            label: " Slot Date",
        },
    ];

    return (
        <GenericTable
            title="Consultation Bookings"
            columns={columns}
            rowKey="_id"
            searchEnabled
            statusToggleEnabled={false}
            editEnabled
            viewEnabled={true}
            viewPath={(item: any) => `${basePath}/bookConsoltantion/${item._id}/view`}
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
            bulkDeleteItems={async (ids) => {
                try {
                    await dispatch(bulkDeleteBookings(ids)).unwrap();
                } catch (err: any) {
                    throw new Error(err || "Failed to delete bookings");
                }
            }}
        />
    );
}