import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { getOrderById, pushOrderToIthink, addTrackingAWB } from "@/features/orders/ordersThunk";
import { clearSelectedOrder } from "@/features/orders/ordersSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pencil, Download } from "lucide-react";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { saveAs } from "file-saver";
import { toast } from "sonner";

const STATUS_LABEL: Record<string, string> = {
    pending: "New Order",
    processing: "Order Confirmed",
    packed: "Packed",
    ready_to_ship: "Ready to Ship",
    shipped: "Shipped",
    in_transit: "In Transit",
    completed: "Delivered",
    cancelled: "Cancelled",
    rto: "RTO",
    returned: "Returned",
    refunded: "Refunded",
};

const STATUS_COLOR: Record<string, string> = {
    pending: "bg-blue-100 text-blue-700",
    processing: "bg-indigo-100 text-indigo-700",
    packed: "bg-yellow-100 text-yellow-700",
    ready_to_ship: "bg-orange-100 text-orange-700",
    shipped: "bg-purple-100 text-purple-700",
    in_transit: "bg-cyan-100 text-cyan-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    rto: "bg-rose-100 text-rose-700",
    returned: "bg-pink-100 text-pink-700",
    refunded: "bg-gray-100 text-gray-600",
};

const StatusBadge = ({ status }: { status: string }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${STATUS_COLOR[status] || "bg-gray-100 text-gray-600"}`}>
        {STATUS_LABEL[status] || status}
    </span>
);

const downloadPDF = async (url: string, filename: string) => {
    const res = await api.get(url, { responseType: "blob" });
    const blob = new Blob([res.data], { type: "application/pdf" });
    saveAs(blob, filename);
};

export default function OrderView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const { selectedOrder, loading, actionLoading } = useSelector((state: RootState) => state.orders);
    const [liveTracking, setLiveTracking] = useState<any>(null);
    useEffect(() => {
        if (id) dispatch(getOrderById(id));
        return () => {
            dispatch(clearSelectedOrder());
        };
    }, [id, dispatch]);
    const order = (selectedOrder as any)?.order || selectedOrder;
    const items = (selectedOrder as any)?.items || order?.items || [];
    useEffect(() => {
        if (order?._id && order?.courier?.awb_number) {
            api.get(ROUTES.orders.tracking(order._id))
                .then((res) => {
                    if (res.data.success && res.data.data?.live_tracking) {
                        setLiveTracking(res.data.data.live_tracking);
                    }
                })
                .catch((err) => {
                    console.error("Failed to fetch live tracking:", err);
                });
        }
    }, [order]);

    const handlePushToIthink = async () => {
        if (!order) return;
        if (
            !order.shipment_weight ||
            !order.shipment_length ||
            !order.shipment_width ||
            !order.shipment_height
        ) {
            toast.error("Please add shipment dimensions (Weight, Length, Width, Height) in Order Edit before pushing to iThink.");
            return;
        }
        try {
            const result = await dispatch(pushOrderToIthink(order._id));
            if (pushOrderToIthink.fulfilled.match(result)) {
                toast.success("Order pushed to iThink! Select courier from their dashboard.");
                dispatch(getOrderById(order._id));
            } else {
                toast.error((result.payload as string) || "Failed to push order");
            }
        } catch {
            toast.error("Server Error");
        }
    };

    if (loading || !order) {
        return (
            <div className="p-6 flex items-center justify-center text-muted-foreground">
                Loading order...
            </div>
        );
    }
    return (
        <div className="mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/orders")}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">
                            Order #{order.order_number}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>

            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center justify-between">
                                Order Items
                                <StatusBadge status={order.status} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-muted-foreground border-b">
                                        <th className="text-left py-2">Product</th>
                                        <th className="text-left py-2">SKU</th>
                                        <th className="text-center py-2">Qty</th>
                                        <th className="text-right py-2">Price</th>
                                        <th className="text-right py-2">Subtotal</th>
                                        <th className="text-center py-2">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item: any) => (
                                        <tr key={item._id}>
                                            <td className="py-2">{item.product_id?.name || item.product?.name || "Product"}</td>
                                            <td className="py-2">{item.variant_id?.sku || item.variant?.sku || "-"}</td>
                                            <td className="py-2 text-center">{item.quantity}</td>
                                            <td className="py-2 text-right">₹{item.price_at_order?.toFixed(2)}</td>
                                            <td className="py-2 text-right font-semibold">
                                                ₹{(item.price_at_order * item.quantity)?.toFixed(2)}
                                            </td>
                                            <td className="py-2 text-center">
                                                {item.is_consultation_gift ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-600">
                                                        🎁 Consultation Gift
                                                    </span>
                                                ) : item.is_gift ? (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-pink-600">
                                                        🎁 Gift
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="flex justify-end mt-4 pt-4 border-t">
                                <div className="text-right space-y-1 text-sm">
                                    <p className="text-muted-foreground">Subtotal: ₹{order.subtotal || order.total_price}</p>
                                    {order.shipping_charge > 0 && <p className="text-muted-foreground">Shipping: ₹{order.shipping_charge}</p>}
                                    {order.coupon_discount > 0 && <p className="text-green-600">Coupon: -₹{order.coupon_discount}</p>}
                                    <p className="font-bold text-base">Total: ₹{order.total_price}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="text-base">Customer</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p><strong>{order.user_id?.name || order.user?.name}</strong></p>
                            <p className="text-muted-foreground">{order.user_id?.email || order.user?.email}</p>
                            <p className="text-muted-foreground">{order.shippingAddress?.phone}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Shipping Address</CardTitle></CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                            {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-base">Payment</CardTitle></CardHeader>
                        <CardContent className="text-sm space-y-1">
                            <p>Method: <strong>{order.payment_method}</strong></p>
                            <p>Status: <strong>{order.payment_status}</strong></p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}