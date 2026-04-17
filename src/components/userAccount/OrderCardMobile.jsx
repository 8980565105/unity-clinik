//D:\mycara\frontend\src\components\userAccount\OrderCardMobile.jsx

import { useState } from "react";
import {
  ChevronDown,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUp,
} from "lucide-react";
import sortImg from "../../assets/sorting.png";

export default function OrderCardMobile({
  orders,
  total,
  page,
  limit,
  onPageChange,
  totalPages,
}) {
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (id) => {
    setOpenRow(openRow === id ? null : id);
  };

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

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="hidden max-[980px]:block [box-shadow:0_2px_4px_rgba(0,0,0,25%)] rounded-[10px] overflow-hidden">
      <div className="block">
        <div className="flex items-center gap-10 light-color text-20px text-dark font-normal p-2 px-[12px]">
          <span className="text-black text-p ">#</span>
          <span className="text-black text-p flex gap-[5px] items-center">
            Order Id
            <img src={sortImg} className="h-[14px] w-[14px]" />
          </span>
        </div>
      </div>

      {orders.map((order, index) => (
        <div key={order._id} className="border-b">
          <div
            className="flex justify-between items-center px-[12px] py-[15px]"
            onClick={() => toggleRow(order._id)}
          >
            <div className="flex items-center gap-10">
              <span className="sec-text-color text-p ">{index + 1}</span>
              <span className="sec-text-color text-p ">
                {order.order_id || order._id}
              </span>
            </div>
            {openRow === order._id ? (
              <ChevronUp className="w-5 h-5 sec-text-color" />
            ) : (
              <ChevronDown className="w-5 h-5 sec-text-color" />
            )}
          </div>

          {/* Expanded Details */}
          {openRow === order._id && (
            <div className="flex flex-col gap-[8px] px-[60px] pb-[20px] text-14 sec-text-color">
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">Date:</span>
                <span>{formatDate(order.createdAt)}</span>
              </p>

              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">Price:</span>
                <span>₹{order.total_price?.toLocaleString()}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">Paid:</span>{" "}
                <span
                  className={`  px-2 py-1 text-[12px]  font-medium rounded-[3px] w-[60px] text-center  items-center ${
                    order.is_paid
                      ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                      : "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                  }`}
                >
                  {order.is_paid ? "Yes" : "No"}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">
                  Address:
                </span>
                <span>{order.shippingAddress?.address || "-"}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">
                  Status:
                </span>{" "}
                <span
                  className={`px-2 py-1 text-[12px]  font-medium rounded-[3px] w-[80px] lg:w-[98px] text-center items-center ${
                    order.status === "completed"
                      ? "bg-[rgba(62,232,99,10%)] text-[#3EE878]"
                      : order.status === "pending"
                        ? "bg-[rgba(235,23,36,10%)] text-[#EB1724]"
                        : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {order.status}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-black w-[80px] inline-block">
                  Comments:
                </span>
                <span>1 Comments</span>
              </p>
            </div>
          )}
        </div>
      ))}
      {totalPages > 1 && (
        <div className="flex justify-between items-center py-[18px] px-[12px] text-sm">
          <div className="flex flex-row justify-between items-center gap-3 text-14 sec-text-color w-full">
            <p className="sec-text-color text-p">
              Showing <span>{total === 0 ? 0 : start}</span> to{" "}
              <span>{end}</span> of <span>{total}</span> entries
            </p>
            <div className="flex items-center gap-[10px]">
              <button
                className="flex items-center gap-1 text-light text-p"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeftIcon size={16} />
              </button>
              <button
                className="flex items-center gap-1 text-light text-p"
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
