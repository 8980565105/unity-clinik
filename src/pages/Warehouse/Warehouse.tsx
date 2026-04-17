import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GenericTable } from "@/components/ui/adminTable";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { useBasePath } from "@/hooks/useBasePath";
import {
    fetchWarehouse,
    deleteWarehouse,
    bulkDeleteWarehouse,
    updatewarehouseStatus,
} from "@/features/warehouse/warehouseThunk";
export default function WarehousePage() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const columns = [{ key: "name", label: "Name", width: "w-40" }];
    return (
        <>
            <GenericTable
                title="Warehouse"
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
                            fetchWarehouse({ page, limit, search, status })
                        ).unwrap();
                        // FIX: was `res.warehouse` (singular) — thunk returns `res.warehouses`
                        return { data: res.warehouses, total: res.total };
                    } catch (err: any) {
                        throw new Error(err || "Failed to load warehouse");
                    }
                }}
                deleteItem={async (id) => {
                    try {
                        // FIX: thunk expects `{ id }` object, not a plain string
                        await dispatch(deleteWarehouse({ id })).unwrap();
                    } catch (err: any) {
                        throw new Error(err || "Failed to delete warehouse");
                    }
                }}
                bulkDeleteItems={async (ids) => {
                    try {
                        await dispatch(bulkDeleteWarehouse(ids)).unwrap();
                    } catch (err: any) {
                        throw new Error(err || "Failed to delete warehouses");
                    }
                }}
                onStatusToggle={async (id, newStatus) => {
                    try {
                        await dispatch(
                            updatewarehouseStatus({
                                id,
                                status: newStatus ? "active" : "inactive",
                            })
                        ).unwrap();
                    } catch (err: any) {
                        throw new Error(err || "Failed to update status");
                    }
                }}
                headerActions={
                    <Link to={`${basePath}/warehouse/add`}>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Add Warehouse
                        </Button>
                    </Link>
                }
            />
        </>
    );
}