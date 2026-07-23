import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Download, Package, Truck, CheckCircle, X } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { useBasePath } from "@/hooks/useBasePath";
import { GenericTable } from "@/components/ui/adminTable";
import {
  fetchOrders,
  deleteOrder,
  bulkDeleteOrders,
  confirmOrder,
  cancelOrder,
  packOrder,
  assignCourier,
  shipOrder,
  updateTracking,
  markDelivered,
  markRTO,
  addTrackingAWB,
  refundOrder,
  decideReturn,
} from "@/features/orders/ordersThunk";
import { Order } from "@/features/orders/ordersSlice";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";

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

const Modal = ({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-4">
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

export default function Orders() {
  const dispatch = useDispatch<AppDispatch>();
  const basePath = useBasePath();
  const { actionLoading } = useSelector((state: RootState) => state.orders);
  const { user } = useSelector((state: RootState) => state.auth);

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  type ModalType = "confirm" | "cancel" | "pack" | "ship" | "addAwb" | "deliver" | "rto" | "refund" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);

  const [adminNote, setAdminNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [courierForm, setCourierForm] = useState({ courier_name: "", awb_number: "" });
  const [rtoForm, setRtoForm] = useState({ type: "rto" as "rto" | "returned" | "refunded", reason: "" });
  const [refundAmount, setRefundAmount] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const isAdmin = user?.role === "admin";
  const openModal = (type: ModalType, order: Order) => {
    setTargetOrder(order);
    setActiveModal(type);
    setAdminNote("");
    setCancelReason("");
    setCourierForm({ courier_name: "", awb_number: "" });
    setRtoForm({ type: "rto", reason: "" });
    setRefundAmount(String(order.total_price || ""));
    setRefundNote("");
  };
  const closeModal = () => {
    setActiveModal(null);
    setTargetOrder(null);
  };

  const handleConfirm = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(confirmOrder({ id: targetOrder._id, admin_note: adminNote })).unwrap();
      toast.success("Order confirmed! Packing record created.");
      triggerRefresh(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to confirm order"); }
  };

  const handleCancel = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(cancelOrder({ id: targetOrder._id, reason: cancelReason })).unwrap();
      toast.success("Order cancelled.");
      triggerRefresh(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to cancel order"); }
  };

  const handleAddAwb = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(addTrackingAWB({
        id: targetOrder._id,
        awb_number: courierForm.awb_number,
        courier_name: courierForm.courier_name,
      })).unwrap();
      toast.success("AWB added. Tracking started!");
      triggerRefresh(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to add AWB"); }
  };

  const handleShip = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(shipOrder(targetOrder._id)).unwrap();
      toast.success("Order shipped!");
      triggerRefresh(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to ship order"); }
  };

  const handleDeliver = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(markDelivered(targetOrder._id)).unwrap();
      toast.success("Order marked as delivered.");
      triggerRefresh(); closeModal();
    } catch (err: any) { toast.error(err || "Failed"); }
  };

  const handleRTO = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(markRTO({ id: targetOrder._id, ...rtoForm })).unwrap();
      toast.success(`Order marked as ${rtoForm.type}`);
      triggerRefresh(); closeModal();
    } catch (err: any) { toast.error(err || "Failed"); }
  };

  const handleRefund = async () => {
    if (!targetOrder) return;
    const amt = Number(refundAmount);
    if (!amt || amt <= 0) { toast.error("Enter a valid refund amount"); return; }
    try {
      await dispatch(refundOrder({ id: targetOrder._id, amount: amt, note: refundNote })).unwrap();
      toast.success(`₹${amt} refunded to customer's wallet`);
      triggerRefresh(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to refund"); }
  };

  const handleDownload = async () => {
    try {
      const result = await dispatch(fetchOrders({ page: 1, limit: 10000, isDownload: true })).unwrap();
      const data = result.orders.map((o: any) => ({
        "Order Number": o.order_number,
        Customer: o.user?.name,
        Mobile: o.shippingAddress?.phone,
        Address: `${o.shippingAddress?.address}, ${o.shippingAddress?.city}, ${o.shippingAddress?.state} - ${o.shippingAddress?.pincode}`,
        "Total Price": o.total_price,
        Payment: o.payment_method,
        Status: STATUS_LABEL[o.status] || o.status,
        "Created At": new Date(o.createdAt).toLocaleDateString("en-IN"),
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Orders");
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buf], { type: "application/octet-stream" }), `orders_${Date.now()}.xlsx`);
    } catch { toast.error("Download failed."); }
  };

  const renderFlowActions = (order: Order) => {
    const buttons: React.ReactNode[] = [];

    if (order.payment_status !== "refunded" &&
      ["returned", "cancelled"].includes(order.status) &&
      order.payment_method !== "COD") {
      buttons.push(
        <button key="refund" onClick={() => openModal("refund", order)}
          className="px-2 py-1 text-xs rounded bg-teal-100 text-teal-700 hover:bg-teal-200 font-medium">
          Refund
        </button>
      );
    }

    switch (order.status) {
      case "pending":
        buttons.push(
          <button key="confirm" onClick={() => openModal("confirm", order)} className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium">Confirm</button>,
          <button key="cancel" onClick={() => openModal("cancel", order)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium">Cancel</button>
        );
        break;
      case "processing":
        buttons.push(
          <button key="awb" onClick={() => openModal("addAwb", order)} className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium">Add AWB</button>,
          <button key="cancel" onClick={() => openModal("cancel", order)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium">Cancel</button>
        );
        break;
      case "ready_to_ship":
        buttons.push(
          <button key="ship" onClick={() => openModal("ship", order)} className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium">Dispatch</button>
        );
        break;
      case "shipped":
      case "in_transit":
        buttons.push(
          // <button key="deliver" onClick={() => openModal("deliver", order)} className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium">
          //   <CheckCircle size={11} className="inline mr-1" />Delivered
          // </button>
        );
        break;
      case "completed":
        buttons.push(
          <button key="invoice" onClick={() => downloadPDF(ROUTES.orders.invoice(order._id), `invoice-${order.order_number}.pdf`)}
            className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium">Invoice</button>
        );
        break;
    }

    if (["packed", "ready_to_ship", "shipped", "in_transit", "completed"].includes(order.status)) {
      buttons.push(
        <button key="slip" onClick={() => downloadPDF(ROUTES.orders.packingSlip(order._id), `slip-${order.order_number}.pdf`)}
          className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-medium">Slip</button>
      );
    }

    return <div className="flex items-center gap-1 flex-wrap">{buttons}</div>;
  };

  const columns = [
    { key: "order_number", label: "Order No.", render: (item: Order) => <span className="font-medium text-primary">{item.order_number}</span> },
    { key: "customer", label: "Customer", render: (item: Order) => item.user?.name || "—" },
    { key: "phone", label: "Mobile", render: (item: Order) => item.shippingAddress?.phone || "—" },
    {
      key: "address", label: "Address", render: (item: Order) => (
        <span className="text-xs text-muted-foreground max-w-[180px] block truncate">
          {item.shippingAddress?.address}, {item.shippingAddress?.city}, {item.shippingAddress?.state} - {item.shippingAddress?.pincode}
        </span>
      )
    },
    { key: "total_price", label: "Amount", render: (item: Order) => <span className="font-semibold">₹{item.total_price}</span> },
    {
      key: "payment_method", label: "Payment", render: (item: Order) => (
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
          {item.payment_method}
        </span>
      )
    },
    { key: "status", label: "Status", render: (item: Order) => <StatusBadge status={item.status} /> },
    { key: "flow_actions", label: "Order Actions", render: (item: Order) => renderFlowActions(item) },
  ];

  return (
    <>
      <GenericTable
        key={refreshKey}
        title="Orders"
        columns={columns}
        rowKey="_id"
        searchEnabled
        statusToggleEnabled={false}
        viewEnabled={true}
        viewPath={(item: any) => `${basePath}/orders/${item._id}/view`}
        editEnabled={false}
        // editEnabled={true}
        // editPath={(item: any) => `${basePath}/orders/${item._id}/edit`}
        filters={[
          { label: "New Order", value: "pending" },
          { label: "Order Confirmed", value: "processing" },
          { label: "Packed", value: "packed" },
          { label: "Ready to Ship", value: "ready_to_ship" },
          { label: "Shipped", value: "shipped" },
          { label: "In Transit", value: "in_transit" },
          { label: "Delivered", value: "completed" },
          { label: "Cancelled", value: "cancelled" },
          { label: "Returned", value: "returned" },
          { label: "Refunded", value: "refunded" },
        ]}
        fetchData={async ({ page, limit, search, status }) => {
          try {
            const res = await dispatch(
              fetchOrders({ page, limit, search, status: status || undefined })
            ).unwrap();
            return { data: res.orders, total: res.total };
          } catch (err: any) {
            throw new Error(err || "Failed to load orders");
          }
        }}
        deleteItem={async (id) => {
          try {
            await dispatch(deleteOrder(id)).unwrap();
          } catch (err: any) {
            throw new Error(err?.message || "Failed to delete order");
          }
        }}
        bulkDeleteItems={async (ids) => {
          try {
            await dispatch(bulkDeleteOrders(ids)).unwrap();
          } catch (err: any) {
            throw new Error(err?.message || "Failed to delete orders");
          }
        }}
        headerActions={
          <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Excel
          </Button>
        }
      />

      {activeModal === "confirm" && targetOrder && (
        <Modal title={`Confirm Order — ${targetOrder.order_number}`} onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-1">Verify payment and stock, then confirm this order.</p>
          <p className="text-xs text-indigo-600 mb-3">✓ A Packing record will be auto-created once confirmed.</p>
          <div className="p-3 bg-gray-50 rounded-lg text-sm mb-3">
            <p><strong>Customer:</strong> {targetOrder.user?.name}</p>
            <p><strong>Amount:</strong> ₹{targetOrder.total_price} · {targetOrder.payment_method}</p>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (optional)</label>
          <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add a note..." />
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading} onClick={handleConfirm} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {actionLoading ? "Confirming..." : "Confirm Order"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {activeModal === "cancel" && targetOrder && (
        <Modal title={`Cancel Order — ${targetOrder.order_number}`} onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-3">Are you sure you want to cancel this order? Stock will be restored.</p>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
          <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Enter cancellation reason..." />
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading || !cancelReason.trim()} onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700">
              {actionLoading ? "Cancelling..." : "Cancel Order"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Go Back</Button>
          </div>
        </Modal>
      )}

      {activeModal === "addAwb" && targetOrder && (
        <Modal title={`Add AWB — ${targetOrder.order_number}`} onClose={closeModal}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Courier Name</label>
              <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={courierForm.courier_name}
                onChange={(e) => setCourierForm({ ...courierForm, courier_name: e.target.value })}
                placeholder="e.g. Delhivery, Blue Dart" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AWB Number <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm"
                value={courierForm.awb_number}
                onChange={(e) => setCourierForm({ ...courierForm, awb_number: e.target.value })}
                placeholder="Enter AWB number" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading || !courierForm.awb_number} onClick={handleAddAwb} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              {actionLoading ? "Saving..." : "Save & Start Tracking"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {activeModal === "ship" && targetOrder && (
        <Modal title={`Dispatch Order — ${targetOrder.order_number}`} onClose={closeModal}>
          <div className="p-3 bg-purple-50 rounded-lg text-sm mb-4">
            <p><strong>Courier:</strong> {targetOrder.courier?.name || targetOrder.courier?.partner}</p>
            <p><strong>AWB:</strong> {targetOrder.courier?.awb_number}</p>
          </div>
          <div className="flex gap-3">
            <Button disabled={actionLoading} onClick={handleShip} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {actionLoading ? "Dispatching..." : "Confirm Dispatch"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {activeModal === "deliver" && targetOrder && (
        <Modal title={`Mark as Delivered — ${targetOrder.order_number}`} onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-2">Confirm that this order has been delivered.</p>
          {targetOrder.payment_method === "COD" && (
            <p className="text-xs text-green-600 mb-3 p-2 bg-green-50 rounded">✓ COD ₹{targetOrder.total_price} will be marked as collected.</p>
          )}
          <div className="flex gap-3">
            <Button disabled={actionLoading} onClick={handleDeliver} className="flex-1 bg-green-600 hover:bg-green-700">
              {actionLoading ? "Marking..." : "Mark as Delivered"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {activeModal === "rto" && targetOrder && (
        <Modal title={`Return / RTO — ${targetOrder.order_number}`} onClose={closeModal}>
          <div className="space-y-3">
            <select className="w-full border rounded-lg px-3 py-2 text-sm"
              value={rtoForm.type} onChange={(e) => setRtoForm({ ...rtoForm, type: e.target.value as any })}>
              <option value="rto">RTO — Return to Origin</option>
              <option value="returned">Returned by Customer</option>
              <option value="refunded">Refunded</option>
            </select>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm"
              value={rtoForm.reason} onChange={(e) => setRtoForm({ ...rtoForm, reason: e.target.value })} placeholder="Enter reason..." />
          </div>
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading} onClick={handleRTO} className="flex-1 bg-rose-600 hover:bg-rose-700">
              {actionLoading ? "Processing..." : `Mark as ${rtoForm.type.toUpperCase()}`}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {activeModal === "refund" && targetOrder && (
        <Modal title={`Refund to Wallet — ${targetOrder.order_number}`} onClose={closeModal}>
          <div className="p-3 bg-teal-50 rounded-lg text-sm mb-4">
            <p><strong>Customer:</strong> {targetOrder.user?.name}</p>
            <p><strong>Order Total:</strong> ₹{targetOrder.total_price}</p>
          </div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Refund Amount <span className="text-red-500">*</span></label>
          <input type="number" min={1} max={targetOrder.total_price}
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={refundAmount} onChange={(e) => setRefundAmount(e.target.value)} placeholder="Enter amount" />
          <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">Note (optional)</label>
          <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm"
            value={refundNote} onChange={(e) => setRefundNote(e.target.value)} placeholder="Note..." />
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading || !refundAmount} onClick={handleRefund} className="flex-1 bg-teal-600 hover:bg-teal-700">
              {actionLoading ? "Refunding..." : `Refund ₹${refundAmount || 0}`}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}
    </>
  );
}