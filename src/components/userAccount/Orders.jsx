import React, { useEffect, useState, useRef } from "react";
import OrderCardMobile from "./OrderCardMobile";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageCircleMore,
  MoreVertical,
  Search,
  SlidersHorizontal,
  SortDesc,
  Eye,
  X,
  Star,
  Trash2,
} from "lucide-react";
import sortImg from "../../assets/sorting.png";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders, cancelOrder } from "../../features/orders/orderThunk";
import { addReview } from "../../features/reivews/reviewsThunk";
import { resetReviewStatus } from "../../features/reivews/reviewsSlice";
import toast, { Toaster } from "react-hot-toast";

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
  const [reviewData, setReviewData] = useState({
    rating: 5,
    title: "",
    comment: "",
    product_id: "",
  });
  const { success: reviewSuccess, loading: reviewLoading } = useSelector(
    (state) => state.reviews,
  );
  const sortRef = useRef(null);
  const filterRef = useRef(null);
  const limit = 5;
  const dispatch = useDispatch();
  useEffect(() => {
    if (reviewSuccess) {
      toast("Review submitted successfully!", { position: "top-center" });
      setIsReviewOpen(false);
      setReviewData({ rating: 5, title: "", comment: "", product_id: "" });
      dispatch(resetReviewStatus());
    }
  }, [reviewSuccess, dispatch]);
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
    setReviewData({ ...reviewData, product_id: productId });
    setIsReviewOpen(true);
  };
  const handleReviewSubmit = (e) => {
    e.preventDefault();
    const userId = JSON.parse(localStorage.getItem("user"))._id;

    const finalData = {
      ...reviewData,
      user_id: userId,
      is_approved: true,
    };

    dispatch(addReview(finalData));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setIsSortOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const {
    orders = [],
    total = 0,
    loading,
  } = useSelector((state) => state.orders);
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  useEffect(() => {
    dispatch(fetchUserOrders({ page, limit }));
  }, [dispatch, page]);
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
    "completed",
    "processing",
    "packed",
    "ready_to_ship",
    "shipped",
    "in_transit",
    "cancelled",
  ];

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const formatted = date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    const [day, month, year] = formatted.split(" ");
    return `${day} ${month}, ${year}`;
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    try {
      await dispatch(cancelOrder({ orderId: selectedOrder._id })).unwrap();
      dispatch(fetchUserOrders({ page, limit }));
      closeModal();
    } catch (error) {
      Toaster("Failed to cancel order: " + error);
    }
  };
  const openViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setIsCancelOpen(true);
  };
  const closeModal = () => {
    setSelectedOrder(null);
    setIsViewOpen(false);
    setIsCancelOpen(false);
  };
  if (loading) return <p className="text-center py-10">Loading orders...</p>;
  return (
    <div>
      <Toaster position="top-center" />
      <div className="w-full flex flex-row items-center justify-between gap-3 sm:gap-5 mb-[18px]">
        <div className="w-[226px] flex items-center box-shadow rounded-[3px] px-[10px] py-[6px]">
          <Search className="text-[#BCBCBC] mr-[15px]" size={20} />
          <input
            type="text"
            placeholder="Search anything.."
            className="w-full outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-[10px] sm:gap-[17px]">
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => {
                setIsFilterOpen(!isFilterOpen);
                setIsSortOpen(false);
              }}
              className={`w-full md:w-[120px] flex items-center justify-between text-p box-shadow px-[10px] py-[6px] transition ${isFilterOpen ? "bg-secondary text-primary" : "bg-primary text-secondary hover:bg-secondary hover:text-primary"}`}
            >
              <span className="hidden md:inline capitalize">Filter by </span>
              <SlidersHorizontal size={18} />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-50 max-h-[300px] overflow-y-auto">
                <button
                  onClick={() => {
                    setStatusFilter("all");
                    setIsFilterOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${statusFilter === "all" ? "text-primary font-bold" : ""}`}
                >
                  All Status
                </button>
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 capitalize ${statusFilter === status ? "text-primary font-bold" : "text-gray-700"}`}
                  >
                    {status.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative" ref={sortRef}>
            <button
              onClick={() => {
                setIsSortOpen(!isSortOpen);
                setIsFilterOpen(false);
              }}
              className={`w-full md:w-[120px] flex items-center justify-between text-p box-shadow px-[10px] py-[6px] transition ${isSortOpen ? "text-primary" : "bg-primary text-secondary hover:bg-secondary hover:text-primary"}`}
            >
              <span className="hidden md:inline capitalize">Sort by</span>
              <SortDesc size={18} />
            </button>

            {isSortOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    setPaymentFilter("all");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm  ${paymentFilter === "all" ? "text-primary font-bold" : ""}`}
                >
                  All Orders
                </button>
                <button
                  onClick={() => {
                    setPaymentFilter("Online");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm  ${paymentFilter === "Online" ? " text-primary font-bold" : "text-gray-700"}`}
                >
                  Online Payment
                </button>
                <button
                  onClick={() => {
                    setPaymentFilter("COD");
                    setIsSortOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm  ${paymentFilter === "COD" ? " text-primary font-bold" : "text-gray-700"}`}
                >
                  Cash on Delivery
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <table className="hidden min-[980px]:table w-full box-shadow rounded-[10px] border-collapse overflow-hidden">
        <thead className="light-color text-20px text-dark">
          <tr>
            <th className="p-[12px] px-[30px] py-[10px] text-left font-normal">
              #
            </th>
            <th className="p-[12px] py-[10px] text-left flex gap-[7px] items-center font-normal">
              Order ID{" "}
              <img src={sortImg} className="h-[14px] w-[14px]" alt="sort" />
            </th>
            <th className="p-[12px] py-[10px] text-left font-normal">Date</th>
            <th className="p-[12px] py-[10px] text-left font-normal">Price</th>
            <th className="p-[12px] py-[10px] text-left font-normal">Tax</th>

            <th className="p-[12px] py-[10px] text-left font-normal">Paid</th>
            <th className="p-[12px] py-[10px] text-left font-normal">
              Address
            </th>
            <th className="p-[12px] py-[10px] text-left font-normal">Status</th>
            <th className="p-[12px] py-[10px] px-[30px] text-center font-normal">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order, index) => (
              <tr
                key={order._id}
                className="border-b light-border border-0.5 text-p sec-text-color"
              >
                <td className="p-3 px-[30px] h-[75px]">
                  {index + 1 + (page - 1) * limit}
                </td>
                <td className="p-3 h-[75px]">{order.order_id || order._id}</td>
                <td className="p-3 h-[75px]">{formatDate(order.createdAt)}</td>
                <td className="p-3 h-[75px]">
                  ₹{order.total_price?.toLocaleString()}
                </td>

                <td className="p-3 h-[75px]">
                  ₹{(order.total_price * 0.1).toLocaleString("en-IN")}
                </td>
                <td className="p-3 h-[75px]">
                  <span
                    className={`flex justify-center items-center px-2 py-1 text-[12px] font-medium rounded-[3px] w-[60px] ${
                      order.payment_method === "Online"
                        ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                        : "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                    }`}
                  >
                    {order.payment_method}
                  </span>
                </td>
                <td className="p-3 h-[75px]">
                  {" "}
                  {order.shippingAddress?.address || "-"}
                </td>
                <td className="p-3 h-[75px]">
                  <span
                    className={`flex justify-center items-center px-2 py-2 text-[12px] font-medium rounded-[3px] w-[98px] ${
                      order.status === "completed"
                        ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                        : order.status === "pending"
                          ? "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                          : order.status === "cancelled"
                            ? "bg-[rgba(239,68,68,10%)] text-red-500"
                            : order.status === "shipped"
                              ? " bg-purple-100 text-purple-700"
                              : order.status === "ready_to_ship"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-3 px-[30px] h-[75px]">
                  <div className="flex justify-center items-center gap-[10px] sec-text-color">
                    <button onClick={() => openReviewModal(order)}>
                      <MessageCircleMore size={20} />
                    </button>
                    <button onClick={() => openViewModal(order)}>
                      <Eye size={20} />
                    </button>
                    {order.status !== "cancelled" && (
                      <button
                        onClick={() => openCancelModal(order)}
                        className="text-red-500"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <MoreVertical size={20} />
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center py-6 text-gray-400">
                No results found.
              </td>
            </tr>
          )}

          {totalPages > 1 && (
            <tr>
              <td colSpan="8" className="px-[30px] py-[20px]">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-14 sec-text-color">
                  <p className="sec-text-color text-p">
                    Showing <span>{total === 0 ? 0 : start}</span> to{" "}
                    <span>{end}</span> of <span>{total}</span> entries
                  </p>
                  <div className="flex items-center gap-[10px]">
                    <button
                      className="flex gap-[8px] items-center text-light text-p mr-[10px]"
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeftIcon size={16} /> Back
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setPage(i + 1)}
                        className={`w-[34px] h-[34px] text-light p-1 text-14 rounded-[3px] ${
                          page === i + 1 ? "light-color " : "box-shadow"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      className="flex gap-[8px] items-center text-light text-p ml-[10px]"
                      onClick={() =>
                        setPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={page === totalPages}
                    >
                      Next <ChevronRightIcon size={16} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isViewOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
          <div className="bg-white w-[90%] max-w-[600px] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-dark">Order Details</h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-black"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Order ID</p>
                  <p className="font-medium">
                    {selectedOrder.order_id || selectedOrder._id}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Status</p>
                  <p className="capitalize font-medium text-blue-600">
                    {selectedOrder.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Price</p>
                  <p className="font-bold">
                    ₹{selectedOrder.total_price?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Price</p>
                  <p className="font-bold">
                    ₹{(selectedOrder.total_price * 0.1).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Payment Method</p>
                  <p>{selectedOrder.payment_method || "N/A"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-400">Shipping Address</p>
                  <p className="text-sm">
                    {selectedOrder.shippingAddress?.address ||
                      "No address provided"}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 border-t flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-100 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isCancelOpen && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white w-[90%] max-w-[400px] rounded-lg p-8 text-center shadow-2xl scale-in-center">
            <div className="text-red-500 flex justify-center mb-4">
              <Trash2 size={48} />
            </div>
            <h3 className="text-lg font-bold mb-2 text-dark">Cancel Order?</h3>
            <p className="text-gray-500 mb-6 text-sm">
              Are you sure you want to cancel order{" "}
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                onClick={handleCancelOrder}
              >
                Yes, Cancel
              </button>
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
              >
                No, Keep it
              </button>
            </div>
          </div>
        </div>
      )}

      {isReviewOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white w-full max-w-[480px] rounded-2xl p-0 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-5 border-b bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  write reviews
                </h3>
              </div>
              <button
                onClick={() => setIsReviewOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
              <div className="text-center py-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Rating
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => {
                    const isSelected = num <= reviewData.rating;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() =>
                          setReviewData({ ...reviewData, rating: num })
                        }
                        className="transition-transform active:scale-90 duration-150"
                      >
                        <Star
                          size={36}
                          fill={isSelected ? "#FACC15" : "none"} // Yellow-400 for stars
                          strokeWidth={1.5}
                          className={`${
                            isSelected ? "text-yellow-400" : "text-gray-300"
                          } hover:text-yellow-400 transition-colors cursor-pointer`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  placeholder="write here title"
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
                  className="w-full border border-gray-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400 resize-none"
                  placeholder="write product reviews"
                  value={reviewData.comment}
                  onChange={(e) =>
                    setReviewData({ ...reviewData, comment: e.target.value })
                  }
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={reviewLoading}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:bg-gray-400 disabled:shadow-none mt-2"
              >
                {reviewLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    submit
                  </span>
                ) : (
                  "Submit"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
      <OrderCardMobile
        orders={filteredOrders}
        total={filteredOrders.length}
        page={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
}
