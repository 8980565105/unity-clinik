import React, { useEffect, useState, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Search,
  X,
  Star,
  Trash2,
  ShoppingBag,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Filter,
  ArrowUpDown,
  RotateCcw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders, cancelOrder } from "../../features/orders/orderThunk";
import { addReview } from "../../features/reivews/reviewsThunk";
import { resetReviewStatus } from "../../features/reivews/reviewsSlice";
import toast, { Toaster } from "react-hot-toast";
import OrderTracking from "../../pages/orderTraking";
import Loding from "../loding/loding";
import { Link } from "react-router-dom";
import order from "../../assets/order.webp";
import Row from "../ui/Row";
import Button from "../ui/Button";
import NavBtn from "../ui/Navbtn";
import Section from "../ui/Section";
import { fetchPageBySlug } from "../../features/pages/pagesThunk";
import SEO from "../seo/seo";

const STATUS_CONFIG = {
  pending: {
    label: "PENDING",
    bg: "bg-red-100",
    text: "text-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    leftBar: "bg-red-500",
    Icon: ShoppingBag,
    bgcolor: "bg-red-50",
  },
  processing: {
    label: "PROCESSING",
    bg: "bg-yellow-100",
    text: "text-yellow-500",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
    leftBar: "bg-yellow-500",
    Icon: Package,
    bgcolor: "bg-yellow-50",
  },
  packed: {
    label: "PACKED",
    bg: "bg-green-100",
    text: "text-green-500",
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
    leftBar: "bg-green-500",
    Icon: Package,
    bgcolor: "bg-green-50",
  },
  ready_to_ship: {
    label: "READY TO SHIP",
    bg: "<bg-blue-10></bg-blue-10>0",
    text: "text-blue-500",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
    leftBar: "bg-blue-500",
    Icon: Truck,
    bgcolor: "bg-blue-50",
  },
  shipped: {
    label: "SHIPPED",
    bg: "bg-purple-100",
    text: "text-purple-500",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
    leftBar: "bg-purple-500",
    Icon: Truck,
    bgcolor: "bg-purple-50",
  },
  in_transit: {
    label: "IN TRANSIT",
    bg: "bg-indigo-100",
    text: "text-indigo-500",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-500",
    leftBar: "bg-indigo-500",
    Icon: Truck,
    bgcolor: "bg-indigo-50",
  },
  completed: {
    label: "COMPLETED",
    bg: "bg-emerald-100",
    text: "text-emerald-500",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-500",
    leftBar: "bg-emerald-500",
    Icon: CheckCircle,
    bgcolor: "bg-emerald-50",
  },
  cancelled: {
    label: "CANCELLED",
    bg: "bg-red-100",
    text: "text-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    leftBar: "bg-red-500",
    Icon: X,
    bgcolor: "bg-red-50",
  },
  returned: {
    label: "  RETURNED",
    bg: "bg-red-100",
    text: "text-red-500",
    iconBg: "bg-red-100",
    iconColor: "text-red-500",
    leftBar: "bg-red-500",
    Icon: RotateCcw,
    bgcolor: "bg-red-50",
  },
};

const getStatus = (status) =>
  STATUS_CONFIG[status] || {
    label: status?.toUpperCase() || "UNKNOWN",
    bg: "bg-gray-100",
    text: "text-gray-500",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    leftBar: "bg-gray-500",
    Icon: X,
    bgcolor: "bg-gray-50",
  };

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString("en-GB", { month: "short" });
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = (hours % 12 || 12).toString().padStart(2, "0");
  return `${day} ${month}, ${year} • ${h}:${minutes} ${ampm}`;
};

