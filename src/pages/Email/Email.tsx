import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
    fetchEmails,
    bulkDeleteEmails,
    deleteEmails,
} from "@/features/email/emailThunk";

export default function EmailsPage() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();

    const columns = [
        { key: "email", label: "Email", width: "w-48" },
    ];

    return (
        <GenericTable
            title="Emails"
            columns={columns}
            rowKey="_id"
            searchEnabled
            fetchData={async ({ page, limit, search, status }) => {
                try {
                    const res = await dispatch(
                        fetchEmails({ page, limit, search, status })
                    ).unwrap();
                    return { data: res.emails, total: res.total };
                } catch (err: any) {
                    throw new Error(err || "Failed to load emails");
                }
            }}
            deleteItem={async (id) => {
                try {
                    await dispatch(deleteEmails(id)).unwrap();
                } catch (err: any) {
                    throw new Error(err || "Failed to delete email");
                }
            }}
            bulkDeleteItems={async (ids) => {
                try {
                    await dispatch(bulkDeleteEmails(ids)).unwrap();
                } catch (err: any) {
                    throw new Error(err || "Failed to delete emails");
                }
            }}
            headerActions={
                <Link to={`${basePath}/emails/add`}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Email
                    </Button>
                </Link>
            }
        />
    );
}