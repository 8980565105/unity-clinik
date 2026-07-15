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
    <div className="fixed inset-0 z-50 flex items-center sm:items-center
                    justify-center bg-black/50 px-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl
                      overflow-hidden max-h-[90vh] flex flex-col">

        <div className="flex items-center justify-between px-5 py-4 border-b">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Track Order</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {order.order_number}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* <button
              onClick={fetchTracking}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs bg-blue-50
                         text-blue-600 px-3 py-1.5 rounded-lg font-medium
                         hover:bg-blue-100 disabled:opacity-50"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              {loading ? "Loading..." : "Refresh"}
            </button> */}
            <button
              onClick={onClose}
              className="p-2 bg-gray-100 rounded-full"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* {order.courier?.awb_number && (
          <div className="px-5 py-3 bg-blue-50 border-b flex
                          items-center justify-between flex-wrap gap-2"> */}
            {/* <div>
              <p className="text-xs text-blue-500 font-medium">AWB Number</p>
              <p className="text-sm font-bold text-blue-800 font-mono">
                {order.courier.awb_number}
              </p>
            </div> */}
            {/* <div className="flex items-center gap-3">
              {isIthink && liveData?.current_status && (
                <span className="text-xs bg-blue-600 text-white px-3
                                 py-1 rounded-full font-semibold">
                  {liveData.current_status}
                </span>
              )} */}
              {/* {order.courier.tracking_url && (
                
                 <a href={order.courier.tracking_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-blue-600 underline font-medium"
                >
                  Track on ithink →
                </a>
              )} */}
            {/* </div>
          </div> */}
        {/* )} */}

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

        {error && (
          <div className="px-5 py-2 bg-red-50 border-b">
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

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