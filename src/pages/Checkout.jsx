import React, { useEffect, useMemo, useState } from "react";
import CheckoutForm from "../components/checkout/CheckoutForm";
import OrderSummary from "../components/checkout/OrderSummary";
import Section from "../components/ui/Section";
import Row from "../components/ui/Row";
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
  markPaymentFailed,
} from "../features/payments/paymentThunk";
import { createOrder } from "../features/orders/orderThunk";
import {
  calculateShipping,
  calculatePartialCodAdvance,
  getDisabledPaymentTypes,
} from "../utils/shippingCalculator";
import { deleteCartItem, fetchCart } from "../features/cart/cartThunk";
import LoginForm from "./Login";
import CouponDrawer from "../components/cart/Coupondrawer";
import { fetchCoupons } from "../features/coupons/couponsThunk";
import { fetchShippingCharge } from "../features/sippingcharge/sippingchargeThunk";
import { fetchBalance } from "../features/wallet/walletThunk";
import Offercount from "../components/cart/Offercount";
import api from "../services/api";

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

export default function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const buyNowMode = location.state?.buyNow;
  const buyNowItem = location.state?.item;
  const buyNowItems = location.state?.items;
  const { items = [], loading } = useSelector((state) => state.cart);
  const { balance: walletBalance } = useSelector((state) => state.wallet);
  const { user } = useSelector((state) => state.auth);
  const baseItems = useMemo(() => {
    return buyNowMode
      ? buyNowItems?.length
        ? buyNowItems
        : [buyNowItem]
      : items;
  }, [buyNowMode, buyNowItems, buyNowItem, items]);
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
  const checkoutItems = useMemo(() => {
    return (baseItems || []).map((item) => {
      const key = item._id || item.product_id?._id;
      return { ...item, quantity: quantities[key] || item.quantity || 1 };
    });
  }, [baseItems, quantities]);
  const { pages } = useSelector((state) => state.pages);
  const { loading: paymentLoading } = useSelector((state) => state.payments);
  const settings = useSelector((state) => state.sippingcharge.data);
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
    if (user?._id) dispatch(fetchBalance());
  }, [dispatch, user?._id]);
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
    dispatch(fetchShippingCharge());
  }, [dispatch]);
  useEffect(() => {
    if (!checkoutItems.length) return;
    dispatch(fetchCoupons({ status: "active" }));
  }, [dispatch, checkoutItems.length]);
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
          toast.success("PhonePe Payment Successful ✅");
          navigate("/ordercompleted");
        } else {
          toast.error("PhonePe Payment Verification Failed ❌");
          const userLS = JSON.parse(localStorage.getItem("user"));
          const userId = userLS?._id || user?._id;
          if (userId) {
            await dispatch(
              markPaymentFailed({
                order_id: phonePeOrderId,
                user_id: userId,
                payment_method: "PhonePe",
                type: "order",
              }),
            );
          }
        }
      })();
    }
  }, []);
  const mrpTotal = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) =>
        sum + getDiscountedPrice(item).originalPrice * (item.quantity || 1),
      0,
    );
  }, [checkoutItems]);
  const offerPriceTotal = useMemo(() => {
    return checkoutItems.reduce(
      (sum, item) =>
        sum + getDiscountedPrice(item).discountedPrice * (item.quantity || 1),
      0,
    );
  }, [checkoutItems]);
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCartCouponCode("");
    setCouponMsg({ text: "", type: "" });
    setGiftItem(null);
  };
  const couponDiscount = useMemo(() => {
    if (!appliedCoupon) return 0;
    let discount =
      appliedCoupon.discount_type === "fixed"
        ? appliedCoupon.discount_value
        : (offerPriceTotal * appliedCoupon.discount_value) / 100;
    if (appliedCoupon.max_discount_amount)
      discount = Math.min(discount, appliedCoupon.max_discount_amount);
    return discount;
  }, [appliedCoupon, offerPriceTotal]);
  const subtotal = offerPriceTotal - couponDiscount;
  const overrideItems = useMemo(() => {
    return checkoutItems.filter((item) => {
      const t = item?.variant_id?.shippingChargeType;
      return t && t !== "null";
    });
  }, [checkoutItems]);
  const defaultItems = useMemo(() => {
    return checkoutItems.filter((item) => {
      const t = item?.variant_id?.shippingChargeType;
      return !t || t === "null";
    });
  }, [checkoutItems]);

  const overrideShipping = useMemo(() => {
    return overrideItems.reduce((sum, item) => {
      const type = item.variant_id.shippingChargeType;
      const qty = item.quantity || 1;
      if (type === "free") return sum;
      if (type === "fixed") {
        const value = Number(item.variant_id.shippingChargeValue || 0);
        return sum + value * qty;
      }
      if (type === "percentage") {
        const { discountedPrice } = getDiscountedPrice(item);
        const value = Number(item.variant_id.shippingChargeValue || 0);
        return sum + Math.round((discountedPrice * qty * value) / 100);
      }
      return sum;
    }, 0);
  }, [overrideItems]);
  const settingsLoaded = !!settings;
  const defaultShippingItems = useMemo(() => {
    return defaultItems.map((item) => {
      const { discountedPrice } = getDiscountedPrice(item);
      return {
        productId: item.product_id?._id || item.product_id,
        subCategoryId:
          item.product_id?.subcategory_id?._id ||
          item.product_id?.subcategory_id ||
          item.product_id?.category_id?._id ||
          item.product_id?.category_id,
        price: discountedPrice,
        quantity: item.quantity || 1,
        weight: Number(item?.variant_id?.ProductWeight || 0),
        name: item.product_id?.name || item.product_id?.title || "",
      };
    });
  }, [defaultItems]);
  const couponPrepaidOnly = appliedCoupon?.is_prepaid_only === true;
  const finalDisabledPaymentTypes = useMemo(() => {
    const disabledPaymentTypes = settingsLoaded
      ? getDisabledPaymentTypes(defaultShippingItems, settings)
      : {
        cod: { disabled: false, products: [] },
        partial_cod: { disabled: false, products: [] },
        prepaid: { disabled: false, products: [] },
        wallet: { disabled: false, products: [] },
      };
    return couponPrepaidOnly
      ? {
        ...disabledPaymentTypes,
        cod: { ...disabledPaymentTypes.cod, disabled: true },
        partial_cod: { ...disabledPaymentTypes.partial_cod, disabled: true },
      }
      : disabledPaymentTypes;
  }, [settingsLoaded, defaultShippingItems, settings, couponPrepaidOnly]);
  useEffect(() => {
    if (!settingsLoaded) return;
    const isPrepaidMethod =
      selectedPayment === "razorpay" || selectedPayment === "PhonePe";
    const isDisabledNow =
      (isPrepaidMethod && finalDisabledPaymentTypes.prepaid.disabled) ||
      (selectedPayment === "cod" && finalDisabledPaymentTypes.cod.disabled) ||
      (selectedPayment === "partial_cod" &&
        finalDisabledPaymentTypes.partial_cod.disabled);
    if (isDisabledNow) {
      if (!finalDisabledPaymentTypes.prepaid.disabled)
        setSelectedPayment("razorpay");
      else if (!finalDisabledPaymentTypes.cod.disabled)
        setSelectedPayment("cod");
      else if (!finalDisabledPaymentTypes.partial_cod.disabled)
        setSelectedPayment("partial_cod");
      else if (!finalDisabledPaymentTypes.wallet.disabled)
        setSelectedPayment("wallet");
    }
  }, [settingsLoaded, finalDisabledPaymentTypes, selectedPayment]);

  const getShippingPaymentType = (method) => {
    switch (method) {
      case "cod":
        return "cod";
      case "partial_cod":
        return "partialCod";
      case "wallet":
        return "wallet";
      case "razorpay":
      case "PhonePe":
      default:
        return "prepaid";
    }
  };
  const shippingPaymentType = getShippingPaymentType(selectedPayment);
  // const defaultShipping =
  //   settingsLoaded && defaultShippingItems.length > 0
  //     ? calculateShipping(defaultShippingItems, "prepaid", settings)
  //     : 0;
  const defaultShipping =
    settingsLoaded && defaultShippingItems.length > 0
      ? calculateShipping(defaultShippingItems, shippingPaymentType, settings)
      : 0;
  // const shipping = overrideShipping + defaultShipping;
  const shipping = overrideShipping + defaultShipping;


  const total = Number((subtotal + shipping).toFixed(0));
  const partialCodAdvance = calculatePartialCodAdvance(total, settings);
  const isPartialCod = selectedPayment === "partial_cod";

  const getBackendPaymentMethod = (method) => {
    if (method === "partial_cod") return "partial_cod";
    if (method === "cod") return "COD";
    if (method === "wallet") {
      const remaining = Math.max(total - walletBalance, 0);
      return remaining > 0 ? "Online" : "Wallet";
    }
    return "Online";
  };
  const totalSaved = mrpTotal - subtotal + couponDiscount;

  const itemDiscount = mrpTotal - offerPriceTotal;

  const validateForm = async (userLS) => {
    if (!userLS || !userLS._id) {
      setShowLoginPopup(true);
      return false;
    }
    const requiredFields = {
      firstName: "address",
      address: "Address",
      state: "State",
      city: "City",
      pincode: "Pin Code",
    };
    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || formData[key].trim() === "") {
        toast.error(`Please enter ${label}`);
        return false;
      }
    }
    try {
      const res = await api.post("/pincode/check", {
        pincode: formData.pincode,
      });
      if (!res.data.success || !res.data.data?.serviceable) {
        toast.error("Service not available in your pincode");
        return false;
      }
    } catch (err) {
      toast.error("Unable to verify pincode. Please try again.");
      return false;
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
    const finalItems = [...checkoutItems, ...giftItems].map((item) => ({
      product_id:
        typeof item.product_id === "object"
          ? item.product_id?._id
          : item.product_id,
      variant_id:
        typeof item.variant_id === "object"
          ? item.variant_id?._id
          : item.variant_id,
      quantity: item.quantity,
      pack_of: item.pack_of || 1,
      price: item.price,
      original_price: item.original_price,
      is_gift: item.is_gift || false,
      is_buy_x_get_y: item.is_buy_x_get_y || false,
    }));
    const orderData = {
      user_id: userLS._id,
      items: finalItems,
      subtotal,
      shipping_charge: shipping,
      coupon_discount: couponDiscount,
      total_price: total,
      coupon_id: appliedCoupon?._id || null,
      payment_method: getBackendPaymentMethod(selectedPayment),
      advance_amount: selectedPayment === "partial_cod" ? partialCodAdvance : 0,
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
    onFailOrCancel = null,
    walletAmountToUse = 0,
    orderData = null,
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
      if (onFailOrCancel) await onFailOrCancel();
      return;
    }
    const razorOrder = razorRes.payload;
    if (!razorOrder) {
      toast("Razorpay initialization failed ❌");
      if (onFailOrCancel) await onFailOrCancel();
      return;
    }

    let failureHandled = false;
    const safeOnFailOrCancel = async (
      transactionId = "",
      razorpayOrderId = "",
    ) => {
      if (failureHandled) return;
      failureHandled = true;
      if (onFailOrCancel) await onFailOrCancel(transactionId, razorpayOrderId);
    };

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
            wallet_amount: walletAmountToUse,
            orderData,
          }),
        );
        if (!verifyRazorpayPayment.fulfilled.match(verifyRes)) {
          toast("Payment verification failed ❌");
          await safeOnFailOrCancel();
          return;
        }

        await clearCartItems();
        localStorage.removeItem("applied_coupon");
        toast.success(
          paymentMethod === "partial_cod"
            ? `Advance ₹${amount} paid! Remaining ₹${Math.round(total - amount)} COD ✅`
            : "Payment Successful ✅",
        );
        navigate("/ordercompleted");
      },
      modal: {
        ondismiss: async function () {
          toast.error("Payment Cancelled ❌");
          await safeOnFailOrCancel();
        },
      },
      prefill: {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email || user?.email,
        contact: formData.phone || "",
      },
      theme: { color: "#1d4ed8" },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", async (response) => {
      toast(`Payment failed: ${response.error.description} ❌`);

      const failedPaymentId = response.error?.metadata?.payment_id || "";
      const failedOrderId = response.error?.metadata?.order_id || "";
      await safeOnFailOrCancel(failedPaymentId, failedOrderId);
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
        amount_paid: total,
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
    window.location.href = paymentUrl;
  };


  const handlePlaceOrder = async () => {
    const userLS = JSON.parse(localStorage.getItem("user"));
    if (!(await validateForm(userLS))) return;
    if (selectedPayment === "wallet" && walletBalance <= 0) {
      toast.error("No wallet balance available");
      return;
    }
    const isPrepaidMethod =
      selectedPayment === "razorpay" || selectedPayment === "PhonePe";
    if (
      (isPrepaidMethod && finalDisabledPaymentTypes.prepaid.disabled) ||
      (selectedPayment === "cod" && finalDisabledPaymentTypes.cod.disabled) ||
      (selectedPayment === "partial_cod" &&
        finalDisabledPaymentTypes.partial_cod.disabled) ||
      (selectedPayment === "wallet" &&
        finalDisabledPaymentTypes.wallet.disabled)
    ) {
      toast.error(
        "Selected payment method is not available for some products in your cart",
      );
      return;
    }

    const remaining = Math.max(total - walletBalance, 0);
    const isSplitWallet = selectedPayment === "wallet" && remaining > 0;
    const isRazorpayFull = selectedPayment === "razorpay";
    const isPartialCod = selectedPayment === "partial_cod";

    const isDeferredOrderCreation = isRazorpayFull || isPartialCod || isSplitWallet;

    if (isDeferredOrderCreation) {
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
      const finalItems = [...checkoutItems, ...giftItems].map((item) => ({
        product_id:
          typeof item.product_id === "object"
            ? item.product_id?._id
            : item.product_id,
        variant_id:
          typeof item.variant_id === "object"
            ? item.variant_id?._id
            : item.variant_id,
        quantity: item.quantity,
        pack_of: item.pack_of || 1,
        price: item.price,
        original_price: item.original_price,
        is_gift: item.is_gift || false,
        is_buy_x_get_y: item.is_buy_x_get_y || false,
      }));
      const orderData = {
        user_id: userLS._id,
        items: finalItems,
        subtotal,
        shipping_charge: shipping,
        coupon_discount: couponDiscount,
        total_price: total,
        coupon_id: appliedCoupon?._id || null,
        payment_method: getBackendPaymentMethod(selectedPayment),
        advance_amount: selectedPayment === "partial_cod" ? partialCodAdvance : 0,
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

      const tempOrderId = `temp_${Date.now()}`;
      if (selectedPayment === "wallet") {
        await handleRazorpayAmount(
          userLS,
          tempOrderId,
          remaining,
          "wallet",
          null,
          walletBalance,
          orderData,
        );
      } else if (selectedPayment === "partial_cod") {
        await handleRazorpayAmount(
          userLS,
          tempOrderId,
          partialCodAdvance,
          "partial_cod",
          async () => {
            toast.error("Razorpay payment failed. Redirecting to PhonePe for advance payment...");

            // 1. Create the order in the database first
            const orderAction = await dispatch(createOrder(orderData));
            if (!createOrder.fulfilled.match(orderAction)) {
              toast.error("Order creation failed ❌");
              return;
            }
            const orderId = orderAction.payload?.data?._id || orderAction.payload?._id;
            if (!orderId) {
              toast.error("Order ID missing ❌");
              return;
            }

            // 2. Initiate PhonePe payment for the partialCodAdvance
            const phonePeRes = await dispatch(
              createPhonePeOrder({
                amount: partialCodAdvance,
                order_id: orderId,
                user_id: userLS._id,
                redirect_url: `${window.location.origin}/payment/phonepe/callback?order_id=${orderId}`,
              }),
            );

            if (!createPhonePeOrder.fulfilled.match(phonePeRes)) {
              toast.error("PhonePe initialization failed ❌");
              await dispatch(
                markPaymentFailed({
                  order_id: orderId,
                  user_id: userLS._id,
                  payment_method: "PhonePe",
                  amount: partialCodAdvance,
                  type: "order",
                })
              );
              await clearCartItems();
              localStorage.removeItem("applied_coupon");
              navigate("/ordercompleted");
              return;
            }

            const paymentUrl = phonePeRes.payload?.data?.paymentUrl || phonePeRes.payload?.paymentUrl;
            if (!paymentUrl) {
              toast.error("PhonePe payment URL missing ❌");
              return;
            }

            // 3. Create a pending Payment record for PhonePe
            await dispatch(
              createPayment({
                user_id: userLS._id,
                order_id: orderId,
                items: checkoutItems,
                subtotal,
                shipping,
                coupon_discount: couponDiscount,
                total,
                amount_paid: partialCodAdvance,
                payment_method: "PhonePe",
                status: "pending",
              }),
            );

            // 4. Redirect the user to PhonePe
            window.location.href = paymentUrl;
          },
          0,
          orderData,
        );
      } else {
        await handleRazorpayAmount(
          userLS,
          tempOrderId,
          total,
          "razorpay",
          null,
          0,
          orderData,
        );
      }
      return;
    }

    const orderId = await createNewOrder(userLS);
    if (!orderId) return;

    if (selectedPayment === "wallet") {
      await clearCartItems();
      localStorage.removeItem("applied_coupon");
      toast.success(`₹${total} paid from wallet ✅`);
      navigate("/ordercompleted");
    } else if (selectedPayment === "PhonePe") {
      await handlePhonePe(userLS, orderId);
    } else if (selectedPayment === "cod") {
      await handleCOD(userLS, orderId);
    }
  };

  const itemMatchesGiftRule = (item, rule) => {
    const pid = String(item.product_id?._id || item.product_id || "");
    const subId = String(
      item.product_id?.subcategory_id?._id ||
      item.product_id?.subcategory_id ||
      item.product_id?.category_id?._id ||
      item.product_id?.category_id ||
      "",
    );
    switch (rule.applyTo) {
      case "allproducts":
        return true;
      case "specificproducts":
        return rule.products?.some((p) => String(p) === pid);
      case "specificsubcategory":
        return rule.subCategories?.some((c) => String(c) === subId);
      case "Excludeproduct":
        return !rule.products?.some((p) => String(p) === pid);
      case "Excludecategories":
        return !rule.subCategories?.some((c) => String(c) === subId);
      default:
        return true;
    }
  };

  const eligibleGiftRules = useMemo(() => {
    if (!settings?.giftRules?.length || !items.length) return [];

    return settings.giftRules
      .filter((rule) => rule.status)
      .filter((rule) => {
        if (rule.applyTo === "allproducts") return true;
        return items.some((item) => itemMatchesGiftRule(item, rule));
      })
      .sort((a, b) => (a.minimumAmount || 0) - (b.minimumAmount || 0));
  }, [settings, items]);

  const activeGiftRule = useMemo(() => {
    if (!eligibleGiftRules.length) return null;

    const notUnlocked = eligibleGiftRules.find(
      (rule) => subtotal < (rule.minimumAmount || 0),
    );
    if (notUnlocked) return notUnlocked;

    const unlockedRules = eligibleGiftRules.filter((rule) => {
      const min = rule.minimumAmount || 0;
      const max = rule.maximumAmount || Infinity;
      return subtotal >= min && subtotal <= max;
    });
    if (unlockedRules.length > 0) {
      return unlockedRules[unlockedRules.length - 1];
    }
    return eligibleGiftRules[eligibleGiftRules.length - 1];
  }, [eligibleGiftRules, subtotal]);

  const giftMin = activeGiftRule?.minimumAmount || 0;
  const giftMax = activeGiftRule?.maximumAmount || 0;
  const isGiftUnlocked = activeGiftRule
    ? subtotal >= giftMin && (giftMax === 0 || subtotal <= giftMax)
    : false;
  const giftRemaining = Math.max(0, giftMin - subtotal);
  const giftProgressPercent =
    giftMin > 0 ? Math.min(100, (subtotal / giftMin) * 100) : 0;

  const [giftProductInfo, setGiftProductInfo] = useState(null);
  useEffect(() => {
    if (!activeGiftRule?.giftProduct) {
      setGiftProductInfo(null);
      return;
    }
    const fetchGiftProduct = async () => {
      try {
        const res = await api.get(`/products/${activeGiftRule.giftProduct}`);
        const product = res.data?.data?.product || res.data?.data || null;
        setGiftProductInfo(product);
      } catch {
        setGiftProductInfo(null);
      }
    };
    fetchGiftProduct();
  }, [activeGiftRule]);

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

        <Offercount amount={totalSaved} />

        <Section>
          <Row className="grid grid-cols-1 custom-lg:grid-cols-[1.4fr_1fr] gap-[30px] items-start">
            <div className="space-y-4">
              {items.length > 0 && activeGiftRule && (
                <div className="bg-white rounded-[12px] px-[20px] py-[14px] shadow-sm border border-pink-100">
                  <div className="flex justify-between items-center mb-[8px]">
                    <div className="flex items-center gap-[8px]">
                      <span className="text-lg">🎁</span>
                      <span className="text-[13px] md:text-[14px] font-medium text-gray-700">
                        {isGiftUnlocked ? (
                          <span className="text-green-600 font-semibold">
                            🎉 You've unlocked a FREE GIFT
                            {giftProductInfo?.name
                              ? `: ${giftProductInfo.name}`
                              : ""}
                            !
                          </span>
                        ) : (
                          <>
                            Add{" "}
                            <span className="font-bold text-gray-900">
                              ₹
                              {Math.round(giftRemaining).toLocaleString(
                                "en-IN",
                              )}
                            </span>{" "}
                            more to get{" "}
                            <span className="font-bold text-pink-600">
                              {giftProductInfo?.name || "a free gift"}
                            </span>{" "}
                            <span className="font-bold text-pink-600">
                              FREE 🎁
                            </span>
                          </>
                        )}
                      </span>
                    </div>

                    <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                      GOAL: ₹{giftMin.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {activeGiftRule.shortDescription && (
                    <p className="text-[12px] text-gray-500 mb-2 ml-[26px]">
                      {activeGiftRule.shortDescription}
                    </p>
                  )}

                  <div className="w-full h-[6px] bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${giftProgressPercent}%`,
                        background: isGiftUnlocked
                          ? "#22c55e"
                          : "linear-gradient(90deg, #ec4899, #f472b6)",
                      }}
                    />
                  </div>
                </div>
              )}

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
                            ₹
                            {Math.round(couponDiscount).toLocaleString("en-IN")}{" "}
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
                          consultation book gift free
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
                disabledPaymentTypes={finalDisabledPaymentTypes}
                walletBalance={walletBalance}
                couponPrepaidOnly={couponPrepaidOnly}
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
              onSwitchRegister={() => { }}
              onSwitchForget={() => { }}
            />
          </div>
        </div>
      )}
    </>
  );
}
