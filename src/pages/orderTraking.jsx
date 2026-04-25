import React from "react";
import { X, ExternalLink } from "lucide-react";

export default function OrderTracking({ order, onClose }) {
  if (!order) return null;

  const history = order.status_history || [];
  const totalSteps = history.length;

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-[660px] rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Order Tracking
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.order_number || order._id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="px-6 py-4 flex flex-wrap gap-x-8 gap-y-3 border-b">
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Status
            </p>
            <p
              className={`text-sm font-semibold capitalize mt-0.5 ${
                order.status === "completed"
                  ? "text-green-500"
                  : order.status === "cancelled"
                    ? "text-red-500"
                    : "text-blue-600"
              }`}
            >
              {order.status?.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Total
            </p>
            <p className="text-sm font-semibold mt-0.5 text-gray-800">
              ₹{order.total_price?.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-gray-400 uppercase tracking-wide">
              Payment
            </p>
            <p className="text-sm font-semibold mt-0.5 text-gray-800">
              {order.payment_method || "N/A"}
            </p>
          </div>
          {order.courier?.partner && (
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                Courier
              </p>
              <p className="text-sm font-semibold mt-0.5 text-gray-800">
                {order.courier.partner}
              </p>
            </div>
          )}
          {order.courier?.awb_number && (
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                AWB No.
              </p>

              <a
                href={order.courier.tracking_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold mt-0.5 text-blue-500 underline flex items-center gap-1"
              >
                {order.courier.awb_number}
                <ExternalLink size={11} />
              </a>
            </div>
          )}
        </div>

        {totalSteps === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">
            No tracking history available.
          </div>
        ) : (
          // <div className="px-8 pt-8 pb-6 overflow-x-scroll scrollbar-hide scroll-smooth">
          <div className="px-8 pt-8 pb-6 overflow-x-scroll scrollbar-hide [&::-webkit-scrollbar]:hidden">
            <div
              className="relative flex items-start"
              style={{ minWidth: `${totalSteps * 90}px` }}
            >
              <div
                className="absolute bg-gray-200"
                style={{
                  top: "15px",
                  left: `calc(${50 / totalSteps}%)`,
                  right: `calc(${50 / totalSteps}%)`,
                  height: "2px",
                  zIndex: 0,
                }}
              />

              <div
                className="absolute bg-green-400 transition-all duration-700"
                style={{
                  top: "15px",
                  left: `calc(${50 / totalSteps}%)`,
                  width:
                    totalSteps > 1
                      ? `calc(${((totalSteps - 1) / totalSteps) * 100}% - ${50 / totalSteps}%)`
                      : "0%",
                  height: "2px",
                  zIndex: 0,
                }}
              />

              {history.map((step, index) => {
                const isLast = index === totalSteps - 1;
                const isCurrentActive =
                  isLast &&
                  order.status !== "completed" &&
                  order.status !== "cancelled";

                return (
                  <div
                    key={step._id}
                    className="flex flex-col items-center relative z-10"
                    style={{ width: `${100 / totalSteps}%` }}
                  >
                    <div
                      className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 font-bold text-xs
                        ${
                          isCurrentActive
                            ? "bg-white border-green-400 text-green-500"
                            : "bg-green-400 border-green-400 text-white"
                        }`}
                      style={{
                        boxShadow: "0 0 0 4px rgba(74,222,128,0.15)",
                      }}
                    >
                      ✓
                    </div>

                    <p className="mt-2 text-[10px] text-center font-semibold text-gray-700 capitalize leading-tight px-0.5">
                      {step.status.replace(/_/g, " ")}
                    </p>

                    <p className="text-[9px] text-gray-400 mt-0.5 text-center">
                      {formatTime(step.changed_at)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {totalSteps > 0 && (
          <div className="mx-6 mb-5 border border-gray-100 rounded-xl overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                Status History
              </p>
              <span className="text-[10px] text-gray-400">
                {totalSteps} updates
              </span>
            </div>
            <div className="divide-y divide-gray-50 max-h-[180px] overflow-y-auto">
              {[...history].reverse().map((h, i) => (
                <div key={h._id} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex flex-col items-center mt-1.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    {i < totalSteps - 1 && (
                      <div className="w-px h-full bg-green-100 mt-1" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="capitalize text-sm font-medium text-gray-800">
                      {h.status.replace(/_/g, " ")}
                    </p>
                    {h.note && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">
                        {h.note}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-0.5">
                      By:{" "}
                      <span className="text-gray-600 font-medium">
                        {h.changed_by}
                      </span>
                    </p>
                  </div>

                  <p className="text-[11px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
                    {formatDateTime(h.changed_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="px-6 pb-5 flex justify-end gap-3">
          {order.courier?.tracking_url && (
            <a
              href={order.courier.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              <ExternalLink size={14} />
              Track on Courier
            </a>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
