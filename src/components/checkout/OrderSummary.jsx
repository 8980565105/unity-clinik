import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../../features/cart/cartThunk";
import { getImageUrl } from "../utils/helper";
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

export default function OrderSummary({ formData }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items = [], loading } = useSelector((state) => state.cart);
  const { loading: paymentLoading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);

  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [paymentError, setPaymentError] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

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
    const cart_id = localStorage.getItem("cart_id");
    if (user && cart_id) {
      dispatch(fetchCart(cart_id));
    }
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

  if (loading) return <p>Loading cart...</p>;
  if (!items.length)
    return <p className="text-center mb-[100px]">Your cart is empty.</p>;

  // const getDiscountedPrice = (item) => {
  //   const originalPrice = Number(item?.variant_id?.price || 0);
  //   const offerPrice = Number(item?.variant_id?.offerprice || 0);
  //   if (offerPrice > 0 && offerPrice < originalPrice) {
  //     return {
  //       discount: Math.round(
  //         ((originalPrice - offerPrice) / originalPrice) * 100,
  //       ),
  //       originalPrice,
  //       discountedPrice: offerPrice,
  //     };
  //   }
  //   const discount = item?.product_id?.discount_id?.value || 0;
  //   const discountedPrice =
  //     discount > 0
  //       ? originalPrice - (originalPrice * discount) / 100
  //       : originalPrice;
  //   return { discount, originalPrice, discountedPrice };
  // };

  const getDiscountedPrice = (item) => {
    // selected pack data from DB
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );

    const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);

    // pack price discount
    if (offerPrice > 0 && offerPrice < originalPrice) {
      return {
        discount: Math.round(
          ((originalPrice - offerPrice) / originalPrice) * 100,
        ),
        originalPrice,
        discountedPrice: offerPrice,
      };
    }

    // fallback product discount
    const discount = item?.product_id?.discount_id?.value || 0;

    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;

    return {
      discount,
      originalPrice,
      discountedPrice,
    };
  };
  const subtotal = items.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item).discountedPrice * (item.quantity || 1),
    0,
  );
  const taxes = Number((subtotal * 0.1).toFixed(2));
  const shipping = 0;
  const totalBeforeCoupon = Number((subtotal + taxes + shipping).toFixed(2));

  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount =
      appliedCoupon.discount_type === "fixed"
        ? appliedCoupon.discount_value
        : (totalBeforeCoupon * appliedCoupon.discount_value) / 100;
    if (appliedCoupon.max_discount_amount) {
      couponDiscount = Math.min(
        couponDiscount,
        appliedCoupon.max_discount_amount,
      );
    }
  }

  const total = Number((totalBeforeCoupon - couponDiscount).toFixed(2));

  const getBackendPaymentMethod = (method) => {
    if (method === "cod") return "COD";
    return "Online";
  };

  const getStoreOwnerId = () => {
    if (!items || items.length === 0) return null;
    return (
      items[0]?.product_id?.createdBy?._id ||
      items[0]?.product_id?.createdBy ||
      null
    );
  };

  const validateForm = (userLS) => {
    if (!userLS || !userLS._id) {
      toast("Please login before placing order");
      navigate("/login");
      return false;
    }
    const requiredFields = {
      email: "Email Address",
      firstName: "First Name",
      lastName: "Last Name",
      address: "Address",
      country: "Country",
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
    const storeOwnerId = getStoreOwnerId();
    await dispatch(
      createPayment({
        user_id: userLS._id,
        order_id: orderId,
        store_owner_id: storeOwnerId,
        items,
        subtotal,
        taxes,
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

  const handleRazorpay = async (userLS, orderId) => {
    const storeOwnerId = getStoreOwnerId();
    const razorRes = await dispatch(
      createRazorpayOrder({ amount: total, order_id: orderId }),
    );
    const razorOrder = razorRes.payload;
    if (!razorOrder) {
      toast("Razorpay initialization failed ❌");
      return;
    }

    const options = {
      key: razorpayKey,
      amount: razorOrder.amount,
      currency: "INR",
      name: "Unity Clinic",
      description: "Order Payment",
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
            store_owner_id: storeOwnerId,
            items,
            subtotal,
            taxes,
            shipping,
            coupon_discount: couponDiscount, // ✅
            total,
            amount_paid: total,
            payment_method: selectedPayment,
            status: "completed",
            transaction_id: response.razorpay_payment_id,
          }),
        );
        dispatch(clearCart());
        localStorage.removeItem("applied_coupon"); // ✅
        toast("Payment Successful ✅");
        navigate("/ordercompleted");
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || user?.email,
        contact: formData.phone || "",
      },
      config:
        selectedPayment === "credit_card"
          ? {
              display: {
                blocks: {
                  banks: {
                    name: "Pay via Card",
                    instruments: [{ method: "card" }],
                  },
                },
                sequence: ["block.banks"],
                preferences: { show_default_blocks: false },
              },
            }
          : {},
      theme: { color: "#F43297" },
    };
    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      toast(`Payment failed: ${response.error.description} ❌`);
    });
    rzp.open();
  };

  const handlePhonePe = async (userLS, orderId) => {
    const storeOwnerId = getStoreOwnerId();
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
        store_owner_id: storeOwnerId,
        items,
        subtotal,
        taxes,
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
    if (selectedPayment === "cod") await handleCOD(userLS, orderId);
    else if (selectedPayment === "PhonePe")
      await handlePhonePe(userLS, orderId);
    else await handleRazorpay(userLS, orderId);
  };

  const paymentMethods = [
    { value: "cod", label: "Cash on Delivery" },
    { value: "PhonePe", label: "PhonePe" },
    { value: "razorpay", label: "Razorpay" },
    { value: "credit_card", label: "Credit Card" },
  ];

  return (
    <>
      <Toaster position="top-center" />
      <div className="w-full rounded-[3px] py-[45px] px-[22px] light-color">
        <h2 className="text-[22px] text-black mb-[50px] text-center">
          Order Summary
          <div className="flex justify-center">
            <span className="theme-border-block w-[34px] h-[2px] rounded-[10px] block"></span>
          </div>
        </h2>

        <div className="pb-[10px] text-p">
          {items.reduce((sum, item) => sum + (item.quantity || 1), 0)} items
        </div>

        {items.map((item, index) => (
          <div
            key={item._id || index}
            className="flex border-b border-[#BCBCBC] pb-[10px] mb-[30px]"
          >
            <div className="relative w-[80px] md:w-[105px] h-auto flex-shrink-0">
              <Link to={`/products/${item.product_id?._id}`}>
                <img
                  src={
                    item.variant_id?.images?.length > 0
                      ? getImageUrl(item.variant_id.images[0])
                      : getImageUrl(item.product_id?.images?.[0])
                  }
                  alt={item.product_id?.name}
                  className="w-full h-[122px] md:h-[150px] object-contain"
                />
              </Link>
              <span className="absolute top-[-10px] right-[-10px] w-[22px] h-[22px] bg-white text-black text-p rounded-full flex items-center justify-center">
                {item.quantity || 1}
              </span>
            </div>
            <div className="flex justify-between gap-[10px] flex-1 ml-4">
              <p className="text-14 text-gray-700">{item.product_id?.name}</p>
              <p className="text-p text-right">
                ₹
                {Math.round(
                  getDiscountedPrice(item).discountedPrice * item.quantity,
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        ))}

        <div className="border-t pb-[30px] space-y-[14px] text-p text-light">
          <div className="flex justify-between text-black">
            <span>Subtotal</span>
            <span>₹ {Math.round(subtotal).toLocaleString("en-IN")}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>

          <div className="flex justify-between">
            <span>Taxes (10%)</span>
            <span>₹ {Math.round(taxes).toLocaleString("en-IN")}</span>
          </div>

          {appliedCoupon && couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon ({appliedCoupon.code}):</span>
              <span>
                - ₹{Math.round(couponDiscount).toLocaleString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between text-p text-black">
            <span>Total (₹)</span>
            <span className="text-20px font-medium">
              ₹{Math.round(total).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        <div className="text-light text-14 space-y-[10px]">
          {paymentMethods.map(({ value, label }) => (
            <label
              key={value}
              className="flex items-center gap-2 cursor-pointer text-p"
            >
              <input
                type="radio"
                name="payment"
                value={value}
                checked={selectedPayment === value}
                onChange={(e) => setSelectedPayment(e.target.value)}
                className="peer appearance-none w-4 h-4 border-[1px] checked:border-[3px] border-black rounded-full
                  border-[#000000] checked:border-[#F43297] transition-all duration-200"
              />
              <span className="capitalize flex items-center gap-2">
                {label}
              </span>
            </label>
          ))}

          {selectedPayment === "credit_card" && (
            <div className="space-y-[19px] text-light text-14 mt-3">
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(e.target.value.replace(/\D/g, ""))
                }
                maxLength={16}
                className="input-common w-full"
              />
              <div className="flex gap-[13px]">
                <input
                  type="text"
                  placeholder="Expiry (MM/YY)"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="input-common flex-1"
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  onChange={(e) => {
                    setCvv(e.target.value.replace(/\D/g, ""));
                    if (paymentError) setPaymentError("");
                  }}
                  maxLength={4}
                  className="input-common flex-1"
                />
              </div>
            </div>
          )}

          {paymentError && (
            <p className="text-red-500 text-sm mt-2">{paymentError}</p>
          )}
        </div>

        <div className="text-center mt-[50px]">
          <Button
            variant="common"
            className="min-w-auto sm:min-w-[300px] uppercase"
            onClick={handlePlaceOrder}
            disabled={paymentLoading}
          >
            {paymentLoading
              ? "PROCESSING..."
              : selectedPayment === "PhonePe"
                ? "PAY WITH PHONEPE"
                : "PLACE ORDER"}
          </Button>
        </div>
      </div>
    </>
  );
}
