// import React from "react";
// import { X, ExternalLink } from "lucide-react";

// export default function OrderTracking({ order, onClose }) {
//   if (!order) return null;

//   const history = order.status_history || [];
//   const totalSteps = history.length;

//   const formatTime = (dateString) => {
//     if (!dateString) return "";
//     return new Date(dateString).toLocaleTimeString("en-IN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   const formatDateTime = (dateString) => {
//     if (!dateString) return "—";
//     return new Date(dateString).toLocaleString("en-IN", {
//       day: "numeric",
//       month: "short",
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });
//   };

//   return (
//     <div
//       className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
//       onClick={(e) => e.target === e.currentTarget && onClose()}
//     >
//       <div className="bg-white w-full max-w-[660px] rounded-2xl shadow-2xl">
//         <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-2xl">
//           <div>
//             <h3 className="text-base font-semibold text-gray-800">
//               Order Tracking
//             </h3>
//             <p className="text-xs text-gray-400 mt-0.5">
//               {order.order_number || order._id}
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-200 rounded-full transition-colors"
//           >
//             <X size={18} className="text-gray-500" />
//           </button>
//         </div>

//         <div className="px-6 py-4 flex flex-wrap gap-x-8 gap-y-3 border-b">
//           <div>
//             <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//               Status
//             </p>
//             <p
//               className={`text-sm font-semibold capitalize mt-0.5 ${
//                 order.status === "completed"
//                   ? "text-green-500"
//                   : order.status === "cancelled"
//                     ? "text-red-500"
//                     : "text-blue-600"
//               }`}
//             >
//               {order.status?.replace(/_/g, " ")}
//             </p>
//           </div>
//           <div>
//             <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//               Total
//             </p>
//             <p className="text-sm font-semibold mt-0.5 text-gray-800">
//               ₹{order.total_price?.toLocaleString()}
//             </p>
//           </div>
//           <div>
//             <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//               Payment
//             </p>
//             <p className="text-sm font-semibold mt-0.5 text-gray-800">
//               {order.payment_method || "N/A"}
//             </p>
//           </div>
//           {order.courier?.partner && (
//             <div>
//               <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//                 Courier
//               </p>
//               <p className="text-sm font-semibold mt-0.5 text-gray-800">
//                 {order.courier.partner}
//               </p>
//             </div>
//           )}
//           {order.courier?.awb_number && (
//             <div>
//               <p className="text-[11px] text-gray-400 uppercase tracking-wide">
//                 AWB No.
//               </p>

//               <a
//                 href={order.courier.tracking_url}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="text-sm font-semibold mt-0.5 text-blue-500 underline flex items-center gap-1"
//               >
//                 {order.courier.awb_number}
//                 <ExternalLink size={11} />
//               </a>
//             </div>
//           )}
//         </div>

//         {totalSteps === 0 ? (
//           <div className="px-6 py-10 text-center text-gray-400 text-sm">
//             No tracking history available.
//           </div>
//         ) : (
//           <div className="px-8 pt-8 pb-6 overflow-x-scroll scrollbar-hide [&::-webkit-scrollbar]:hidden">
//             <div
//               className="relative flex items-start"
//               style={{ minWidth: `${totalSteps * 90}px` }}
//             >
//               <div
//                 className="absolute bg-gray-200"
//                 style={{
//                   top: "15px",
//                   left: `calc(${50 / totalSteps}%)`,
//                   right: `calc(${50 / totalSteps}%)`,
//                   height: "2px",
//                   zIndex: 0,
//                 }}
//               />

//               <div
//                 className="absolute bg-green-400 transition-all duration-700"
//                 style={{
//                   top: "15px",
//                   left: `calc(${50 / totalSteps}%)`,
//                   width:
//                     totalSteps > 1
//                       ? `calc(${((totalSteps - 1) / totalSteps) * 100}% - ${50 / totalSteps}%)`
//                       : "0%",
//                   height: "2px",
//                   zIndex: 0,
//                 }}
//               />

//               {history.map((step, index) => {
//                 const isLast = index === totalSteps - 1;
//                 const isCurrentActive =
//                   isLast &&
//                   order.status !== "completed" &&
//                   order.status !== "cancelled";

//                 return (
//                   <div
//                     key={step._id}
//                     className="flex flex-col items-center relative z-10"
//                     style={{ width: `${100 / totalSteps}%` }}
//                   >
//                     <div
//                       className={`w-[30px] h-[30px] rounded-full flex items-center justify-center border-2 font-bold text-xs
//                         ${
//                           isCurrentActive
//                             ? "bg-white border-green-400 text-green-500"
//                             : "bg-green-400 border-green-400 text-white"
//                         }`}
//                       style={{
//                         boxShadow: "0 0 0 4px rgba(74,222,128,0.15)",
//                       }}
//                     >
//                       ✓
//                     </div>

//                     <p className="mt-2 text-[10px] text-center font-semibold text-gray-700 capitalize leading-tight px-0.5">
//                       {step.status.replace(/_/g, " ")}
//                     </p>

//                     <p className="text-[9px] text-gray-400 mt-0.5 text-center">
//                       {formatTime(step.changed_at)}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {totalSteps > 0 && (
//           <div className="mx-6 mb-5 border border-gray-100 rounded-xl overflow-hidden">
//             <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
//               <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
//                 Status History
//               </p>
//               <span className="text-[10px] text-gray-400">
//                 {totalSteps} updates
//               </span>
//             </div>
//             <div className="divide-y divide-gray-50 max-h-[180px] overflow-y-auto">
//               {[...history].reverse().map((h, i) => (
//                 <div key={h._id} className="flex items-start gap-3 px-4 py-3">
//                   <div className="flex flex-col items-center mt-1.5 shrink-0">
//                     <div className="w-2 h-2 rounded-full bg-green-400" />
//                     {i < totalSteps - 1 && (
//                       <div className="w-px h-full bg-green-100 mt-1" />
//                     )}
//                   </div>

