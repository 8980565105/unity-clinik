
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirmDialog";
import { toast } from "sonner";
import { Trash2, Download, Search, ChevronDown, ChevronUp, X, Package, Truck, CheckCircle } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  fetchOrders,
  getOrderById,
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
} from "@/features/orders/ordersThunk";
import { fetchWarehouse } from "@/features/warehouse/warehouseThunk"
import { clearSelectedOrder } from "@/features/orders/ordersSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { fetchProducts } from "@/features/products/productsThunk";
import { fetchUsers } from "@/features/users/usersThunk";
import { fetchColors } from "@/features/colors/colorsThunk";
import { fetchSizes } from "@/features/sizes/sizesThunk";
import api from "@/services/api";
import { ROUTES } from "@/services/routes";
import { Order, OrderStatus } from "@/features/orders/ordersSlice";

// ─── Status config ────────────────────────────────────────────────────────────
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

const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "Shiprocket", "Custom"];

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

// ─── Modal wrapper ────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children, wide = false }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
    <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-4`}>
      <div className="flex justify-between items-center px-6 py-4 border-b">
        <h2 className="text-base font-semibold text-gray-800">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

// ─── Advanced filters ─────────────────────────────────────────────────────────
interface AdvancedFilters {
  products: string[]; users: string[]; colors: string[]; sizes: string[];
  minPrice?: number; maxPrice?: number; startDate: string; endDate: string;
}
const DEFAULT_ADVANCED: AdvancedFilters = {
  products: [], users: [], colors: [], sizes: [],
  minPrice: undefined, maxPrice: undefined, startDate: "", endDate: "",
};

function MultiSelectPopover({ label, options, selected, setSelected }: {
  label: string; options: { value: string; label: string }[];
  selected: string[]; setSelected: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full text-left text-xs">
          {selected.length ? selected.map((s) => options.find((o) => o.value === s)?.label).join(", ") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 max-h-64 overflow-y-auto">
        {options.length === 0 ? <p className="text-sm text-gray-400 p-2">No options available</p> : (
          options.map((o) => (
            <div key={o.value} className="flex items-center space-x-2 py-1 px-1">
              <Checkbox
                checked={selected.includes(o.value)}
                onCheckedChange={(checked) => {
                  if (checked) setSelected((prev) => [...prev, o.value]);
                  else setSelected((prev) => prev.filter((s) => s !== o.value));
                }}
              />
              <span className="text-sm">{o.label}</span>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}

// ─── Warehouse type ───────────────────────────────────────────────────────────
interface Warehouse {
  _id: string;
  name: string;
  status: string;
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════════════════
export default function Orders() {
  const dispatch = useDispatch<AppDispatch>();

  const { orders, total, loading, actionLoading, selectedOrder } = useSelector((state: RootState) => state.orders);
  const { products } = useSelector((state: RootState) => state.products);
  const { users } = useSelector((state: RootState) => state.users);
  const { colors } = useSelector((state: RootState) => state.colors);
  const { sizes } = useSelector((state: RootState) => state.sizes);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  // const [popoverOpen, setPopoverOpen] = useState(false);

  const [appliedFilters, setAppliedFilters] = useState({ status: "all", advanced: { ...DEFAULT_ADVANCED } });
  // const [localAdvanced, setLocalAdvanced] = useState<AdvancedFilters>({ ...DEFAULT_ADVANCED });

  // ─── Active modal ──────────────────────────────────────────────────────────
  type ModalType = "detail" | "confirm" | "cancel" | "pack" | "courier" | "ship" | "tracking" | "deliver" | "rto" | null;
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [targetOrder, setTargetOrder] = useState<Order | null>(null);

  // ─── Form states for modals ────────────────────────────────────────────────
  const [adminNote, setAdminNote] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [courierForm, setCourierForm] = useState({ partner: "Delhivery", courier_name: "", awb_number: "", pickup_date: "" });
  const [trackingUrl, setTrackingUrl] = useState("");
  const [rtoForm, setRtoForm] = useState({ type: "rto" as "rto" | "returned" | "refunded", reason: "" });

  // ─── Warehouse states ──────────────────────────────────────────────────────
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseLoading, setWarehouseLoading] = useState(false);

  const limit = 10;

  useEffect(() => {
    dispatch(fetchProducts({ page: 1, limit: 1000 }));
    dispatch(fetchUsers({ page: 1, limit: 1000 }));
    dispatch(fetchColors({ page: 1, limit: 100 }));
    dispatch(fetchSizes({ page: 1, limit: 100 }));
  }, [dispatch]);

  useEffect(() => {
    const handler = setTimeout(() => { setDebouncedQuery(searchQuery); setPage(1); }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const load = async () => {
      setTableLoading(true);
      const { status, advanced } = appliedFilters;
      try {
        await dispatch(fetchOrders({
          page, limit,
          search: debouncedQuery || undefined,
          status: status === "all" ? undefined : status,
          product: advanced.products.length ? advanced.products.join(",") : undefined,
          user: advanced.users.length ? advanced.users.join(",") : undefined,
          color: advanced.colors.length ? advanced.colors.join(",") : undefined,
          size: advanced.sizes.length ? advanced.sizes.join(",") : undefined,
          minPrice: advanced.minPrice, maxPrice: advanced.maxPrice,
          startDate: advanced.startDate || undefined, endDate: advanced.endDate || undefined,
        })).unwrap();
      } catch { toast.error("Failed to fetch orders."); }
      finally { setTableLoading(false); }
    };
    load();
  }, [debouncedQuery, page, appliedFilters, dispatch]);

  // ─── Open modal ───────────────────────────────────────────────────────────
  const openModal = async (type: ModalType, order: Order) => {
    setTargetOrder(order);
    setActiveModal(type);
    // Reset all form fields
    setAdminNote("");
    setCancelReason("");
    setWarehouseName("");
    setCourierForm({ partner: "Delhivery", courier_name: "", awb_number: "", pickup_date: "" });
    setTrackingUrl("");
    setRtoForm({ type: "rto", reason: "" });

    // ── Fetch warehouses only when Pack modal opens ──
    if (type === "pack") {
      setWarehouses([]);
      setWarehouseLoading(true);
      try {
        const res = await dispatch(fetchWarehouse({ status: "active", limit: 1000 })).unwrap();
        // thunk returns payload which may contain { warehouses, total }
        const list: Warehouse[] = res?.warehouses ?? res?.data ?? res ?? [];
        setWarehouses(Array.isArray(list) ? list.filter((w) => w.status === "active") : []);
      } catch {
        toast.error("Failed to load warehouses");
      } finally {
        setWarehouseLoading(false);
      }
    }
  };

  const openDetailModal = async (order: Order) => {
    await dispatch(getOrderById(order._id));
    setActiveModal("detail");
  };

  const closeModal = () => {
    setActiveModal(null);
    setTargetOrder(null);
    dispatch(clearSelectedOrder());
  };

  const refreshOrders = () => {
    const { status, advanced } = appliedFilters;
    dispatch(fetchOrders({
      page, limit, search: debouncedQuery || undefined,
      status: status === "all" ? undefined : status,
    }));
  };

  // ─── Flow handlers ────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(confirmOrder({ id: targetOrder._id, admin_note: adminNote })).unwrap();
      toast.success("Order confirmed! Packing record created.");
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to confirm order"); }
  };

  const handleCancel = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(cancelOrder({ id: targetOrder._id, reason: cancelReason })).unwrap();
      toast.success("Order cancelled.");
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to cancel order"); }
  };

  const handlePack = async () => {
    if (!targetOrder || !warehouseName) return;
    try {
      await dispatch(packOrder({ id: targetOrder._id, warehouse_name: warehouseName })).unwrap();
      toast.success("Order packed.");
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to pack order"); }
  };


  const handleAssignCourier = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(assignCourier({ id: targetOrder._id, ...courierForm })).unwrap();
      toast.success("Courier assigned. Order is ready to ship.");
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to assign courier"); }
  };

  const handleShip = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(shipOrder(targetOrder._id)).unwrap();
      toast.success("Order shipped! Customer will be notified.");
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to ship order"); }
  };

  const handleTracking = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(updateTracking({ id: targetOrder._id, tracking_url: trackingUrl })).unwrap();
      toast.success("Tracking updated.");
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed to update tracking"); }
  };

  const handleDeliver = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(markDelivered(targetOrder._id)).unwrap();
      toast.success("Order marked as delivered.");
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed"); }
  };

  const handleRTO = async () => {
    if (!targetOrder) return;
    try {
      await dispatch(markRTO({ id: targetOrder._id, ...rtoForm })).unwrap();
      toast.success(`Order marked as ${rtoForm.type}`);
      refreshOrders(); closeModal();
    } catch (err: any) { toast.error(err || "Failed"); }
  };

  // ─── Delete ───────────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteOrder(id)).unwrap();
      toast.success("Order deleted.");
    } catch (err: any) { toast.error(err?.message || "Failed to delete order."); }
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      await dispatch(bulkDeleteOrders(selectedIds)).unwrap();
      toast.success(`${selectedIds.length} orders deleted.`);
      setSelectedIds([]);
    } catch (err: any) { toast.error(err?.message || "Failed."); }
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

  const toggleExpand = (id: string) =>
    setExpandedRows((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const totalPages = Math.ceil(total / limit);

  // const activeAdvancedCount = [
  //   appliedFilters.advanced.products.length > 0,
  //   appliedFilters.advanced.users.length > 0,
  //   appliedFilters.advanced.colors.length > 0,
  //   appliedFilters.advanced.sizes.length > 0,
  //   appliedFilters.advanced.minPrice !== undefined || appliedFilters.advanced.maxPrice !== undefined,
  //   !!appliedFilters.advanced.startDate || !!appliedFilters.advanced.endDate,
  // ].filter(Boolean).length;

  // ─── Action buttons per status ────────────────────────────────────────────
  const renderActionButtons = (order: Order) => {
    switch (order.status) {
      case "pending":
        return (
          <>
            <button onClick={() => openModal("confirm", order)} className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 font-medium">Confirm</button>
            <button onClick={() => openModal("cancel", order)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium">Cancel</button>
          </>
        );
      case "processing":
        return (
          <>
            <button onClick={() => openModal("pack", order)} className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-medium">
              <Package size={11} className="inline mr-1" />Pack
            </button>
            <button onClick={() => openModal("cancel", order)} className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200 font-medium">Cancel</button>
          </>
        );
      case "packed":
        return (
          <button onClick={() => openModal("courier", order)} className="px-2 py-1 text-xs rounded bg-orange-100 text-orange-700 hover:bg-orange-200 font-medium">
            <Truck size={11} className="inline mr-1" />Assign Courier
          </button>
        );
      case "ready_to_ship":
        return (
          <button onClick={() => openModal("ship", order)} className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-700 hover:bg-purple-200 font-medium">Dispatch</button>
        );
      case "shipped":
        return (
          <button onClick={() => openModal("tracking", order)} className="px-2 py-1 text-xs rounded bg-cyan-100 text-cyan-700 hover:bg-cyan-200 font-medium">In Transit</button>
        );
      case "in_transit":
        return (
          <>
            <button onClick={() => openModal("deliver", order)} className="px-2 py-1 text-xs rounded bg-green-100 text-green-700 hover:bg-green-200 font-medium">
              <CheckCircle size={11} className="inline mr-1" />Delivered
            </button>
            <button onClick={() => openModal("rto", order)} className="px-2 py-1 text-xs rounded bg-rose-100 text-rose-700 hover:bg-rose-200 font-medium">RTO</button>
          </>
        );
      case "completed":
        return (
          <>
            <button onClick={() => downloadPDF(ROUTES.orders.invoice(order._id), `invoice-${order.order_number}.pdf`)}
              className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 font-medium">Invoice</button>
            <button onClick={() => openModal("rto", order)} className="px-2 py-1 text-xs rounded bg-pink-100 text-pink-700 hover:bg-pink-200 font-medium">Return</button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">Manage all customer orders and track their flow.</p>
        </div>
        <div className="flex">
          <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Export Excel
          </Button>
          {selectedIds.length > 0 && (
            <ConfirmDialog title="Delete Selected Orders" description={`Delete ${selectedIds.length} orders?`} confirmText="Delete All" onConfirm={handleBulkDelete} danger>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" /> Delete selected
              </Button>
            </ConfirmDialog>
          )}
        </div>

      </div>


      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3 flex-wrap">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search order number, status..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          <Select value={appliedFilters.status}
            onValueChange={(v) => { setPage(1); setAppliedFilters((p) => ({ ...p, status: v })); }}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">New Order</SelectItem>
              <SelectItem value="processing">Order Confirmed</SelectItem>
              <SelectItem value="packed">Packed</SelectItem>
              <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="completed">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rto">RTO</SelectItem>
              <SelectItem value="returned">Returned</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border border-gray-200 shadow-sm rounded-lg overflow-hidden">
        <CardHeader className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <CardTitle className="text-base font-semibold text-gray-800">
            Orders
            {/* <span className="text-gray-400 font-normal">({total})</span> */}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto relative">
            {tableLoading && (
              <div className="absolute inset-0 bg-white/70 z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <svg className="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading...
                </div>
              </div>
            )}
            <table className="w-full text-sm text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-3 text-left w-10">
                    <Checkbox
                      checked={selectedIds.length === orders.length && orders.length > 0}
                      onCheckedChange={(c) => setSelectedIds(c ? orders.map((o) => o._id) : [])}
                    />
                  </th>
                  <th className="p-3 text-left">#</th>
                  <th className="p-3 text-left">Order No.</th>
                  <th className="p-3 text-left">Customer</th>
                  <th className="p-3 text-left">Mobile</th>
                  <th className="p-3 text-left">Address</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Payment</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {!tableLoading && orders.length === 0 ? (
                  <tr><td colSpan={10} className="p-10 text-center text-gray-400">No orders found.</td></tr>
                ) : (
                  orders.map((order, index) => {
                    const isExpanded = expandedRows.includes(order._id);
                    return (
                      <React.Fragment key={order._id}>
                        <tr className="hover:bg-gray-50 transition">
                          <td className="p-3">
                            <Checkbox checked={selectedIds.includes(order._id)} onCheckedChange={() => setSelectedIds((p) => p.includes(order._id) ? p.filter((i) => i !== order._id) : [...p, order._id])} />
                          </td>
                          <td className="p-3 font-bold text-gray-500">#{(page - 1) * limit + index + 1}</td>
                          <td className="p-3 font-medium text-blue-600">{order.order_number}</td>
                          <td className="p-3">{order.user?.name || "—"}</td>
                          <td className="p-3">{order.shippingAddress?.phone || "—"}</td>
                          <td className="p-3 text-xs text-gray-500 max-w-[180px] truncate">
                            {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                          </td>
                          <td className="p-3 font-semibold">₹{order.total_price}</td>
                          <td className="p-3">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${order.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {order.payment_method}
                              {/* · {order.payment_status} */}
                            </span>
                          </td>
                          <td className="p-3"><StatusBadge status={order.status} /></td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 flex-wrap justify-end">
                              <button onClick={() => openDetailModal(order)}
                                className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium">View</button>

                              {["packed", "ready_to_ship", "shipped", "in_transit", "completed"].includes(order.status) && (
                                <button onClick={() => downloadPDF(ROUTES.orders.packingSlip(order._id), `slip-${order.order_number}.pdf`)}
                                  className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-medium">Slip</button>
                              )}

                              {renderActionButtons(order)}

                              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toggleExpand(order._id)}>
                                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>

                              <ConfirmDialog title="Delete Order" description={`Delete order "${order.order_number}"?`} confirmText="Delete" onConfirm={() => handleDelete(order._id)} danger>
                                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </ConfirmDialog>
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-gray-50">
                            <td colSpan={10} className="p-0">
                              <div className="p-4 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Order Items</p>
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="text-xs text-gray-500 border-b bg-gray-100">
                                      <th className="px-3 py-2 text-left">Product</th>
                                      <th className="px-3 py-2 text-left">Sku</th>
                                      <th className="px-3 py-2 text-left">Variant</th>
                                      <th className="px-3 py-2 text-center">Qty</th>
                                      <th className="px-3 py-2 text-right">Price</th>
                                      <th className="px-3 py-2 text-right">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {order.items?.map((item: any) => (
                                      <tr key={item._id} className="hover:bg-white">
                                        <td className="px-3 py-2 font-medium">{item.product?.name || "Product"}</td>
                                        <td className="px-3 py-2">{item.variant?.sku}</td>
                                        <td className="px-3 py-2 text-gray-500">
                                          {item.variant ? `${item.variant.color?.[0]?.name || "-"} / ${item.variant.size?.[0]?.name || "-"}` : "-"}
                                        </td>
                                        <td className="px-3 py-2 text-center">{item.quantity}</td>
                                        <td className="px-3 py-2 text-right">₹{item.price_at_order?.toFixed(2)}</td>
                                        <td className="px-3 py-2 text-right font-semibold">₹{(item.price_at_order * item.quantity)?.toFixed(2)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>

                                {order.courier?.awb_number && (
                                  <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm">
                                    <p className="font-semibold text-blue-700 mb-1">Shipping Info</p>
                                    <p>Courier: <strong>{order.courier.name || order.courier.partner}</strong></p>
                                    <p>AWB: <strong>{order.courier.awb_number}</strong></p>
                                    {order.courier.tracking_url && (
                                      <a href={order.courier.tracking_url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">Track Shipment →</a>
                                    )}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 p-4 border-t border-gray-100">
              <Button size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}>
                Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm ${page === i + 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}>
                  {i + 1}
                </button>
              ))}
              <Button size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ MODALS ═══════════════════════════════════════════════════════════ */}

      {/* Order Detail Modal */}
      {activeModal === "detail" && selectedOrder && (
        <Modal title={`Order Detail — ${(selectedOrder as any).order?.order_number || (selectedOrder as any).order_number}`} onClose={closeModal} wide>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <StatusBadge status={(selectedOrder as any).order?.status || (selectedOrder as any).status} />
              <span className="text-gray-400 text-xs">{new Date((selectedOrder as any).order?.createdAt || (selectedOrder as any).createdAt).toLocaleString("en-IN")}</span>
            </div>
            {((selectedOrder as any).order?.courier?.awb_number) && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-700 mb-1">Courier</p>
                <p>Partner: {(selectedOrder as any).order?.courier?.name}</p>
                <p>AWB: {(selectedOrder as any).order?.courier?.awb_number}</p>
                {(selectedOrder as any).order?.courier?.tracking_url && (
                  <a href={(selectedOrder as any).order?.courier?.tracking_url} target="_blank" rel="noreferrer" className="text-blue-600 underline text-xs">Track →</a>
                )}
              </div>
            )}
            {((selectedOrder as any).order?.status_history?.length > 0) && (
              <div>
                <p className="font-semibold text-gray-700 mb-2">Status History</p>
                <div className="space-y-2 border-l-2 border-blue-100 pl-3">
                  {[...((selectedOrder as any).order?.status_history || [])].reverse().map((h: any, i: number) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">{STATUS_LABEL[h.status] || h.status}</p>
                        <p className="text-xs text-gray-400">{new Date(h.changed_at).toLocaleString("en-IN")} · {h.changed_by}{h.note ? ` — ${h.note}` : ""}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={closeModal}>Close</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Order Modal */}
      {activeModal === "confirm" && targetOrder && (
        <Modal title={`Confirm Order — ${targetOrder.order_number}`} onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-1">Verify payment and stock, then confirm this order.</p>
          <p className="text-xs text-indigo-600 mb-3">✓ A Packing record will be auto-created once confirmed.</p>
          <div className="space-y-3">
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <p><strong>Customer:</strong> {targetOrder.user?.name}</p>
              <p><strong>Amount:</strong> ₹{targetOrder.total_price} · {targetOrder.payment_method}</p>
              <p><strong>Address:</strong> {targetOrder.shippingAddress?.city}, {targetOrder.shippingAddress?.state}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Note (optional)</label>
              <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add a note..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading} onClick={handleConfirm} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {actionLoading ? "Confirming..." : "Confirm Order"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Cancel Order Modal */}
      {activeModal === "cancel" && targetOrder && (
        <Modal title={`Cancel Order — ${targetOrder.order_number}`} onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-3">Are you sure you want to cancel this order? Stock will be restored.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason <span className="text-red-500">*</span></label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Enter cancellation reason..." />
          </div>
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading || !cancelReason.trim()} onClick={handleCancel} className="flex-1 bg-red-600 hover:bg-red-700">
              {actionLoading ? "Cancelling..." : "Cancel Order"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Go Back</Button>
          </div>
        </Modal>
      )}

      {/* ─── Pack Order Modal — Warehouse SELECT from API ─────────────────── */}
      {activeModal === "pack" && targetOrder && (
        <Modal title={`Pack Order — ${targetOrder.order_number}`} onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-4">Select a warehouse to pack this order.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warehouse <span className="text-red-500">*</span>
            </label>

            {/* Loading state on the select itself */}
            {warehouseLoading ? (
              <div className="flex items-center gap-2 py-3 px-3 border rounded-lg bg-gray-50 text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading warehouses...
              </div>
            ) : warehouses.length === 0 ? (
              <p className="text-sm text-red-500 py-2">No active warehouses found. Please add a warehouse first.</p>
            ) : (
              <select
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
              >
                <option value="">— Select a warehouse —</option>
                {warehouses.map((w) => (
                  <option key={w._id} value={w.name}>{w.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex gap-3 mt-5">
            <Button
              disabled={actionLoading || warehouseLoading || !warehouseName}
              onClick={handlePack}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              {actionLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Packing...
                </span>
              ) : (
                <><Package size={14} className="mr-1" />Mark as Packed</>
              )}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1" disabled={actionLoading}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      {/* Assign Courier Modal */}
      {activeModal === "courier" && targetOrder && (
        <Modal title={`Assign Courier — ${targetOrder.order_number}`} onClose={closeModal}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Courier Partner <span className="text-red-500">*</span></label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={courierForm.partner} onChange={(e) => setCourierForm({ ...courierForm, partner: e.target.value })}>
                {COURIERS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            {courierForm.partner === "Custom" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Courier Name</label>
                <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  value={courierForm.courier_name} onChange={(e) => setCourierForm({ ...courierForm, courier_name: e.target.value })} placeholder="Enter courier name" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">AWB / Tracking Number <span className="text-red-500">*</span></label>
              <input type="text" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={courierForm.awb_number} onChange={(e) => setCourierForm({ ...courierForm, awb_number: e.target.value })} placeholder="Enter AWB number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
              <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={courierForm.pickup_date} onChange={(e) => setCourierForm({ ...courierForm, pickup_date: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading || !courierForm.awb_number} onClick={handleAssignCourier} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
              <Truck size={14} className="mr-1" />{actionLoading ? "Assigning..." : "Assign & Ready to Ship"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Ship / Dispatch Modal */}
      {activeModal === "ship" && targetOrder && (
        <Modal title={`Dispatch Order — ${targetOrder.order_number}`} onClose={closeModal}>
          <div className="p-3 bg-purple-50 rounded-lg text-sm mb-4">
            <p><strong>Courier:</strong> {targetOrder.courier?.name || targetOrder.courier?.partner}</p>
            <p><strong>AWB:</strong> {targetOrder.courier?.awb_number}</p>
            {targetOrder.courier?.tracking_url && <p><strong>Tracking:</strong> <a href={targetOrder.courier.tracking_url} target="_blank" rel="noreferrer" className="text-blue-500 underline">Link</a></p>}
          </div>
          <p className="text-xs text-yellow-600 mb-4">⚡ Customer will be notified via SMS/Email after dispatch.</p>
          <div className="flex gap-3">
            <Button disabled={actionLoading} onClick={handleShip} className="flex-1 bg-purple-600 hover:bg-purple-700">
              {actionLoading ? "Dispatching..." : "Confirm Dispatch"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Tracking Modal */}
      {activeModal === "tracking" && targetOrder && (
        <Modal title={`Update Tracking — ${targetOrder.order_number}`} onClose={closeModal}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tracking URL (optional)</label>
            <input type="url" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400"
              value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading} onClick={handleTracking} className="flex-1 bg-cyan-600 hover:bg-cyan-700">
              {actionLoading ? "Updating..." : "Mark In Transit"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {/* Deliver Modal */}
      {activeModal === "deliver" && targetOrder && (
        <Modal title={`Mark as Delivered — ${targetOrder.order_number}`} onClose={closeModal}>
          <p className="text-sm text-gray-600 mb-2">Confirm that this order has been delivered to the customer.</p>
          {targetOrder.payment_method === "COD" && (
            <p className="text-xs text-green-600 mb-3 p-2 bg-green-50 rounded">✓ COD payment of ₹{targetOrder.total_price} will be marked as collected.</p>
          )}
          <div className="flex gap-3">
            <Button disabled={actionLoading} onClick={handleDeliver} className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle size={14} className="mr-1" />{actionLoading ? "Marking..." : "Mark as Delivered"}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}

      {/* RTO / Return Modal */}
      {activeModal === "rto" && targetOrder && (
        <Modal title={`Return / RTO — ${targetOrder.order_number}`} onClose={closeModal}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={rtoForm.type} onChange={(e) => setRtoForm({ ...rtoForm, type: e.target.value as any })}>
                <option value="rto">RTO — Return to Origin</option>
                <option value="returned">Returned by Customer</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea rows={3} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                value={rtoForm.reason} onChange={(e) => setRtoForm({ ...rtoForm, reason: e.target.value })} placeholder="Enter reason..." />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button disabled={actionLoading} onClick={handleRTO} className="flex-1 bg-rose-600 hover:bg-rose-700">
              {actionLoading ? "Processing..." : `Mark as ${rtoForm.type.toUpperCase()}`}
            </Button>
            <Button variant="outline" onClick={closeModal} className="flex-1">Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}