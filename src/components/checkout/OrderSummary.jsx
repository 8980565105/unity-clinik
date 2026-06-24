import React from "react";
import { useSelector } from "react-redux";
import { ShieldCheck } from "lucide-react";
import Razorpay from "../icons/Razorpay";
import Phonepe from "../icons/Phonepe";

export default function OrderSummary({
  formData,
  appliedCoupon,
  selectedPayment,
  setSelectedPayment,
  shipping,
  subtotal,
  total,
  mrpTotal,
  itemDiscount,
  couponDiscount,
  partialCodAdvance,
  settingsLoaded,
  isBuyNowMode,
}) {
  const { items = [], loading } = useSelector((state) => state.cart);

  const isPartialCod = selectedPayment === "partial_cod";

  if (loading && !isBuyNowMode)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading cart...</p>
      </div>
    );

  if (!items.length && !isBuyNowMode) return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
      <p className="text-gray-500 text-sm">Your cart is empty.</p>
    </div>
  );

  const renderShipping = () => {
    if (shipping === 0) {
      return (
        <span className="text-[12px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1 tracking-wide">
          FREE
        </span>
      );
    }
    return (
      <span className="text-[14px] font-bold text-green-600">
        + ₹{Math.round(shipping).toLocaleString("en-IN")}
      </span>
    );
  };

  const paymentMethods = [
    {
      value: "razorpay",
      label: "Razorpay - Online Payment",
      subLabel:
        "GPay / PhonePe / Paytm / UPI / Wallet / Debit Card / Credit Card / Other",
      badge: "100% Safe & Trusted",
      icon: <Razorpay />,
    },
    {
      value: "PhonePe",
      label: "PhonePe",
      subLabel: "Secure UPI Payment",
      icon: <Phonepe />,
    },
    ...(partialCodAdvance > 0
      ? [
        {
          value: "partial_cod",
          label: "Partial COD",
          subLabel: `₹${partialCodAdvance} NOW | REMAINING ON DELIVERY`,
        },
      ]
      : []),
  ];

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-[16px] font-bold text-gray-900">
            Order Summary
          </span>
        </div>

        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-gray-500 font-medium">
              Item Total (MRP)
            </span>
            <span className="text-[14px] font-semibold text-gray-900">
              ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
            </span>
          </div>

          {itemDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-gray-500 font-medium">
                Item Discount
              </span>
              <span className="text-[14px] font-bold text-green-600">
                −₹{Math.round(itemDiscount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          {appliedCoupon && couponDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-[14px] text-gray-500 font-medium">
                Coupon ({appliedCoupon.code})
              </span>
              <span className="text-[14px] font-bold text-green-600">
                −₹{Math.round(couponDiscount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="border-t border-gray-100 my-1" />

          <div className="flex items-center justify-between">
            <span className="text-[18px] font-bold text-gray-800">
              Subtotal
            </span>
            <span className="text-[16px] font-bold text-gray-900">
              ₹{Math.round(subtotal).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[14px] text-gray-500 font-medium">
              Shipping Charges
            </span>
            {renderShipping()}
          </div>


          {isPartialCod && (
            <>
              <div className="border-t border-gray-100 my-1" />
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5 text-sm">
                <p className="font-bold text-amber-800">Partial COD Breakdown</p>
                <div className="flex justify-between text-amber-700">
                  <span>Pay Now (Online):</span>
                  <span className="font-semibold">
                    ₹{partialCodAdvance.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Pay on Delivery:</span>
                  <span className="font-semibold">
                    ₹
                    {Math.round(total - partialCodAdvance).toLocaleString(
                      "en-IN",
                    )}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="border-t border-gray-100 my-1" />

          <div className="flex items-center justify-between">
            <span className="text-[18px] font-bold text-gray-800">
              Order Total
            </span>
            <span className="text-[16px] font-bold text-gray-900">
              ₹{Math.round(total).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-gray-100">
          <span className="text-[15px] font-bold text-gray-900">
            Payment Method
          </span>
        </div>
        <div className="px-5 py-4 space-y-3">
          {paymentMethods.map(({ value, label, subLabel, badge, icon }) => {
            const isSelected = selectedPayment === value;
            return (
              <label
                key={value}
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                  ? "border-primary bg-blue-50/90"
                  : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={value}
                  checked={isSelected}
                  onChange={(e) => setSelectedPayment(e.target.value)}
                  className="mt-0.5 accent-blue-600 w-4 h-4 flex-shrink-0"
                />
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex-shrink-0 mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-semibold text-gray-900">
                      {label}
                    </p>
                    {subLabel && (
                      <p className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">
                        {subLabel}
                      </p>
                    )}
                    {badge && isSelected && (
                      <div className="flex items-center gap-1.5 mt-2">
                        <ShieldCheck size={13} className="text-green-600" />
                        <span className="text-[11px] font-semibold text-green-600">
                          {badge}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </>
  );
}
