import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../features/cart/cartThunk";
import {
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPhonePeOrder,
  verifyPhonePePayment,
} from "../../features/payments/paymentThunk";
import { createOrder } from "../../features/orders/orderThunk";
import toast, { Toaster } from "react-hot-toast";
import { clearCart } from "../../features/cart/cartSlice";
import {
  calculateShipping,
  calculatePartialCodAdvance,
} from "../../utils/shippingCalculator";
import { fetchSystemSettings } from "../../features/systemsetting/systemsetting.Thunk";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Razorpay from "../icons/Razorpay";
import Phonepe from "../icons/Phonepe";

export default function OrderSummary({ formData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items = [], loading } = useSelector((state) => state.cart);
  const { loading: paymentLoading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.systemseting.data);

  const [selectedPayment, setSelectedPayment] = useState("razorpay");

  const [appliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem("applied_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY;

  useEffect(() => {
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  useEffect(() => {
    const cart_id = localStorage.getItem("cart_id");
    if (user && cart_id) dispatch(fetchCart(cart_id));
  }, [dispatch, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const phonePeTxn = params.get("phonepe_txn");
    const phonePeOrderId = params.get("order_id");
    if (phonePeTxn && phonePeOrderId) {
      (async () => {
        const verifyRes = await dispatch(
          verifyPhonePePayment({
            transaction_id: phonePeTxn,
            order_id: phonePeOrderId,
          }),
        );
        if (verifyPhonePePayment.fulfilled.match(verifyRes)) {
          dispatch(clearCart());
          localStorage.removeItem("applied_coupon");
          toast("PhonePe Payment Successful ✅");
          navigate("/ordercompleted");
        } else {
          toast("PhonePe Payment Verification Failed ❌");
        }
      })();
    }
  }, []);

  if (loading)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400">Loading cart...</p>
      </div>
    );

  if (!items.length)
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
        <p className="text-gray-500 text-sm">Your cart is empty.</p>
      </div>
    );

  const getDiscountedPrice = (item) => {
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );
    const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
    if (offerPrice > 0 && offerPrice < originalPrice) {
      return { originalPrice, discountedPrice: offerPrice };
    }
    const discount = item?.product_id?.discount_id?.value || 0;
    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;
    return { originalPrice, discountedPrice };
  };

  const mrpTotal = items.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item).originalPrice * (item.quantity || 1),
    0,
  );

  const offerPriceTotal = items.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item).discountedPrice * (item.quantity || 1),
    0,
  );

  const itemDiscount = mrpTotal - offerPriceTotal;

  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount =
      appliedCoupon.discount_type === "fixed"
        ? appliedCoupon.discount_value
        : (offerPriceTotal * appliedCoupon.discount_value) / 100;
    if (appliedCoupon.max_discount_amount) {
      couponDiscount = Math.min(
        couponDiscount,
        appliedCoupon.max_discount_amount,
      );
    }
  }

  const subtotal = offerPriceTotal - couponDiscount;

  const getPaymentType = (method) => {
    switch (method) {
      case "cod":
      case "partial_cod":
        return "cod";

      case "razorpay":
      case "PhonePe":
      default:
        return "prepaid";
    }
  };
  const paymentType = getPaymentType(selectedPayment);

  const settingsLoaded = !!settings;
  const shipping = settingsLoaded
    ? calculateShipping(subtotal, paymentType, settings)
    : 0;

  // const total = Number((subtotal + shipping).toFixed(2));
  const total = Number((subtotal + shipping).toFixed(0));
  const totalSaved = itemDiscount + couponDiscount;

  const partialCodAdvance = calculatePartialCodAdvance(total, settings);
  const isPartialCod = selectedPayment === "partial_cod";

  const getBackendPaymentMethod = (method) => {
    if (method === "partial_cod" || method === "cod") return "COD";
    if (method === "razorpay") return "Online";
    return "Online";
  };

  // const getStoreOwnerId = () => {
  //   if (!items || items.length === 0) return null;
  //   return (
  //     items[0]?.product_id?.createdBy?._id ||
  //     items[0]?.product_id?.createdBy ||
  //     null
  //   );
  // };

  const validateForm = (userLS) => {
    if (!userLS || !userLS._id) {
      toast("Please login before placing order");
      navigate("/login");
      return false;
    }
    const requiredFields = {
      firstName: "First Name",
      address: "Address",
      state: "State",
      city: "City",
      pincode: "Pin Code",
    };
    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || formData[key].trim() === "") {
        toast(`Please enter ${label}`);
        return false;
      }
    }
    if (!selectedPayment) {
      toast("Select a payment method");
      return false;
    }
    return true;
  };

  const createNewOrder = async (userLS) => {
    const orderData = {
      user_id: userLS._id,
      items,

      subtotal,
      shipping_charge: shipping,
      coupon_discount: couponDiscount,

      total_price: total,

      coupon_id: appliedCoupon?._id || null,

      payment_method: getBackendPaymentMethod(selectedPayment),

      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        phone: formData.phone,
      },
    };
    const orderAction = await dispatch(createOrder(orderData));
    if (!createOrder.fulfilled.match(orderAction)) {
      toast("Order creation failed ❌");
      return null;
    }
    const orderId = orderAction.payload?.data?._id || orderAction.payload?._id;
    if (!orderId) {
      toast("Order ID missing ❌");
      return null;
    }
    return orderId;
  };

  const handleCOD = async (userLS, orderId) => {
    // const storeOwnerId = getStoreOwnerId();
    if (isPartialCod && partialCodAdvance > 0) {
      await handleRazorpayAmount(
        userLS,
        orderId,
        partialCodAdvance,
        "partial_cod",
      );
      return;
    }
    await dispatch(
      createPayment({
        user_id: userLS._id,
        order_id: orderId,
        // store_owner_id: storeOwnerId,
        items,
        subtotal,
        shipping,
        coupon_discount: couponDiscount,
        total,
        amount_paid: 0,
        payment_method: "cod",
        status: "pending",
      }),
    );
    dispatch(clearCart());
    localStorage.removeItem("applied_coupon");
    toast("Order placed successfully! 🎉");
    navigate("/ordercompleted");
  };

  const handleRazorpayAmount = async (
    userLS,
    orderId,
    amount,
    paymentMethod = selectedPayment,
  ) => {
    // const storeOwnerId = getStoreOwnerId();
    const razorRes = await dispatch(
      createRazorpayOrder({
        amount,
        order_id: orderId,
      }),
    );
    if (!createRazorpayOrder.fulfilled.match(razorRes)) {
      console.log("RAZOR ERROR", razorRes);
      toast(razorRes.payload || "Razorpay order failed");
      return;
    }
    console.log("RAZOR RESPONSE =", razorRes);
    console.log("RAZOR PAYLOAD =", razorRes.payload);
    console.log("WINDOW RAZORPAY =", window.Razorpay);
    console.log("RAZOR RESPONSE", razorRes);
    console.log("RAZOR PAYLOAD", razorRes.payload);

    const razorOrder = razorRes.payload;
    console.log(razorOrder);
    if (!razorOrder) {
      toast("Razorpay initialization failed ❌");
      return;
    }
    const options = {
      key: razorpayKey,
      amount: razorOrder.amount,
      currency: "INR",
      name: "ZYFolixo",
      description:
        paymentMethod === "partial_cod"
          ? `Advance Payment ₹${amount}`
          : "Order Payment",
      order_id: razorOrder.id,
      handler: async function (response) {
        const verifyRes = await dispatch(
          verifyRazorpayPayment({
            ...response,
            order_id: orderId,
            user_id: userLS._id,
          }),
        );
        if (!verifyRazorpayPayment.fulfilled.match(verifyRes)) {
          toast("Payment verification failed ❌");
          return;
        }
        await dispatch(
          createPayment({
            user_id: userLS._id,
            order_id: orderId,
            // store_owner_id: storeOwnerId,
            items,
            subtotal,
            shipping,
            coupon_discount: couponDiscount,
            total,
            amount_paid: amount,
            payment_method: paymentMethod,
            status: paymentMethod === "partial_cod" ? "partial" : "completed",
            transaction_id: response.razorpay_payment_id,
          }),
        );
        dispatch(clearCart());
        localStorage.removeItem("applied_coupon");
        toast(
          paymentMethod === "partial_cod"
            ? `Advance ₹${amount} paid! Remaining ₹${Math.round(total - amount)} COD ✅`
            : "Payment Successful ✅",
        );
        navigate("/ordercompleted");
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || user?.email,
        contact: formData.phone || "",
      },
      theme: { color: "#1d4ed8" },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      toast(`Payment failed: ${response.error.description} ❌`);
    });
    rzp.open();
  };

  const handlePhonePe = async (userLS, orderId) => {
    // const storeOwnerId = getStoreOwnerId();
    const phonePeRes = await dispatch(
      createPhonePeOrder({
        amount: total,
        order_id: orderId,
        user_id: userLS._id,
        redirect_url: `${window.location.origin}/payment/phonepe/callback?order_id=${orderId}`,
      }),
    );
    if (!createPhonePeOrder.fulfilled.match(phonePeRes)) {
      toast("PhonePe initialization failed ❌");
      return;
    }
    const paymentUrl =
      phonePeRes.payload?.data?.paymentUrl || phonePeRes.payload?.paymentUrl;
    if (!paymentUrl) {
      toast("PhonePe payment URL missing ❌");
      return;
    }
    await dispatch(
      createPayment({
        user_id: userLS._id,
        order_id: orderId,
        // store_owner_id: storeOwnerId,
        items,
        subtotal,
        shipping,
        coupon_discount: couponDiscount,
        total,
        amount_paid: 0,
        payment_method: "PhonePe",
        status: "pending",
      }),
    );
    toast("Redirecting to PhonePe... 📱");
    window.location.href = paymentUrl;
  };

  const handlePlaceOrder = async () => {
    const userLS = JSON.parse(localStorage.getItem("user"));
    if (!validateForm(userLS)) return;
    const orderId = await createNewOrder(userLS);
    if (!orderId) return;
    if (selectedPayment === "PhonePe") await handlePhonePe(userLS, orderId);
    else if (selectedPayment === "cod") await handleCOD(userLS, orderId);
    else if (selectedPayment === "partial_cod")
      await handleCOD(userLS, orderId);
    else await handleRazorpayAmount(userLS, orderId, total, selectedPayment);
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

  return (
    <>
      <Toaster position="top-center" />

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

          <div className="border-t border-gray-100 my-1" />

          {isPartialCod && (
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
                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  isSelected
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

      <Button
        onClick={handlePlaceOrder}
        disabled={paymentLoading || !settingsLoaded}
        variant="common"
        className="w-full rounded-full disabled:opacity-60 text-white font-bold text-[15px] py-4 rounded-2xl transition-colors shadow-md shadow-blue-200 flex items-center justify-center gap-2"
      >
        {paymentLoading ? (
          "PROCESSING..."
        ) : !settingsLoaded ? (
          "Loading..."
        ) : (
          <>
            {" "}
            Place Order <ArrowRight />{" "}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 mt-3">
        <ShieldCheck size={14} className="text-gray-400" />
        <p className="text-[11px] text-gray-400">100% Secure Checkout</p>
      </div>
    </>
  );
}
