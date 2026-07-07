import React, { useEffect, useState } from "react";
import CartProgress from "../components/cart/CartProgress";
import CartSummary from "../components/cart/CartSummary";
import Row from "../components/ui/Row";
import Section from "../components/ui/Section";
import CartItem from "../components/cart/CartItem";
import { useDispatch, useSelector } from "react-redux";
import { fetchCoupons } from "../features/coupons/couponsThunk";
import SEO from "../components/seo/seo";
import { Truck, Tag, ChevronRight } from "lucide-react";
import CouponDrawer from "../components/cart/Coupondrawer.jsx";
import Button from "../components/ui/Button.jsx";
import { fetchShippingCharge } from "../features/sippingcharge/sippingchargeThunk";
import { calculateShipping } from "../utils/shippingCalculator";
import { fetchPageBySlug } from "../features/pages/pagesThunk.js";
import { useLocation, useNavigate } from "react-router-dom";
import cart from "../assets/emptycart.webp";
import { fetchCart } from "../features/cart/cartThunk";
export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [autoApplyCode, setAutoApplyCode] = useState(
    location.state?.autoApplyCoupon || null,
  );
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartCouponCode, setCartCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const { coupons = [] } = useSelector((state) => state.coupons);
  const settings = useSelector((state) => state.sippingcharge.data);
  const { pages } = useSelector((state) => state.pages);
  const cartPage = pages?.find((page) => page.slug === "cart");
  const { items = [], loading } = useSelector((state) => state.cart);
  useEffect(() => {
    if (location.state?.openCouponDrawer) {
      setDrawerOpen(true);
    }
  }, [location.state]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchShippingCharge());
    dispatch(fetchPageBySlug("cart"));
  }, [dispatch]);
  const getDiscountedPrice = (item) => {
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );
    const offerPrice = Number(item?.price || item?.variant_id?.offerprice || 0);
    if (offerPrice > 0 && offerPrice < originalPrice) return offerPrice;
    const discount = item?.product_id?.discount_id?.value || 0;
    return discount > 0
      ? originalPrice - (originalPrice * discount) / 100
      : originalPrice;
  };
  const settingsLoaded = !!settings;
  const defaultItemsForProgress = items.filter((item) => {
    const t = item?.variant_id?.shippingChargeType;
    return !t || t === "null";
  });
  const subtotal = defaultItemsForProgress.reduce((sum, item) => {
    return sum + getDiscountedPrice(item) * (item.quantity || 1);
  }, 0);
  const totalWeight = defaultItemsForProgress.reduce((sum, item) => {
    const weight = Number(item?.variant_id?.ProductWeight || 0);
    return sum + weight * (item.quantity || 1);
  }, 0);
  const defaultShippingItems = defaultItemsForProgress.map((item) => {
    const discountedPrice = getDiscountedPrice(item);
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
    };
  });

  const defaultShipping =
    settingsLoaded && defaultShippingItems.length > 0
      ? calculateShipping(defaultShippingItems, "prepaid", settings)
      : 0;

  const totalQuantity = defaultItemsForProgress.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0,
  );

  const activePrepaidRules = settings?.productRules?.prepaid || [];
  const defaultRule = activePrepaidRules.find(
    (r) => r.applyTo === "allproducts",
  );

  const ruleShippingTypeRaw = String(
    defaultRule?.shippingType || settings?.shippingType || "price",
  )
    .toLowerCase()
    .trim();

  const isWeightWise = ruleShippingTypeRaw.includes("weight");
  const isQuantityWise =
    ruleShippingTypeRaw.includes("quantity") ||
    ruleShippingTypeRaw.includes("quntity") || 
    ruleShippingTypeRaw.includes("qty");

  const freeThreshold = defaultRule?.freeThreshold || 0;

  const progressValue = isWeightWise
    ? totalWeight
    : isQuantityWise
      ? totalQuantity
      : subtotal;

  const remaining = Math.max(0, freeThreshold - progressValue);
  const progressPercent =
    freeThreshold > 0
      ? Math.min(100, (progressValue / freeThreshold) * 100)
      : 0;
  const isFree = freeThreshold > 0 && progressValue >= freeThreshold;

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
    setAppliedCoupon(coupon);
    setCartCouponCode(coupon.code);
    setCouponMsg({
      text: `Coupon "${coupon.code}" applied successfully!`,
      type: "success",
    });
  };

  const handleApplyCartCoupon = () => applyCouponByCode(cartCouponCode);

  const handleSelectCoupon = (code) => {
    setCartCouponCode(code);
    applyCouponByCode(code);
    setTimeout(() => setDrawerOpen(false), 800);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCartCouponCode("");
    setCouponMsg({ text: "", type: "" });
  };

  const couponDiscountAmount = appliedCoupon
    ? appliedCoupon.discount_type === "fixed"
      ? appliedCoupon.discount_value
      : Math.round((subtotal * appliedCoupon.discount_value) / 100)
    : 0;

  const mrpTotal = items.reduce((sum, item) => {
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );
    return sum + originalPrice * (item.quantity || 1);
  }, 0);

  const totalSaved = mrpTotal - subtotal + couponDiscountAmount;
  const orderTotal = subtotal - couponDiscountAmount;

  if (!loading && items.length === 0) {
    return (
      <>
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
      </>
    );
  }
  return (
    <>
      <SEO
        title={cartPage?.meta_title}
        description={cartPage?.meta_description}
        image={`${process.env.REACT_APP_API_URL_IMAGE}${cartPage?.seo_image}`}
      />
      <CartProgress currentStep={1} />
      <Section>
        <Row className="grid grid-cols-1 custom-lg:grid-cols-[3fr_1fr] gap-[30px] items-start">
          <div className="flex-1 flex flex-col gap-4">
            {items.length > 0 && freeThreshold > 0 && (
              <div className="bg-white rounded-[12px] px-[20px] py-[14px] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <Truck size={18} className="text-[#1a5fb4]" />
                    <span className="text-[13px] md:text-[14px] font-medium text-gray-700">
                      {isFree ? (
                        <span className="text-green-600 font-semibold">
                          🎉 You've unlocked FREE SHIPPING!
                        </span>
                      ) : isWeightWise ? (
                        <>
                          Add{" "}
                          <span className="font-bold text-gray-900">
                            {Math.round(remaining).toLocaleString("en-IN")}g
                          </span>{" "}
                          more for{" "}
                          <span className="font-bold text-[#1a5fb4]">
                            FREE SHIPPING
                          </span>
                        </>
                      ) : isQuantityWise ? (
                        <>
                          Add{" "}
                          <span className="font-bold text-gray-900">
                            {Math.round(remaining).toLocaleString("en-IN")}
                          </span>{" "}
                          more item(s) for{" "}
                          <span className="font-bold text-[#1a5fb4]">
                            FREE SHIPPING
                          </span>
                        </>
                      ) : (
                        <>
                          Add{" "}
                          <span className="font-bold text-gray-900">
                            ₹{Math.round(remaining).toLocaleString("en-IN")}
                          </span>{" "}
                          more for{" "}
                          <span className="font-bold text-[#1a5fb4]">
                            FREE SHIPPING
                          </span>
                        </>
                      )}
                    </span>
                  </div>

                  <span className="text-[11px] text-gray-400 font-medium tracking-wide">
                    GOAL:{" "}
                    {isWeightWise
                      ? `${freeThreshold.toLocaleString("en-IN")}g`
                      : isQuantityWise
                        ? `${freeThreshold.toLocaleString("en-IN")} item(s)`
                        : `₹${freeThreshold.toLocaleString("en-IN")}`}
                  </span>
                </div>
                <div className="w-full h-[6px] bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      background: isFree
                        ? "#22c55e"
                        : "linear-gradient(90deg, #1a5fb4, #2979d4)",
                    }}
                  />
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div className="p-4 flex items-center gap-3 bg-green-100 rounded-lg">
                <Truck size={20} className="text-green-600" />
                <span className="text-[14px] font-bold text-green-800">
                  Expected Delivery by{" "}
                  {new Date(Date.now() + 3 * 86400000).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short" },
                  )}
                </span>
              </div>
            )}

            <CartItem />
          </div>

          <div className="space-y-4 sticky top-[100px] self-start">
            <CartSummary appliedCoupon={appliedCoupon} />
          </div>
        </Row>
      </Section>
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-[50] bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="w-[90%] lg:max-w-[1440px] mx-auto flex items-center justify-between py-3 px-2 hidden lg:flex">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[22px] md:text-[26px] font-bold text-gray-900">
                  ₹{Math.round(orderTotal).toLocaleString("en-IN")}
                </span>
                {mrpTotal > orderTotal && (
                  <span className="text-[14px] text-gray-400 line-through">
                    ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {totalSaved > 0 && (
                <span className="text-[12px] font-semibold text-green-600">
                  • Saved ₹{Math.round(totalSaved).toLocaleString("en-IN")} with
                  offer
                </span>
              )}
            </div>

            <Button
              variant="common"
              onClick={() => navigate("/checkout")}
              className="!px-2 !py-3 !text-[15px] !font-bold flex text-nowrap items-center gap-1 uppercase tracking-wide"
            >
              CHECKOUT ORDER
              <ChevronRight size={18} />
            </Button>
          </div>

          <div className="grid grid-cols-2 h-[60px] lg:hidden ms-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[22px] md:text-[26px] font-bold text-gray-900">
                  ₹{Math.round(orderTotal).toLocaleString("en-IN")}
                </span>
                {mrpTotal > orderTotal && (
                  <span className="text-[14px] text-gray-400 line-through">
                    ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
                  </span>
                )}
              </div>
              {totalSaved > 0 && (
                <span className="text-[12px] font-semibold text-green-600">
                  • Saved ₹{Math.round(totalSaved).toLocaleString("en-IN")} with
                  offer
                </span>
              )}
            </div>
            <Button
              variant="common"
              onClick={() => navigate("/checkout")}
              className="!px-2 !py-3 !text-[15px] !rounded-[0px] !font-bold flex text-nowrap items-center gap-1 uppercase tracking-wide"
            >
              CHECKOUT ORDER
              <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
