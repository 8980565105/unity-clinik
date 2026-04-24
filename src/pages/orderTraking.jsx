import React from "react";
export default function OrderTracking({ orders, orderId }) {
  const order = orders.find((o) => o._id === orderId);
  if (!order) return <p>Order not found</p>;
  const history = order.status_history || [];
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 right-0 h-1 bg-gray-300 z-0"></div>

        <div
          className="absolute top-4 left-0 h-1 bg-primary z-0 transition-all duration-500"
          style={{
            width:
              history.length > 1
                ? `${((history.length - 1) / (history.length - 1)) * 100}%`
                : "0%",
          }}
        ></div>
        {history.map((step, index) => {
          const isCompleted = true;
          return (
            <div
              key={step._id}
              className="flex flex-col items-center z-10 flex-1"
            >
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 
                ${
                  isCompleted
                    ? "bg-primary border-primary text-white"
                    : "bg-white border-gray-300 text-gray-400"
                }`}
              >
                ✓
              </div>

              <p className="mt-2 text-xs text-center text-primary font-medium capitalize">
                {step.status.replaceAll("_", " ")}
              </p>

              <p className="text-[10px] text-gray-400">
                {new Date(step.changed_at).toLocaleTimeString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
