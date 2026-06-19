import React, { useEffect, useState } from "react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import CartProgress from "../components/cart/CartProgress";
import SEO from "../components/seo/seo";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Truck, ArrowRight } from "lucide-react";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import Button from "../components/ui/Button";
import cart from "../assets/emptycart.webp";
import toast, { Toaster } from "react-hot-toast";
import { clearCart } from "../features/cart/cartSlice";
import {
  createPayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  createPhonePeOrder,
  verifyPhonePePayment,
} from "../features/payments/paymentThunk";
import { createOrder } from "../features/orders/orderThunk";
import {
  calculateShipping,
  calculatePartialCodAdvance,
} from "../utils/shippingCalculator";
import { fetchSystemSettings } from "../features/systemsetting/systemsetting.Thunk";
import { fetchCart } from "../features/cart/cartThunk";
import LoginForm from "./Login";

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items = [] } = useSelector((state) => state.cart);
  const { pages } = useSelector((state) => state.pages);
  const { loading: paymentLoading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.systemseting.data);
  const checkoutPage = pages?.find((page) => page.slug === "checkout");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY;

  const [selectedPayment, setSelectedPayment] = useState("razorpay");

  const [appliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem("applied_coupon");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [formData, setFormData] = React.useState({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    country: "India",
    state: "",
    city: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    dispatch(fetchPageBySlug("checkout"));
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
      default:
        return "prepaid";
    }
  };

  const settingsLoaded = !!settings;
  const paymentType = getPaymentType(selectedPayment);
  const shipping = settingsLoaded
    ? calculateShipping(subtotal, paymentType, settings)
    : 0;

  const total = Number((subtotal + shipping).toFixed(0));
  const totalSaved = itemDiscount + couponDiscount;
  const partialCodAdvance = calculatePartialCodAdvance(total, settings);
  const isPartialCod = selectedPayment === "partial_cod";

  const getBackendPaymentMethod = (method) => {
    if (method === "partial_cod" || method === "cod") return "COD";
    return "Online";
  };

  const validateForm = (userLS) => {
    if (!userLS || !userLS._id) {
      setShowLoginPopup(true);
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

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleRazorpayAmount = async (
    userLS,
    orderId,
    amount,
    paymentMethod = selectedPayment,
  ) => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      toast.error("Failed to load Razorpay SDK");
      return;
    }
    const razorRes = await dispatch(
      createRazorpayOrder({ amount, order_id: orderId }),
    );
    if (!createRazorpayOrder.fulfilled.match(razorRes)) {
      toast(razorRes.payload || "Razorpay order failed");
      return;
    }
    const razorOrder = razorRes.payload;
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
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
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

  const handleCOD = async (userLS, orderId) => {
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

  const handlePhonePe = async (userLS, orderId) => {
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
        items,
        subtotal,
        shipping,
        coupon_discount: couponDiscount,
        total,
        amount_paid: total,
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
    else if (selectedPayment === "cod" || selectedPayment === "partial_cod")
      await handleCOD(userLS, orderId);
    else await handleRazorpayAmount(userLS, orderId, total, selectedPayment);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center max-w-md w-full">
          <img
            alt="Empty Cart"
            className="w-48 h-48 mx-auto mb-6 opacity-80"
            src={cart}
          />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button variant="common" onClick={() => navigate("/allproducts")}>
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-24">
        <Toaster position="top-center" />

        <SEO
          title={checkoutPage?.meta_title}
          description={checkoutPage?.meta_description}
          image={`${process.env.REACT_APP_API_URL_IMAGE}${checkoutPage?.seo_image}`}
        />

        <CartProgress currentStep={2} />

        <Section>
          <Row className="grid grid-cols-1 custom-lg:grid-cols-[1.4fr_1fr] gap-[30px] items-start">
            <div className="space-y-4">
              {items.length > 0 && (
                <div className="p-4 flex items-center gap-3 bg-green-100 rounded-lg">
                  <Truck size={20} className="text-green-600" />
                  <span className="text-[14px] font-bold text-green-800">
                    Get by{" "}
                    {new Date(Date.now() + 3 * 86400000).toLocaleDateString(
                      "en-IN",
                      { day: "numeric", month: "short" },
                    )}
                  </span>
                </div>
              )}
              <CheckoutForm formData={formData} setFormData={setFormData} />
            </div>

            <div className="custom-lg:sticky custom-lg:top-[100px]">
              <OrderSummary
                formData={formData}
                appliedCoupon={appliedCoupon}
                selectedPayment={selectedPayment}
                setSelectedPayment={setSelectedPayment}
                shipping={shipping}
                subtotal={subtotal}
                total={total}
                mrpTotal={mrpTotal}
                itemDiscount={itemDiscount}
                couponDiscount={couponDiscount}
                partialCodAdvance={partialCodAdvance}
                settingsLoaded={settingsLoaded}
              />
            </div>
          </Row>
        </Section>

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="w-[90%] lg:max-w-[1440px] mx-auto flex items-center justify-between py-3 px-2 hidden md:flex">
            <div className="flex flex-col leading-tight">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-extrabold text-gray-900">
                  ₹{Math.round(total).toLocaleString("en-IN")}
                </span>
                {mrpTotal > total && (
                  <span className="text-[13px] text-gray-400 line-through">
                    ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {totalSaved > 0 && (
                <span className="text-[12px] font-semibold text-green-600">
                  Total Savings ₹
                  {Math.round(totalSaved).toLocaleString("en-IN")}
                </span>
              )}
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={paymentLoading || !settingsLoaded}
              variant="common"
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-white font-bold text-[15px] disabled:opacity-60 shadow-md shadow-blue-200 whitespace-nowrap"
            >
              {paymentLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : !settingsLoaded ? (
                "Loading..."
              ) : (
                <>
                  PLACE ORDER <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-2 h-[60px] md:hidden">
            <div className="flex flex-col justify-center leading-tight ms-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-[20px] font-extrabold text-gray-900">
                  ₹{Math.round(total).toLocaleString("en-IN")}
                </span>
                {mrpTotal > total && (
                  <span className="text-[13px] text-gray-400 line-through">
                    ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {totalSaved > 0 && (
                <span className="text-[12px] font-semibold text-green-600">
                  Total Savings ₹
                  {Math.round(totalSaved).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <Button
              onClick={handlePlaceOrder}
              disabled={paymentLoading || !settingsLoaded}
              variant="common"
              className="flex items-center gap-2 px-6  rounded-xl text-white font-bold text-[15px] disabled:opacity-60 shadow-md shadow-blue-200 whitespace-nowrap rounded-[0px]"
            >
              {paymentLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  PROCESSING...
                </>
              ) : !settingsLoaded ? (
                "Loading..."
              ) : (
                <>
                  PLACE ORDER <ArrowRight size={18} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center">
          <div className="bg-white max-w-md w-full rounded-lg">
            <LoginForm
              onClose={() => setShowLoginPopup(false)}
              onSwitchRegister={() => {}}
              onSwitchForget={() => {}}
            />
          </div>
        </div>
      )}
    </>
  );
}
