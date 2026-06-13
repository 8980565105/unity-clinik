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
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { fetchSystemSettings } from "../features/systemsetting/systemsetting.Thunk";
import { calculateShipping } from "../utils/shippingCalculator";
import { fetchPageBySlug } from "../features/pages/pagesThunk.js";

export default function Cart() {
  const navigate = useNavigate();
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [cartCouponCode, setCartCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState({ text: "", type: "" });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dispatch = useDispatch();
  const { coupons = [] } = useSelector((state) => state.coupons);
  const { items = [] } = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.systemseting.data);
  const { pages, slugLoading } = useSelector((state) => state.pages);
  const cartPage = pages?.find((page) => page.slug === "cart");

  useEffect(() => {
    dispatch(fetchSystemSettings());
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

  const subtotal = items.reduce((sum, item) => {
    return sum + getDiscountedPrice(item) * (item.quantity || 1);
  }, 0);

  const freeThreshold = settings?.prepaid?.freeThreshold || 0;
  const remaining = Math.max(0, freeThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeThreshold) * 100);
  const isFree = subtotal >= freeThreshold;

  const shippingCharge = calculateShipping(subtotal, "prepaid", settings);

  useEffect(() => {
    if (!items.length) return;
    dispatch(fetchCoupons({ status: "active" }));
  }, [dispatch, items.length]);

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
            {items.length > 0 && (
              <div className="bg-white rounded-[12px] px-[20px] py-[14px] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <Truck size={18} className="text-[#1a5fb4]" />
                    <span className="text-[13px] md:text-[14px] font-medium text-gray-700">
                      {isFree ? (
                        <span className="text-green-600 font-semibold">
                          🎉 You've unlocked FREE SHIPPING!
                        </span>
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
                    GOAL: ₹{freeThreshold.toLocaleString("en-IN")}
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
            {items.length > 0 && (
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
                      <p className="text-[12px] text-green-600 font-medium mt-[2px]">
                        ₹{couponDiscountAmount.toLocaleString("en-IN")} coupon
                        savings
                      </p>
                    </div>
                    <button
                      onClick={handleRemoveCoupon}
                      className="text-[13px] font-bold text-red-500 border border-red-300 rounded-[6px] px-[14px] py-[6px] hover:bg-red-50 transition-colors ml-[12px] whitespace-nowrap"
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
              </div>
            )}

            <CartSummary appliedCoupon={appliedCoupon} />
          </div>
        </Row>
      </Section>

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
      />
    </>
  );
}
