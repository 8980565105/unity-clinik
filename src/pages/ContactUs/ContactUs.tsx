import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import {
  fetchContactMessages,
  deleteContactMessage,
  bulkDeleteContactMessages,
} from "@/features/contactUs/contactUsThunk";


export default function ContactUsPage() {
  const dispatch = useDispatch<AppDispatch>();


  const columns = [
    { key: "name", label: "Name", width: "w-40" },
    { key: "email", label: "Email", width: "w-48" },
    { key: "subject", label: "Order Id", width: "w-32" },
    { key: "message", label: "Message", width: "w-[400px]" },
    {
      key: "createdAt",
      label: "Submitted At",
      width: "w-48",
      render: (row: any) => new Date(row.createdAt).toLocaleString(),
    },
  ];

  return (
    <GenericTable
      title="Contact Messages"
      columns={columns}
      rowKey="_id"
      searchEnabled
      editEnabled={false} 
      statusToggleEnabled={false} 
      fetchData={async ({ page, limit, search }) => {
        try {
          const res = await dispatch(
            fetchContactMessages({ page, limit, search })
          ).unwrap();
          return { data: res.contacts, total: res.total };
        } catch (err: any) {
          throw new Error(err || "Failed to load contact messages");
        }
      }}
      deleteItem={async (id) => {
        try {
          await dispatch(deleteContactMessage(id)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete message");
        }
      }}
      bulkDeleteItems={async (ids) => {
        try {
          await dispatch(bulkDeleteContactMessages(ids)).unwrap();
        } catch (err: any) {
          throw new Error(err || "Failed to delete messages");
        }
      }}
      
    />
  );
}
