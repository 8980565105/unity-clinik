import React, { useEffect, useState } from "react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
import CartProgress from "../components/cart/CartProgress";
import SEO from "../components/seo/seo";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Truck, ArrowRight, Tag, ChevronRight } from "lucide-react";
import { fetchPageBySlug } from "../features/pages/pagesThunk";
import Button from "../components/ui/Button";
import cart from "../assets/emptycart.webp";
import toast from "react-hot-toast";
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
import { deleteCartItem, fetchCart } from "../features/cart/cartThunk";
import LoginForm from "./Login";
import CouponDrawer from "../components/cart/Coupondrawer";
import { fetchCoupons } from "../features/coupons/couponsThunk";
export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const buyNowMode = location.state?.buyNow;
  const buyNowItem = location.state?.item;
  const { items = [], loading } = useSelector((state) => state.cart);
  const baseItems = buyNowMode ? [buyNowItem] : items;
  const [consultationGift, setConsultationGift] = useState(null);
  const [quantities, setQuantities] = useState(() =>
    Object.fromEntries(
      (baseItems || []).map((item) => [
        item._id || item.product_id?._id,
        item.quantity || 1,
      ]),
    ),
  );
  const handleIncrease = (item) => {
    const key = item._id || item.product_id?._id;
    if ((quantities[key] || 1) >= 20) {
      toast.error("Maximum 20 quantity allowed per item");
      return;
    }
    setQuantities((prev) => ({ ...prev, [key]: (prev[key] || 1) + 1 }));
  };
  const handleDecrease = (item) => {
    const key = item._id || item.product_id?._id;
    setQuantities((prev) => ({
      ...prev,
      [key]: Math.max(1, (prev[key] || 1) - 1),
    }));
  };
  const checkoutItems = (baseItems || []).map((item) => {
    const key = item._id || item.product_id?._id;
    return { ...item, quantity: quantities[key] || item.quantity || 1 };
  });
  const { pages } = useSelector((state) => state.pages);
  const { loading: paymentLoading } = useSelector((state) => state.payments);
  const { user } = useSelector((state) => state.auth);
  const settings = useSelector((state) => state.systemseting.data);
  const checkoutPage = pages?.find((page) => page.slug === "checkout");
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY;
  const [selectedPayment, setSelectedPayment] = useState("razorpay");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartCouponCode, setCartCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { coupons = [] } = useSelector((state) => state.coupons);
  const [autoApplyCode, setAutoApplyCode] = useState(
    location.state?.autoApplyCoupon || null,
  );
  const [userOrderCount, setUserOrderCount] = useState(null);
  const [giftItem, setGiftItem] = useState(null);
  const clearCartItems = async () => {
    const cart_id = localStorage.getItem("cart_id");
    if (!cart_id || buyNowMode) return;

    dispatch(clearCart());

    try {
      for (const item of items) {
        await dispatch(deleteCartItem({ cart_id, item_id: item._id })).unwrap();
      }
    } catch (err) {
      console.error("Cart clear error:", err);
    }
    dispatch(clearCart());
  };
  useEffect(() => {
    if (location.state?.openCouponDrawer) setDrawerOpen(true);
  }, [location.state]);
  useEffect(() => {
    if (!user?._id) {
      setUserOrderCount(0);
      return;
    }
    const fetchOrderCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/orders/public?limit=1`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        setUserOrderCount(data?.data?.total ?? 0);
      } catch {
        setUserOrderCount(0);
      }
    };
    fetchOrderCount();
  }, [user?._id]);
  useEffect(() => {
    if (!user?._id) return;
    const fetchGift = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/bookconsaltans/gift-eligibility?user_id=${user._id}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const data = await res.json();
        if (data?.success && data?.data) setConsultationGift(data.data);
        else setConsultationGift(null);
      } catch {
        setConsultationGift(null);
      }
    };
    fetchGift();
  }, [user?._id]);
  const handleApplyCartCoupon = () => applyCouponByCode(cartCouponCode);
  const handleSelectCoupon = (code) => {
    setCartCouponCode(code);
    applyCouponByCode(code);
    setTimeout(() => setDrawerOpen(false), 800);
  };
  const applyCouponByCode = (code) => {
    const trimmed = code?.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code === trimmed);
    if (!coupon) {
      setCouponMsg({
        text: "Invalid coupon code. Please try again!",
        type: "error",
      });
      return;
    }
    const isFirstOrderOnly =
      coupon.coupon_type === "first_order" || coupon.coupon_type === "referral";

    if (isFirstOrderOnly) {
      if (!user?._id) {
        setCouponMsg({
          text: "Please login to use this coupon!",
          type: "error",
        });
        return;
      }
      if (userOrderCount > 0) {
        setCouponMsg({
          text: "This coupon is only valid on your first order!",
          type: "error",
        });
        return;
      }
    }
    if (coupon.coupon_type === "buy_x_get_y") {
      const buyQty = coupon?.buy_x_get_y?.buy_quantity || 0;
      const getQty = coupon?.buy_x_get_y?.get_quantity || 0;
      const freeProductIds = coupon?.buy_x_get_y?.free_products || [];
      const eligibleQty = items.reduce((total, item) => {
        const key = item._id || item.product_id?._id;
        const actualQty = quantities[key] || item.quantity || 1;
        if (coupon.apply_type === "allproducts") return total + actualQty;
        const isMatched = coupon.products?.some(
          (p) => String(p?._id || p) === String(item?.product_id?._id),
        );
        if (!isMatched) return total;
        return total + actualQty;
      }, 0);
      if (eligibleQty < buyQty) {
        setCouponMsg({
          text: `Add ${buyQty - eligibleQty} more eligible product(s) to use this coupon!`,
          type: "error",
        });
        return;
      }
      if (freeProductIds.length > 0) {
        const freeItems = freeProductIds.slice(0, getQty).map((pid) => ({
          product_id: typeof pid === "object" ? pid._id : pid,
          variant_id: null,
          quantity: 1,
          price: 0,
          original_price: 0,
          is_gift: true,
          is_buy_x_get_y: true,
        }));
        setGiftItem({
          type: "buy_x_get_y",
          items: freeItems,
          getQty,
        });
        setAppliedCoupon(coupon);
        setCartCouponCode(coupon.code);
        setCouponMsg({
          text: `Coupon "${coupon.code}" applied! You get ${getQty} item(s) free!`,
          type: "success",
        });
        return;
      }
      const freeItems = [];
      let remaining = getQty;
      for (const item of items) {
        if (remaining <= 0) break;
        const isMatched =
          coupon.apply_type === "allproducts" ||
          coupon.products?.some(
            (p) => String(p?._id || p) === String(item?.product_id?._id),
          );
        if (!isMatched) continue;
        const key = item._id || item.product_id?._id;
        const actualQty = quantities[key] || item.quantity || 1;
        const freeQty = Math.min(remaining, actualQty);
        freeItems.push({
          product_id: item.product_id?._id || item.product_id,
          variant_id: item.variant_id?._id || item.variant_id || null,
          quantity: freeQty,
          price: 0,
          original_price:
            item.price ||
            item.variant_id?.offerprice ||
            item.variant_id?.price ||
            0,
          is_gift: true,
          is_buy_x_get_y: true,
        });
        remaining -= freeQty;
      }
      setGiftItem(
        freeItems.length > 0
          ? { type: "buy_x_get_y", items: freeItems, getQty }
          : null,
      );
      setAppliedCoupon(coupon);
      setCartCouponCode(coupon.code);
      setCouponMsg({
        text: `Coupon "${coupon.code}" applied! You get ${getQty} item(s) free!`,
        type: "success",
      });
      return;
    }
    if (coupon.coupon_type === "free_gift") {
      const giftIds =
        coupon.gift_product_ids?.length > 0
          ? coupon.gift_product_ids
          : coupon.gift_product_id
            ? [coupon.gift_product_id]
            : [];

      if (giftIds.length > 0) {
        setGiftItem({
          type: "free_gift",
          product_ids: giftIds,
          quantity: 1,
          price: 0,
          original_price: 0,
          is_gift: true,
        });
      } else {
        setGiftItem(null);
      }
      setAppliedCoupon(coupon);
      setCartCouponCode(coupon.code);
      setCouponMsg({
        text: `Coupon "${coupon.code}" applied successfully! 🎁 ${giftIds.length} free gift(s) added!`,
        type: "success",
      });
      return;
    }
    if (
      coupon.apply_type === "Excludeproduct" ||
      coupon.apply_type === "Excludecategories"
    ) {
      const hasNonExcludedItem = items.some((item) => {
        if (coupon.apply_type === "Excludeproduct") {
          return !coupon.products?.some(
            (p) => String(p?._id || p) === String(item?.product_id?._id),
          );
        }
        if (coupon.apply_type === "Excludecategories") {
          const product = item?.product_id;
          const subCatId = String(
            product?.category_id?._id ||
              product?.category_id ||
              product?.subcategory_id?._id ||
              product?.subcategory_id ||
              "",
          );
          return !coupon.subcategories?.some(
            (sub) => String(sub?._id || sub) === subCatId,
          );
        }
        return true;
      });

      if (!hasNonExcludedItem) {
        setCouponMsg({
          text: "This coupon is not valid for the products in your cart!",
          type: "error",
        });
        return;
      }
    }
    setGiftItem(null);
    setAppliedCoupon(coupon);
    setCartCouponCode(coupon.code);
    setCouponMsg({
      text: `Coupon "${coupon.code}" applied successfully!`,
      type: "success",
    });
  };
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
    if (!checkoutItems.length) return;
    dispatch(fetchCoupons({ status: "active" }));
  }, [dispatch, items.length]);
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
          await clearCartItems();
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
    if (offerPrice > 0 && offerPrice < originalPrice)
      return { originalPrice, discountedPrice: offerPrice };
    const discount = item?.product_id?.discount_id?.value || 0;
    const discountedPrice =
      discount > 0
        ? originalPrice - (originalPrice * discount) / 100
        : originalPrice;
    return { originalPrice, discountedPrice };
  };
  const mrpTotal = checkoutItems.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item).originalPrice * (item.quantity || 1),
    0,
  );
  const offerPriceTotal = checkoutItems.reduce(
    (sum, item) =>
      sum + getDiscountedPrice(item).discountedPrice * (item.quantity || 1),
    0,
  );
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCartCouponCode("");
    setCouponMsg({ text: "", type: "" });
    setGiftItem(null);
  };
  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount =
      appliedCoupon.discount_type === "fixed"
        ? appliedCoupon.discount_value
        : (offerPriceTotal * appliedCoupon.discount_value) / 100;
    if (appliedCoupon.max_discount_amount)
      couponDiscount = Math.min(
        couponDiscount,
        appliedCoupon.max_discount_amount,
      );
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
  const partialCodAdvance = calculatePartialCodAdvance(total, settings);
  const isPartialCod = selectedPayment === "partial_cod";

  const getBackendPaymentMethod = (method) => {
    if (method === "partial_cod" || method === "cod") return "COD";
    return "Online";
  };
  const couponDiscountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "fixed"
      ? appliedCoupon.discount_value
      : Math.round((subtotal * appliedCoupon.discount_value) / 100)
    : 0;
  const totalSaved = mrpTotal - subtotal + couponDiscountAmount;
  const itemDiscount = mrpTotal - offerPriceTotal;
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
    let giftItems = [];

    if (giftItem) {
      if (giftItem.type === "buy_x_get_y" && giftItem.items?.length > 0) {
        giftItems = giftItem.items.map((gi) => ({
          product_id:
            typeof gi.product_id === "object"
              ? gi.product_id._id
              : gi.product_id,
          variant_id: gi.variant_id || null,
          quantity: gi.quantity,
          price: 0,
          original_price: gi.original_price || 0,
          pack_of: 1,
          is_gift: true,
          is_buy_x_get_y: true,
        }));
      } else if (giftItem.type === "free_gift") {
        const ids =
          giftItem.product_ids?.length > 0
            ? giftItem.product_ids
            : giftItem.product_id
              ? [giftItem.product_id]
              : [];

        giftItems = ids.map((pid) => ({
          product_id: typeof pid === "object" ? pid._id : pid,
          variant_id: null,
          quantity: 1,
          price: 0,
          original_price: 0,
          pack_of: 1,
          is_gift: true,
        }));
      }
    }

    const finalItems = [...checkoutItems, ...giftItems];

    const orderData = {
      user_id: userLS._id,
      items: finalItems,
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
        await clearCartItems();
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
        items: checkoutItems,
        subtotal,
        shipping,
        coupon_discount: couponDiscount,
        total,
        amount_paid: 0,
        payment_method: "cod",
        status: "pending",
      }),
    );
    await clearCartItems();
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
        items: checkoutItems,
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
  if (!loading && checkoutItems.length === 0) {
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
              <CheckoutForm
                formData={formData}
                setFormData={setFormData}
                setShowLoginPopup={setShowLoginPopup}
                items={baseItems}
                quantities={quantities}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                giftItem={giftItem}
              />
            </div>
            <div className="custom-lg:sticky custom-lg:top-[100px] space-y-6">
              {checkoutItems.length > 0 && (
                <div className="bg-white rounded-[12px] border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-[18px] py-[14px] border-b border-gray-100">
                    <span className="text-[15px] font-bold text-gray-900">
                      Offers & Benefits
                    </span>
                  </div>
                  {appliedCoupon ? (
                    <div className="border border-dashed border-green-400 rounded-[10px] mx-[12px] my-[12px] px-[14px] py-[12px] flex items-center justify-between bg-green-50">
                      <div>
                        <p className="text-[13px] font-bold text-gray-900">
                          '{appliedCoupon.code}' applied
                        </p>
                        {appliedCoupon.coupon_type === "free_gift" ? (
                          <p className="text-[12px] text-green-600 font-medium mt-[2px]">
                            🎁 Free gift for you!
                          </p>
                        ) : (
                          <p className="text-[12px] text-green-600 font-medium mt-[2px]">
                            ₹{couponDiscountAmount.toLocaleString("en-IN")}{" "}
                            coupon savings
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[13px] font-bold text-red-500 border border-red-300 rounded-[6px] px-[14px]py-[6px] hover:bg-red-50 transition-colors ml-[12px] whitespace-nowrap"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="w-full flex items-center justify-between px-[18px] py-[14px] hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[38px] h-[38px] rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Tag size={18} className="text-green-600" />
                        </div>
                        <span className="text-[14px] font-medium text-gray-800">
                          Apply Coupon
                        </span>
                      </div>
                      <ChevronRight size={18} className="text-gray-400" />
                    </button>
                  )}
                  {appliedCoupon && (
                    <button
                      onClick={() => setDrawerOpen(true)}
                      className="w-full text-center text-[12px] text-[#1a5fb4] font-medium py-[10px] border-t border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      Change / View all coupons
                    </button>
                  )}
                  {consultationGift && (
                    <div className="p-4 flex items-center gap-3 bg-pink-50 border border-pink-200 rounded-lg">
                      <span className="text-xl">🎁</span>
                      <div>
                        <p className="text-[13px] font-bold text-pink-700">
                          Free Gift Unlocked: {consultationGift.product?.name}
                        </p>
                        <p className="text-[12px] text-pink-500">
                          Aa product automatically free ma add thase order place
                          karta j!
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
                isBuyNowMode={buyNowMode}
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
              className="flex items-center gap-2 px-6 !rounded-[0px] text-white font-bold text-[15px] disabled:opacity-60 shadow-md shadow-blue-200 whitespace-nowrap"
            >
              {paymentLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin" />
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
      <CouponDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        appliedCoupon={appliedCoupon}
        setAppliedCoupon={setAppliedCoupon}
        cartCouponCode={cartCouponCode}
        setCartCouponCode={setCartCouponCode}
        couponMsg={couponMsg}
        setCouponMsg={setCouponMsg}
        onApplyCartCoupon={handleApplyCartCoupon}
        onSelectCoupon={handleSelectCoupon}
        subtotal={subtotal}
        autoApplyCode={autoApplyCode}
        userOrderCount={userOrderCount}
        checkoutQuantities={quantities}
        items={checkoutItems}
        onAutoApplyDone={() => {
          setAutoApplyCode(null);
          navigate(location.pathname, {
            replace: true,
            state: {
              ...location.state,
              autoApplyCoupon: null,
              openCouponDrawer: false,
            },
          });
        }}
      />
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
