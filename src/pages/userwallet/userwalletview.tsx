import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchUserWalletDetails } from "@/features/wallet/walletThunk";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useBasePath } from "@/hooks/useBasePath";

const FILTERS = [
    { label: "All Time", value: undefined },
    { label: "Last 30 Days", value: 30 },
    { label: "Last 60 Days", value: 60 },
    { label: "Last 90 Days", value: 90 },
];

export default function UserWalletView() {
    const { id } = useParams();
    const basePath = useBasePath();

    const dispatch = useDispatch<AppDispatch>();

    const { userWalletDetail, userWalletDetailLoading, userWalletDetailError } =
        useSelector((state: RootState) => state.wallet);

    const [activeFilter, setActiveFilter] = useState<number | undefined>(undefined);

    useEffect(() => {
        if (id) {
            dispatch(fetchUserWalletDetails({ userId: id, days: activeFilter }));
        }
    }, [id, activeFilter, dispatch]);

    const { user, balance, totalEarned, totalUsed, transactions } =
        userWalletDetail;

    if (userWalletDetailLoading && !user) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin w-6 h-6" />
            </div>
        );
    }

    if (userWalletDetailError) {
        return (
            <div className="text-red-500 p-4">{userWalletDetailError}</div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            {/*  */}
            <div className="flex items-center gap-3">
                <Link to={`${basePath}/userwallet`}>
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <span className="flex items-center justify-center w-full h-full text-gray-500 font-bold text-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                    </span>

                </div>
                <div>
                    <h2 className="text-lg font-semibold">{user?.name}</h2>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {user?.mobile_number && (
                        <p className="text-sm text-gray-500">{user.mobile_number}</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Current Balance</p>
                        <p className="text-2xl font-bold">₹{balance}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Earned</p>
                        <p className="text-2xl font-bold text-green-600">
                            ₹{totalEarned}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Used</p>
                        <p className="text-2xl font-bold text-red-600">₹{totalUsed}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {FILTERS.map((f) => (
                    <Button
                        key={f.label}
                        size="sm"
                        variant={activeFilter === f.value ? "default" : "outline"}
                        onClick={() => setActiveFilter(f.value)}
                    >
                        {f.label}
                    </Button>
                ))}
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left">Transection Id</th>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Reason</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Type</th>

                        </tr>
                    </thead>
                    <tbody>
                        {userWalletDetailLoading ? (
                            <tr>
                                <td colSpan={4} className="p-4 text-center">
                                    <Loader2 className="animate-spin w-5 h-5 inline" />
                                </td>
                            </tr>
                        ) : transactions?.length ? (
                            transactions.map((t: any, idx: number) => (
                                <tr key={t._id || idx} className="border-t">
                                    <td className="p-2">
                                        {t.transaction_id}
                                    </td>

                                    <td className="p-2">
                                        {new Date(t.createdAt).toLocaleString()}
                                    </td>

                                    <td className="p-2">{t.reason}</td>
                                    <td className="p-2">
                                        {t.type === "credit" ? "+" : "-"}₹{t.points}
                                    </td>
                                    <td className="p-2">
                                        <span
                                            className={
                                                t.type === "credit"
                                                    ? "text-green-600 font-medium"
                                                    : "text-red-600 font-medium"
                                            }
                                        >
                                            {t.type === "credit" ? "Credit" : "Debit"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="p-4 text-center text-gray-500">
                                    No transactions found for this period
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}