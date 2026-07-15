import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchAllWallets } from "@/features/wallet/walletThunk";
import { GenericTable } from "@/components/ui/adminTable";
import { Button } from "@/components/ui/button";
import UserwalletForm from "./userwalletFrom";
import { useBasePath } from "@/hooks/useBasePath";

export default function Userswallet() {
    const dispatch = useDispatch<AppDispatch>();
    const basePath = useBasePath();
    const { user } = useSelector((state: RootState) => state.auth);
    const isAdmin = user?.role === "admin";
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [open, setOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const handleAddBalanceClick = (item: any) => {
        setSelectedUser(item);
        setOpen(true);
    };

    const columns = [
        {
            key: "name",
            label: "Name",
            render: (item: any) => (
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold">
                            {item.name?.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    {item.name}
                </div>
            ),
        },
        { key: "email", label: "Email" },
        { key: "balance", label: "Balance" },
        { key: "totalEarned", label: "Total Earned" },
        { key: "totalUsed", label: "Total Used" },
        {
            key: "actions",
            label: "Add Balance",
            render: (item: any) =>
                isAdmin ? (
                    <Button size="sm" onClick={() => handleAddBalanceClick(item)}>
                        Add Balance
                    </Button>
                ) : null,
        },
    ];

    return (
        <>
            <GenericTable
                key={refreshKey}
                title="User Wallets"
                columns={columns}
                rowKey="_id"
                searchEnabled
                editEnabled={false}
                viewEnabled={true}
                viewPath={(item: any) => `${basePath}/userwallet/${item._id}/view`}
                fetchData={async ({ page, limit, search }) => {
                    try {
                        const res = await dispatch(
                            fetchAllWallets({ page, limit, search }),
                        ).unwrap();
                        return { data: res.users, total: res.total };
                    } catch (err: any) {
                        throw new Error(err || "Failed to load wallets");
                    }
                }}
            />

            <UserwalletForm
                open={open}
                onOpenChange={setOpen}
                selectedUser={selectedUser}
                onSuccess={() => setRefreshKey((k) => k + 1)}
            />
        </>
    );
}