const PaymentBadge = ({ method }) => {
  const isOnline = method === "Online";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${
        isOnline
          ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
          : "bg-red-50 text-red-500 border border-red-200"
      }`}
    >
      {method || "COD"}
    </span>
  );
};

const OrderCard = ({ order, onReview, onTrack, baseUrl = "" }) => {
  const firstItem = order.items?.[0];
  const product = firstItem?.product;
  const variant = firstItem?.variant;
  const productImage = variant?.images?.[0] || product?.images?.[0];
  const imgSrc = productImage
    ? `${baseUrl}${productImage}`
    : "https://via.placeholder.com/80x80?text=Product";

  const statusCfg = getStatus(order.status);
  const StatusIcon = statusCfg.Icon;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="hidden lg:flex min-h-[100px]">
        <div className={`w-1 flex-shrink-0 ${statusCfg.leftBar}`} />
        <div
          className={`flex items-center gap-3 px-4 py-4 min-w-[240px] ${statusCfg.bgcolor}`}
        >
          <div
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${statusCfg.iconBg}`}
          >
            <StatusIcon size={20} className={statusCfg.iconColor} />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm leading-tight truncate max-w-[160px]">
              {order.order_number || order.order_id || order._id}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 whitespace-nowrap">
              {formatDate(order.createdAt)}
            </p>
            <span
              className={`inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${statusCfg.bg} ${statusCfg.text}`}
            >
              {statusCfg.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-0">
          <Link to={`/products/${product?._id}`} className="flex-shrink-0">
            <img
              src={imgSrc}
              alt={product?.name || "product"}
              className="w-[72px] h-[72px] object-cover rounded-xl border border-gray-100"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/80x80?text=Product";
              }}
            />
          </Link>
          <div className="min-w-0">
            <Link to={`/products/${product?._id}`}>
              <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-[#1B4F8A] transition-colors">
                {product?.name || "Product"}
              </h3>
            </Link>
            <p className="text-xs text-gray-500 mt-1 text-nowrap">
              Qty: {firstItem?.quantity || 1}
            </p>
            <p className="text-sm font-bold text-[#1B4F8A] mt-0.5">
              ₹{firstItem?.price_at_order?.toLocaleString("en-IN") || "0"}.00
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center items-start gap-1.5 px-5 py-4 min-w-[140px] border-l border-gray-200">
          <p className="text-xs text-gray-400">Total Amount</p>
          <p className="text-base font-bold text-gray-800">
            ₹{order.total_price?.toLocaleString("en-IN")}
          </p>
          <PaymentBadge method={order.payment_method} />
        </div>

        <div className="flex justify-center items-center gap-3 p-3">
          <Button variant="common" onClick={() => onReview(order)}>
            Rate Item
          </Button>
          <Button variant="common" onClick={() => onTrack(order)}>
            Track
          </Button>
        </div>
      </div>

      <div className="lg:hidden">
        <div className="">
          <div className={`w-1 flex-shrink-0 ${statusCfg.leftBar}`} />
          <div className={`flex items-center px-3 py-3 ${statusCfg.bgcolor}`}>
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${statusCfg.iconBg}`}
            >
              <StatusIcon size={16} className={statusCfg.iconColor} />
            </div>
            <div className="flex flex-1 items-center justify-between py-3 px-3 min-w-0 gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-gray-800 text-xs leading-tight truncate">
                  {order.order_number || order.order_id || order._id}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide flex-shrink-0 ${statusCfg.bg} ${statusCfg.text}`}
              >
                {statusCfg.label}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-3 py-3 border-t border-gray-100">
          <Link to={`/products/${product?._id}`} className="flex-shrink-0">
            <img
              src={imgSrc}
              alt={product?.name || "product"}
              className="w-[72px] h-[72px] object-cover rounded-xl border border-gray-100"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/80x80?text=Product";
              }}
            />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/products/${product?._id}`}>
              <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                {product?.name || "Product"}
              </h3>
            </Link>
            <div className="flex items-center lg:justify-between mt-1 sm:gap-2">
              <p className="text-xs text-gray-500">
                Qty: {firstItem?.quantity || 1}
              </p>
              <p className="text-sm font-bold text-[#1B4F8A]">
                ₹{firstItem?.price_at_order?.toLocaleString("en-IN") || "0"}.00
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2.5 border-t border-gray-100 ">
          <div>
            <p className="text-[11px] text-gray-400">Total Amount</p>
            <p className="text-sm font-bold text-gray-800">
              ₹{order.total_price?.toLocaleString("en-IN")}
            </p>
          </div>
          <PaymentBadge method={order.payment_method} />
        </div>

        <div className="flex items-center gap-2 px-3 py-3 border-t border-gray-100">
          <button
            onClick={() => onReview(order)}
            className="flex-1 py-2.5 px-3 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Rate Item
          </button>
          <button
            onClick={() => onTrack(order)}
            className="flex-1 py-2.5 px-3 text-xs font-semibold text-white bg-[#1B4F8A] rounded-xl hover:bg-[#163f6e] transition-colors"
          >
            Track Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    product_id: "",
  });
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const homePage = pages?.find((page) => page.slug === "order");
  const { success: reviewSuccess, loading: reviewLoading } = useSelector(
    (state) => state.reviews,
  );
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const limit = 10;
  const dispatch = useDispatch();
  const baseUrl = process.env.REACT_APP_API_URL_IMAGE || "";

  const {
    orders = [],
    total = 0,
    loading,
  } = useSelector((state) => state.orders);

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    dispatch(fetchUserOrders({ page, limit }));
    dispatch(fetchPageBySlug("order"));
  }, [dispatch, page]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success("Review submitted successfully!", {
        position: "top-center",
      });
      setIsReviewOpen(false);
      setReviewData({ rating: 5, title: "", comment: "", product_id: "" });
      dispatch(resetReviewStatus());
    }
  }, [reviewSuccess, dispatch]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target))
        setIsSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(event.target))
        setIsFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOrders = (orders || []).filter((order) => {
    const matchesSearch = JSON.stringify(order)
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesPayment =
      paymentFilter === "all" || order.payment_method === paymentFilter;
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesPayment && matchesStatus;
  });

  const statusOptions = [
    "pending",
    "processing",
    "packed",
    "ready_to_ship",
    "shipped",
    "in_transit",
    "completed",
    "cancelled",
  ];

  const openReviewModal = (order) => {
    if (order.status !== "completed") {
      toast("You can only review completed orders.", {
        position: "top-center",
      });
      return;
    }
    const productId =
      order.products?.[0]?.product_id || order.items?.[0]?.product_id;
    setSelectedOrder(order);
    setReviewData((prev) => ({ ...prev, product_id: productId }));
    setIsReviewOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const userId = JSON.parse(localStorage.getItem("user"))?._id;
    dispatch(addReview({ ...reviewData, user_id: userId, is_approved: true }));
  };
  const openViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setIsCancelOpen(true);
  };
  const openTracking = (order) => {
    setTrackingOrder(order);
    setIsTrackingOpen(true);
  };
  const closeModal = () => {
    setSelectedOrder(null);
    setIsViewOpen(false);
    setIsCancelOpen(false);
  };

  if (loading) return <Loding className="!h-[500px]" />;

  return (
    <>
      <SEO
        title={homePage?.meta_title}
        description={homePage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${homePage?.seo_image}`}
      />

      <Toaster position="top-center" />

      <Section>
        <Row>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-4 flex-1">
              <img src={order} alt="" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800">
                  My Orders
                </h1>
                <p className="text-sm text-gray-400 mt-0.5">
                  Track and manage all your orders in one place.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2 sm:w-auto">
              <div className="flex-1 sm:w-[240px] flex items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 gap-2 shadow-sm">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search orders, items..."
                  className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm("")}>
                    <X
                      size={14}
                      className="text-gray-400 hover:text-gray-600"
                    />
                  </button>
                )}
              </div>
              <div className="flex justify-between gap-2 items-center">
                <div>
                  <button
                    onClick={() => {
                      setIsFilterOpen(!isFilterOpen);
                      setIsSortOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap w-full ${
                      statusFilter !== "all"
                        ? "bg-[#163f6e] text-white ring-2 ring-[#1B4F8A]/30"
                        : "bg-[#1B4F8A] text-white hover:bg-[#163f6e]"
                    }`}
                  >
                    <Filter size={15} />
                    <span>Filter</span>
                    {statusFilter !== "all" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    )}
                  </button>
                  {isFilterOpen && (
                    <div className="absolute mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
                          Filter by Status
                        </p>
                        <button
                          onClick={() => {
                            setStatusFilter("all");
                            setIsFilterOpen(false);
                            setPage(1);
                          }}
                          className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                            statusFilter === "all"
                              ? "bg-blue-50 text-[#1B4F8A] font-semibold"
                              : "text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          All Status
                        </button>
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setStatusFilter(status);
                              setIsFilterOpen(false);
                              setPage(1);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors capitalize ${
                              statusFilter === status
                                ? "bg-blue-50 text-[#1B4F8A] font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {status.replace(/_/g, " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <button
                    onClick={() => {
                      setIsSortOpen(!isSortOpen);
                      setIsFilterOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap w-full ${
                      paymentFilter !== "all"
                        ? "bg-[#163f6e] text-white ring-2 ring-[#1B4F8A]/30"
                        : "bg-[#1B4F8A] text-white hover:bg-[#163f6e]"
                    }`}
                  >
                    <ArrowUpDown size={15} />
                    <span>Sort</span>
                    {paymentFilter !== "all" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                    )}
                  </button>
                  {isSortOpen && (
                    <div className="absolute mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
                      <div className="p-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2">
                          Sort by Payment
                        </p>
                        {[
                          { value: "all", label: "All Orders" },
                          { value: "Online", label: "Online Payment" },
                          { value: "COD", label: "Cash on Delivery" },
                        ].map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => {
                              setPaymentFilter(value);
                              setIsSortOpen(false);
                              setPage(1);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                              paymentFilter === value
                                ? "bg-blue-50 text-[#1B4F8A] font-semibold"
                                : "text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Row>
        <Row>
          <div className="space-y-5">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order._id}
                  order={order}
                  onReview={openReviewModal}
                  onTrack={openTracking}
                  baseUrl={baseUrl}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-100">
                <ShoppingBag size={48} className="text-gray-200 mb-3" />
                <p className="text-gray-400 font-semibold text-base">
                  No orders found
                </p>
                <p className="text-sm text-gray-300 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </Row>
        <Row>
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 my-5">
              <p className="text-sm text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {total === 0 ? 0 : start}
                </span>{" "}
                to <span className="font-semibold text-gray-600">{end}</span> of{" "}
                <span className="font-semibold text-gray-600">{total}</span>{" "}
                orders
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-primary text-white py-3"
                >
                  <ChevronLeftIcon size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                      page === i + 1
                        ? "bg-[#1B4F8A] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors bg-primary text-white py-3"
                >
                  <ChevronRightIcon size={14} />
                </button>
              </div>
            </div>
          )}
        </Row>
      </Section>

      {isViewOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-[560px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">Order Details</h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                <p className="font-semibold text-sm text-gray-800 break-all">
                  {selectedOrder.order_id || selectedOrder._id}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Status</p>
                <span
                  className={`text-xs font-bold px-2 py-1 rounded-full ${
                    getStatus(selectedOrder.status).bg
                  } ${getStatus(selectedOrder.status).text}`}
                >
                  {getStatus(selectedOrder.status).label}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Total Price</p>
                <p className="font-bold text-gray-800">
                  ₹{selectedOrder.total_price?.toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Tax (10%)</p>
                <p className="font-bold text-gray-800">
                  ₹{(selectedOrder.total_price * 0.1).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Payment Method</p>
                <p className="text-sm text-gray-700">
                  {selectedOrder.payment_method || "N/A"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Shipping Address</p>
                <p className="text-sm text-gray-700">
                  {selectedOrder.shippingAddress?.address ||
                    "No address provided"}
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              {selectedOrder.status !== "cancelled" && (
                <button
                  onClick={() => {
                    closeModal();
                    openCancelModal(selectedOrder);
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Cancel Order
                </button>
              )}
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isReviewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[460px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">
                Write a Review
              </h3>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-5 space-y-4">
              <div className="text-center">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Rating
                </label>
                <div className="flex justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        setReviewData({ ...reviewData, rating: num })
                      }
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={34}
                        fill={num <= reviewData.rating ? "#FACC15" : "none"}
                        strokeWidth={1.5}
                        className={
                          num <= reviewData.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:border-transparent transition-all"
                  placeholder="Give your review a title"
                  value={reviewData.title}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-200 p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:border-transparent transition-all resize-none"
                  placeholder="Share your experience with this product"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-[#1B4F8A] text-white py-3 rounded-xl text-sm font-bold hover:bg-[#163f6e] transition-colors disabled:opacity-60"
              >
                {reviewLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Review"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {isTrackingOpen && trackingOrder && (
        <OrderTracking
          order={trackingOrder}
          onClose={() => {
            setIsTrackingOpen(false);
            setTrackingOrder(null);
          }}
        />
      )}
    </>
  );
}
