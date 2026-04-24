import { GenericTable } from "@/components/ui/adminTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDispatch } from "react-redux";
import { useBasePath } from "@/hooks/useBasePath";
import { AppDispatch } from "@/store";
import { Link } from "react-router-dom";
import {
    fetchResults,
    deleteResults,
    bulkDeleteResults,
    updateResultsStatus,
} from "@/features/results/resultsThunk";
export default function Result() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();

    const columns = [
        {
            key: "after_image_url",
            label: "After Image",
            render: (item: any) =>
                item.after_image_url ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL_IMAGE}${item.after_image_url}`}
                        alt="after"
                        className="h-12 w-12 rounded-md object-cover border"
                    />
                ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
                        —
                    </div>
                ),
            width: "w-10",
        },
        {
            key: "before_image_url",
            label: "Before Image",
            render: (item: any) =>
                item.before_image_url ? (
                    <img
                        src={`${import.meta.env.VITE_API_URL_IMAGE}${item.before_image_url}`}
                        alt="before"
                        className="h-12 w-12 rounded-md object-cover border"
                    />
                ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs border border-dashed">
                        —
                    </div>
                ),
            width: "w-10",
        },
        { key: "name", label: "Name", width: "w-20" },
        {
            key: "description",
            label: "Description",
            render: (item: any) => (
                <div
                    className="prose prose-sm w-full line-clamp-2"
                    dangerouslySetInnerHTML={{
                        __html: item.description || "",
                    }}
                />
            ),
            width: "w-60",
        }
    ];

    return (
        <GenericTable
            title="Results"
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
                    fetchResults({ page, limit, search, status })
                ).unwrap();
                return { data: res.results, total: res.total };
            }}
            deleteItem={async (id) => {
                await dispatch(deleteResults(id)).unwrap();
            }}
            bulkDeleteItems={async (ids) => {
                await dispatch(bulkDeleteResults(ids)).unwrap();
            }}
            onStatusToggle={async (id, newStatus) => {
                await dispatch(
                    updateResultsStatus({ id, status: newStatus ? "active" : "inactive" })
                ).unwrap();
            }}
            headerActions={
                <Link to={`${basePath}/results/add`}>
                    <Button className="flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Add Result
                    </Button>
                </Link>
            }
        />
    );
}