//                   <div className="flex-1 min-w-0">
//                     <p className="capitalize text-sm font-medium text-gray-800">
//                       {h.status.replace(/_/g, " ")}
//                     </p>
//                     {h.note && (
//                       <p className="text-xs text-gray-400 mt-0.5 truncate">
//                         {h.note}
//                       </p>
//                     )}
//                     <p className="text-xs text-gray-400 mt-0.5">
//                       By:{" "}
//                       <span className="text-gray-600 font-medium">
//                         {h.changed_by}
//                       </span>
//                     </p>
//                   </div>

//                   <p className="text-[11px] text-gray-400 shrink-0 mt-0.5 whitespace-nowrap">
//                     {formatDateTime(h.changed_at)}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         <div className="px-6 pb-5 flex justify-end gap-3">
//           {order.courier?.tracking_url && (
//             <a
//               href={order.courier.tracking_url}
//               target="_blank"
//               rel="noreferrer"
//               className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
//             >
//               <ExternalLink size={14} />
//               Track on Courier
//             </a>
//           )}
//           <button
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { fetchOrderTracking } from "../features/orders/orderThunk";
import { X, MapPin, RefreshCw } from "lucide-react";

const STATUS_LABELS = {
  pending:       "Order Placed",
  processing:    "Order Confirmed",
  packed:        "Packed",
  ready_to_ship: "Ready to Ship",
  shipped:       "Shipped",
  in_transit:    "In Transit",
  completed:     "Delivered",
  cancelled:     "Cancelled",
  rto:           "Returned to Origin",
};

export default function OrderTracking({ order, onClose }) {
  const dispatch = useDispatch();
  const [liveData, setLiveData]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const isIthink = order?.courier?.partner === "ithink";

  useEffect(() => {
    fetchTracking();
  }, [order?._id]);

  const fetchTracking = async () => {
    if (!order?._id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await dispatch(fetchOrderTracking(order._id));
      if (fetchOrderTracking.fulfilled.match(res)) {
        setLiveData(res.payload?.live_tracking || null);
      }
    } catch (e) {
      setError("Tracking fetch failed");
    } finally {
      setLoading(false);
    }
  };

  // Scan history — ithink live OR fallback to status_history
  const scanHistory = isIthink && liveData?.scan_history?.length
    ? [...liveData.scan_history].reverse()
    : (order?.status_history || [])
        .slice()
        .reverse()
        .map((h) => ({
          status:   STATUS_LABELS[h.status] || h.status,
          location: "",
          datetime: h.changed_at,
          remark:   h.note,
        }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center
                    justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl
                      overflow-hidden max-h-[90vh] flex flex-col">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Track Order</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.order_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchTracking}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-blue-50
                         text-blue-600 px-3 py-1.5 rounded-lg font-medium
                         hover:bg-blue-100 disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* ── AWB Info ── */}
        {order.courier?.awb_number && (
          <div className="px-5 py-3 bg-blue-50 border-b flex
                          items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs text-blue-500 font-medium">AWB Number</p>
              <p className="text-sm font-bold text-blue-800 font-mono">
                {order.courier.awb_number}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isIthink && liveData?.current_status && (
                <span className="text-xs bg-blue-600 text-white px-3
                                 py-1 rounded-full font-semibold">
                  {liveData.current_status}
                </span>
              )}
              {order.courier.tracking_url && (
                
                 <a href={order.courier.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 underline font-medium"
                >
                  Track on ithink →
                </a>
              )}
            </div>
          </div>
        )}

        {/* ── Expected Delivery ── */}
        {liveData?.expected_delivery_date && (
          <div className="px-5 py-2 bg-green-50 border-b">
            <p className="text-xs text-green-700">
              Expected Delivery:{" "}
              <span className="font-bold">
                {liveData.expected_delivery_date}
              </span>
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="px-5 py-2 bg-red-50 border-b">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* ── Timeline ── */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="text-center py-10 text-gray-400 text-sm">
              <RefreshCw size={24} className="animate-spin mx-auto mb-2
                                              text-blue-400" />
              Fetching live tracking...
            </div>
          ) : scanHistory.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">
              No tracking updates yet
            </p>
          ) : (
            <div>
              {scanHistory.map((scan, i) => (
                <div key={i} className="flex gap-3 mb-1">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0
                      ${i === 0
                        ? "bg-blue-600 ring-2 ring-blue-200"
                        : "bg-gray-300"}`}
                    />
                    {i < scanHistory.length - 1 && (
                      <div className="w-0.5 bg-gray-200 flex-1 min-h-[28px]
                                      mt-1" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-4 flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug
                      ${i === 0 ? "text-blue-700" : "text-gray-700"}`}>
                      {scan.status}
                    </p>
                    {scan.location && (
                      <p className="text-xs text-gray-500 mt-0.5 flex
                                    items-center gap-1">
                        <MapPin size={11} />
                        {scan.location}
                      </p>
                    )}
                    {scan.remark && (
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                        {scan.remark}
                      </p>
                    )}
                    {scan.datetime && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        {new Date(scan.datetime).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}