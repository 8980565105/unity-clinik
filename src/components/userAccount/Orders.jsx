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
import {
  fetchUserOrders,
  cancelOrder,
  requestReturn,
} from "../../features/orders/orderThunk";
import { addReview } from "../../features/reivews/reviewsThunk";
import { resetReviewStatus } from "../../features/reivews/reviewsSlice";
import toast from "react-hot-toast";
import OrderTracking from "../../pages/orderTraking";
import Loding from "../loding/loding";
import { Link, useNavigate } from "react-router-dom";
import order from "../../assets/order.webp";
import Row from "../ui/Row";
import Button from "../ui/Button";
import NavBtn from "../ui/Navbtn";
import Section from "../ui/Section";
import { fetchPageBySlug } from "../../features/pages/pagesThunk";
import SEO from "../seo/seo";
import ImageUpload from "../ui/ImageUpload";
import { fetchProductById } from "../../features/products/productsThunk";
import VideoUpload from "../ui/videoupload";

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

const getSingleImage = (product, variant) => {
  const productImages = product?.images;
  if (Array.isArray(productImages) && productImages.length > 0) {
    return productImages[0];
  }
  if (productImages) return productImages;

  const variantImages = Array.isArray(variant?.images)
    ? variant.images
    : variant?.images
      ? [variant.images]
      : [];
  return variantImages[0] || "";
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

const CANCELLABLE_STATUSES = [
  "pending",
  "processing",
  "packed",
  "ready_to_ship",
];

const getCancelEligibility = (order) => {
  if (!CANCELLABLE_STATUSES.includes(order.status)) {
    return { canCancel: false, msg: "Cannot cancel at this stage" };
  }
  const hoursSince = (Date.now() - new Date(order.createdAt).getTime()) / 36e5;
  if (hoursSince > 24) {
    return { canCancel: false, msg: "Cancellation window expired (24 hrs)" };
  }
  return { canCancel: true, msg: "" };
};

const getReturnEligibility = (order) => {
  if (order.status !== "completed") return { canReturn: false };
  if (order.return_status && order.return_status !== "none")
    return { canReturn: false, status: order.return_status };
  const deliveredAt = order.courier?.delivered_at;
  if (!deliveredAt) return { canReturn: false };
  const hoursSince = (Date.now() - new Date(deliveredAt).getTime()) / 36e5;
  return { canReturn: hoursSince <= 24 };
};

const OrderCard = ({
  order,
  onReview,
  onTrack,
  onReorder,
  onReturn,
  onCancel,
  baseUrl,
}) => {
  const firstItem = order.items?.[0];
  const [actionMenu, setActionMenu] = useState(null);
  const product = firstItem?.product;
  const variant = firstItem?.variant;
  const productImage = product?.images;
  const imgSrc = `${baseUrl}${productImage}`;

  const statusCfg = getStatus(order.status);
  const StatusIcon = statusCfg.Icon;

  const { canCancel, msg } = getCancelEligibility(order);
  const { canReturn, status: returnStatus } = getReturnEligibility(order);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="hidden lg:flex min-h-[100px]">
        <div className={`w-1 flex-shrink-0 my-1 ${statusCfg.leftBar}`} />
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
        <div className="flex-1 min-w-0 px-5 py-4">
          {order.items?.map((item, index) => {
            const product = item.product || item.product_id;
            const variant = item.variant || item.variant_id;

            const imgSrc = `${baseUrl}${getSingleImage(product, variant)}`;

            return (
              <div
                key={item._id || index}
                className="flex items-center gap-3 mb-4 last:mb-0"
              >
                <Link
                  to={`/products/${product?._id}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={imgSrc}
                    alt={product?.name || "product"}
                    className="w-[72px] h-[72px] object-cover rounded-xl border border-gray-100"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/products/${product?._id}`}>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 hover:text-[#1B4F8A]">
                      {product?.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    Qty : {item.quantity}
                  </p>
                  <p className="text-sm font-bold text-[#1B4F8A]">
                    ₹{item.price_at_order?.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            );
          })}
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
          <div className="relative">
            <Button
              variant="common"
              onClick={() =>
                setActionMenu(actionMenu === order._id ? null : order._id)
              }
              className="!z-10"
            >
              Action
            </Button>

            {actionMenu === order._id && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl !z-20">
                <button
                  onClick={() => {
                    setActionMenu(null);
                    onReorder(order);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100"
                >
                  <RotateCcw size={16} />
                  Re Order
                </button>

                {canReturn && (
                  <button
                    onClick={() => {
                      setActionMenu(null);
                      onReturn(order);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw size={16} />
                    Return Order
                  </button>
                )}
                {returnStatus === "requested" && (
                  <span className="block px-4 py-2 text-xs text-yellow-600">
                    Return requested — pending approval
                  </span>
                )}

                {order.status !== "cancelled" && (
                  <button
                    disabled={!canCancel}
                    onClick={() => canCancel && onCancel(order)}
                    title={!canCancel ? msg : ""}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${
                      canCancel
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <Trash2 size={16} />
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
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

        <div className="border-t border-gray-100">
          {order.items?.map((item, index) => {
            const product = item.product || item.product_id;
            const variant = item.variant || item.variant_id;
            const imgSrc = `${baseUrl}${getSingleImage(product, variant)}`;
            return (
              <div
                key={item._id || `${product?._id}-${index}`}
                className="flex items-center gap-3 px-3 py-3 border-b last:border-b-0 border-gray-100"
              >
                <Link
                  to={`/products/${product?._id}`}
                  className="flex-shrink-0"
                >
                  <img
                    src={imgSrc}
                    alt={product?.name || "product"}
                    className="w-[72px] h-[72px] object-cover rounded-xl border border-gray-100"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link to={`/products/${product?._id}`}>
                    <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
                      {product?.name}
                    </h3>
                  </Link>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity}
                    </p>

                    <p className="text-sm font-bold text-[#1B4F8A]">
                      ₹{item.price_at_order?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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
          <Button
            onClick={() => onReview(order)}
            variant="common"
            // className="flex-1 py-2.5 px-3 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Rate Item
          </Button>

          {/* <button
            onClick={() => onTrack(order)}
            className="flex-1 py-2.5 px-3 text-xs font-semibold text-white bg-[#1B4F8A] rounded-xl hover:bg-[#163f6e] transition-colors"
          >
            Track Order
          </button> */}
          <div className="relative">
            <Button
              variant="common"
              onClick={() =>
                setActionMenu(actionMenu === order._id ? null : order._id)
              }
              className="!z-10"
            >
              Action
            </Button>

            {actionMenu === order._id && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-xl !z-20">
                <button
                  onClick={() => {
                    setActionMenu(null);
                    onReorder(order);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100"
                >
                  <RotateCcw size={16} />
                  Re Order
                </button>

                <button
                  onClick={() => onTrack(order)}
                  // className="flex-1 py-2.5 px-3 text-xs font-semibold text-white bg-[#1B4F8A] rounded-xl hover:bg-[#163f6e] transition-colors"
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100"
                >
                  Track Order
                </button>

                {/* <button className="w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-100">
                  return
                </button> */}

                {canReturn && (
                  <button
                    onClick={() => {
                      setActionMenu(null);
                      onReturn(order);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-orange-600 hover:bg-orange-50"
                  >
                    <RotateCcw size={16} />
                    Return Order
                  </button>
                )}
                {returnStatus === "requested" && (
                  <span className="block px-4 py-2 text-xs text-yellow-600">
                    Return requested — pending approval
                  </span>
                )}
                {/*                 
                {order.status !== "cancelled" && (
                  <button
                    onClick={() => {
                      setActionMenu(null);
                      onCancel(order);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Cancel Order
                  </button>
                )} */}
                {order.status !== "cancelled" && (
                  <button
                    disabled={!canCancel}
                    onClick={() => {
                      if (!canCancel) return;
                      setActionMenu(null);
                      onCancel(order);
                    }}
                    title={!canCancel ? msg : ""}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm ${
                      canCancel
                        ? "text-red-500 hover:bg-red-50"
                        : "text-gray-300 cursor-not-allowed"
                    }`}
                  >
                    <Trash2 size={16} />
                    Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Orders() {
  const navigate = useNavigate();
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
  const [cancelReason, setCancelReason] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    beforeImage: null,
    afterImage: null,
    product_id: "",
  });
  const [returnData, setReturnData] = useState({
    type: "",
    reason: "",
    images: [],
    videos: [],
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
  // const baseUrl = "";

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
      toast.success("Review submitted successfully");

      setIsReviewOpen(false);

      setReviewData({
        rating: 5,
        title: "",
        comment: "",
        beforeImage: null,
        afterImage: null,
        product_id: "",
      });

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
  const handleReorder = async (order) => {
    if (!order?.items?.length) {
      toast.error("No items found in this order");
      return;
    }
    const reorderableItems = order.items.filter(
      (i) => !i.is_gift && !i.is_buy_x_get_y,
    );
    if (!reorderableItems.length) {
      toast.error("No purchasable items found to reorder");
      return;
    }
    const outOfStockItems = order.items.filter(
      (i) => i.variant?.stock_quantity === 0 || i.product?.stock_quantity === 0,
    );
    if (outOfStockItems.length === reorderableItems.length) {
      toast.error("All items in this order are out of stock!");
      return;
    }
    const checkoutItems = await Promise.all(
      reorderableItems
        .filter(
          (i) =>
            i.variant?.stock_quantity !== 0 && i.product?.stock_quantity !== 0,
        )
        .map(async (i) => {
          let variant = i.variant || {};
          let product = i.product || {};

          const variantId =
            typeof i.variant === "object" ? i.variant?._id : i.variant;
          const productId =
            typeof i.product === "object" ? i.product?._id : i.product;

          if (
            productId &&
            (variant.price == null || variant.offerprice == null)
          ) {
            try {
              const resultAction = await dispatch(fetchProductById(productId));

              if (fetchProductById.fulfilled.match(resultAction)) {
                const freshProduct =
                  resultAction.payload?.product || resultAction.payload;

                const freshVariant = freshProduct?.variants?.find(
                  (v) => String(v._id) === String(variantId),
                );

                if (freshVariant) variant = { ...freshVariant, ...variant };
                if (freshProduct) product = { ...freshProduct, ...product };
              }
            } catch (err) {}
          }

          const originalPrice = Number(
            variant.price || product.price || i.price_at_order || 0,
          );

          const offerPrice = Number(variant.offerprice || 0);

          const finalPrice =
            offerPrice > 0 && offerPrice < originalPrice
              ? offerPrice
              : originalPrice;
          const safeProduct = {
            ...product,
            images: product.images || "",
          };
          const safeVariant = {
            ...variant,
            images: Array.isArray(variant.images) ? variant.images : [],
          };

          return {
            product_id: product?._id || productId,
            variant_id: variant?._id || variantId || null,
            product_data: product,
            variant_data: variant,
            quantity: i.quantity || 1,
            pack_of: Number(i.pack_of || 1),
            price: finalPrice,
            original_price: originalPrice,
          };
        }),
    );

    if (!checkoutItems.length) {
      toast.error("No valid items to reorder");
      return;
    }

    navigate("/checkout", {
      state: {
        buyNow: true,
        items: checkoutItems,
      },
    });
  };

  const openReviewModal = (order) => {
    const productId =
      order.items?.[0]?.product?._id || order.items?.[0]?.product_id || "";

    setSelectedOrder(order);

    setReviewData({
      rating: 5,
      title: "",
      comment: "",
      beforeImage: null,
      afterImage: null,
      product_id: productId,
    });

    setIsReviewOpen(true);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (!user) {
      toast.error("Please login first");
      return;
    }

    dispatch(
      addReview({
        product_id: reviewData.product_id,
        user_id: user._id,
        rating: reviewData.rating,
        title: reviewData.title,
        comment: reviewData.comment,
        beforeImage: reviewData.beforeImage,
        afterImage: reviewData.afterImage,
        is_approved: false,
      }),
    );
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
    setCancelReason("");
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      toast.error("Please enter a cancellation reason");
      return;
    }
    if (!selectedOrder?._id) return;

    setCancelLoading(true);
    try {
      const result = await dispatch(
        cancelOrder({
          orderId: selectedOrder._id,
          reason: cancelReason.trim(),
        }),
      );

      if (cancelOrder.fulfilled.match(result)) {
        toast.success("Order cancelled successfully");
        dispatch(fetchUserOrders({ page, limit }));
        closeModal();
        setCancelReason("");
      } else {
        toast.error(result.payload || "Failed to cancel order");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setCancelLoading(false);
    }
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnData({ type: "", reason: "", images: [], videos: [] });
    setIsReturnOpen(true);
  };

  const closeReturnModal = () => {
    setSelectedOrder(null);
    setIsReturnOpen(false);
    setReturnData({ type: "", reason: "", images: [], videos: [] });
  };

  const handleReturnSubmit = async () => {
    if (!returnData.type) {
      toast.error("Please select a return reason (Wrong / Damaged Product)");
      return;
    }
    if (!returnData.reason.trim()) {
      toast.error("Please describe the issue");
      return;
    }
    if (returnData.images.length === 0 && returnData.videos.length === 0) {
      toast.error("Please upload at least one image or video as proof");
      return;
    }
    if (!selectedOrder?._id) return;

    setReturnLoading(true);
    try {
      const result = await dispatch(
        requestReturn({
          orderId: selectedOrder._id,
          type: returnData.type,
          reason: returnData.reason.trim(),
          images: returnData.images,
          videos: returnData.videos,
        }),
      );

      if (requestReturn.fulfilled.match(result)) {
        toast.success("Return request submitted successfully");
        dispatch(fetchUserOrders({ page, limit }));
        closeReturnModal();
      } else {
        toast.error(result.payload || "Failed to submit return request");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setReturnLoading(false);
    }
  };

  if (loading) return <Loding className="!h-[500px]" />;

  return (
    <>
      <SEO
        title={homePage?.meta_title}
        description={homePage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${homePage?.seo_image}`}
      />

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
            </div>
          </div>
        </Row>
        <Row>
          <div className="space-y-5">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard
                  order={order}
                  onReview={openReviewModal}
                  onTrack={openTracking}
                  onReorder={handleReorder}
                  onReturn={openReturnModal}
                  onCancel={openCancelModal}
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
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center px-4">
          <div className="bg-white w-full max-w-[600px] max-h-[85vh] rounded-3xl overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-3xl font-bold">Write Review</h2>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReviewSubmit} className="p-2 md:p-4 lg:p-6">
              <div className="mb-6">
                <h4 className="font-bold text-xl mb-4">Rate this Product</h4>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setReviewData((prev) => ({ ...prev, rating: star }))
                      }
                      className="transition-transform active:scale-90"
                    >
                      <Star
                        size={36}
                        fill={star <= reviewData.rating ? "#facc15" : "none"}
                        strokeWidth={1.5}
                        className={
                          star <= reviewData.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Review Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Give your review a title"
                    value={reviewData.title}
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full h-[55px] border border-gray-200 rounded-xl px-4 text-sm outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Review Description
                  </label>
                  <textarea
                    placeholder="Share your experience with this product"
                    value={reviewData.comment}
                    onChange={(e) =>
                      setReviewData((prev) => ({
                        ...prev,
                        comment: e.target.value,
                      }))
                    }
                    className="w-full h-[95px] border border-gray-200 rounded-xl p-4 text-sm outline-none focus:ring-2 focus:ring-[#1B4F8A] focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <div>
                  <label className="block font-semibold mb-2">
                    Before Image
                  </label>

                  <ImageUpload
                    value={reviewData.beforeImage}
                    onChange={(url) =>
                      setReviewData((prev) => ({
                        ...prev,
                        beforeImage: url,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    After Image
                  </label>

                  <ImageUpload
                    value={reviewData.afterImage}
                    onChange={(url) =>
                      setReviewData((prev) => ({
                        ...prev,
                        afterImage: url,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex  gap-4 mt-6 justify-center">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsReviewOpen(false)}
                  className="items-center !min-w-[150px] w-full rounded-xl font-semibold h-[55px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="common"
                  type="submit"
                  disabled={reviewLoading}
                  className="items-center w-full text-white rounded-xl font-semibold h-[55px]"
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
                </Button>
              </div>
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
      {isCancelOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Cancel Order — {selectedOrder.order_number || selectedOrder._id}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to cancel this order? Stock will be
                restored.
              </p>

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Enter cancellation reason..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button
                onClick={closeModal}
                disabled={cancelLoading}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={cancelLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {cancelLoading ? (
                  <>
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
                    Cancelling...
                  </>
                ) : (
                  "Cancel Order"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {isReturnOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white w-full max-w-[480px] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gray-800">
                Return Order — {selectedOrder.order_number || selectedOrder._id}
              </h3>
              <button
                onClick={closeReturnModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Return request will only be processed after admin approval, and
                the refund will be added to the wallet.
              </p>

              <div className="mb-4 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  What is the issue? <span className="text-red-500">*</span>
                </label>
                <select
                  className="border border-gray-300 rounded-xl w-full p-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                  value={returnData.type}
                  onChange={(e) =>
                    setReturnData((prev) => ({ ...prev, type: e.target.value }))
                  }
                >
                  <option value="">Select reason</option>
                  <option value="wrong_product">Wrong Product</option>
                  <option value="damage_product">Damaged Product</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Product Images{" "}
                  <span className="text-gray-400 font-normal">(max 5)</span>
                </label>
                <ImageUpload
                  value={returnData.images}
                  onChange={(urls) =>
                    setReturnData((prev) => ({ ...prev, images: urls || [] }))
                  }
                  multiple
                  maxFiles={5}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Product Videos{" "}
                  <span className="text-gray-400 font-normal">(max 5)</span>
                </label>
                <VideoUpload
                  value={returnData.videos}
                  onChange={(urls) =>
                    setReturnData((prev) => ({ ...prev, videos: urls || [] }))
                  }
                  multiple
                  maxFiles={5}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Upload clear images or short video showing product issue.
                </p>
              </div>

              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Reason Description <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                value={returnData.reason}
                onChange={(e) =>
                  setReturnData((prev) => ({ ...prev, reason: e.target.value }))
                }
                placeholder="Describe what's wrong with the product..."
                className="w-full border border-gray-200 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={closeReturnModal}
                disabled={returnLoading}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleReturnSubmit}
                disabled={returnLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {returnLoading ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
