import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { X, Tag, ChevronDown, ChevronUp } from "lucide-react";
export default function CouponDrawer({
  isOpen,
  onClose,
  appliedCoupon,
  setAppliedCoupon,
  cartCouponCode,
  setCartCouponCode,
  couponMsg,
  setCouponMsg,
  onApplyCartCoupon,
  onSelectCoupon,
  subtotal,
  autoApplyCode,
  onAutoApplyDone,
  userOrderCount,
  checkoutQuantities,
  items = [],
}) {
  const { coupons = [] } = useSelector((state) => state.coupons);
  const { user } = useSelector((state) => state.auth);
  const [expandedCoupon, setExpandedCoupon] = useState(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen || !autoApplyCode) return;
    if (!coupons.length) return;
    const match = coupons.find((c) => c.code === autoApplyCode);
    if (match) {
      onSelectCoupon(match.code);
    }
    onAutoApplyDone?.();
  }, [isOpen, autoApplyCode, coupons]);

  const filteredCoupons = coupons.filter((coupon) => {
    const isFirstOrderOnly =
      coupon.coupon_type === "first_order" || coupon.coupon_type === "referral";

    if (isFirstOrderOnly) {
      if (!user?._id) return false;
      if (userOrderCount === null) return false;
      if (userOrderCount > 0) return false;
    }

    if (coupon.apply_type === "allproducts") return true;
    if (coupon.apply_type === "specificproducts") {
      return items.some((item) =>
        coupon.products?.some(
          (product) =>
            String(product?._id || product) === String(item?.product_id?._id),
        ),
      );
    }
    if (coupon.apply_type === "specificsubcategory") {
      return items.some((item) => {
        const product = item?.product_id;
        const productSubCategoryId = String(
          product?.category_id?._id ||
            product?.category_id ||
            product?.parent_id?._id ||
            product?.parent_id ||
            product?.subcategory_id?._id ||
            product?.subcategory_id ||
            product?.subcategory?._id ||
            product?.subcategory ||
            "",
        );
        return coupon.subcategories?.some(
          (sub) => String(sub?._id || sub) === productSubCategoryId,
        );
      });
    }

    if (coupon.apply_type === "Excludeproduct") {
      return items.some((item) => {
        const isExcluded = coupon.products?.some(
          (product) =>
            String(product?._id || product) === String(item?.product_id?._id),
        );
        return !isExcluded;
      });
    }

    if (coupon.apply_type === "Excludecategories") {
      return items.some((item) => {
        const product = item?.product_id;
        const productSubCategoryId = String(
          product?.category_id?._id ||
            product?.category_id ||
            product?.parent_id?._id ||
            product?.parent_id ||
            product?.subcategory_id?._id ||
            product?.subcategory_id ||
            product?.subcategory?._id ||
            product?.subcategory ||
            "",
        );
        const isExcluded = coupon.subcategories?.some(
          (sub) => String(sub?._id || sub) === productSubCategoryId,
        );
        return !isExcluded;
      });
    }

    return false;
  });
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[998] transition-opacity" />

      <div
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[999] flex flex-col shadow-2xl"
        style={{ animation: "slideIn 0.25s ease-out" }}
      >
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}</style>

        <div className="flex items-center justify-between px-[20px] py-[16px] border-b border-gray-100">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">
              Apply Coupon
            </h2>
            <p className="text-[12px] text-gray-400 mt-[1px]">
              Your cart: ₹{Math.round(subtotal).toLocaleString("en-IN")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-[32px] h-[32px] flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-[20px] py-[16px] border-b border-gray-100">
          <div className="flex gap-[8px]">
            <input
              type="text"
              value={cartCouponCode}
              onChange={(e) => {
                setCartCouponCode(e.target.value.toUpperCase());
                setCouponMsg({ text: "", type: "" });
              }}
              placeholder="Enter Coupon Code"
              className="flex-1 border border-gray-200 rounded-[8px] px-[14px] py-[11px] text-[13px] tracking-widest placeholder:tracking-normal placeholder:text-gray-400 focus:outline-none focus:border-gray-400 uppercase"
            />
            <button
              onClick={onApplyCartCoupon}
              className="text-[#1a5fb4] font-bold text-[14px] px-[16px] py-[11px] rounded-[8px] border border-[#1a5fb4] hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              APPLY
            </button>
          </div>
          {couponMsg?.text && (
            <p
              className={`text-[12px] font-medium mt-[8px] ${
                couponMsg.type === "success" ? "text-green-600" : "text-red-500"
              }`}
            >
              {couponMsg.text}
            </p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-[20px] py-[14px]">
          {filteredCoupons.length === 0 ? (
            <p className="text-center text-[13px] text-gray-400 py-[40px]">
              No coupons available for your cart.
            </p>
          ) : (
            <div className="space-y-[12px]">
              {filteredCoupons.map((coupon) => {
                const isApplied = appliedCoupon?.code === coupon.code;
                const isExpanded = expandedCoupon === coupon._id;
                const buyQty = coupon?.buy_x_get_y?.buy_quantity || 0;
                const eligibleQty = items.reduce((total, item) => {
                  const isMatched = coupon.products?.some(
                    (p) =>
                      String(p?._id || p) === String(item?.product_id?._id),
                  );
                  if (!isMatched) return total;
                  const key = item._id || item.product_id?._id;
                  const actualQty =
                    checkoutQuantities[key] || item.quantity || 1;
                  return total + actualQty;
                }, 0);

                const canApplyBuyXGetY =
                  coupon.coupon_type !== "buy_x_get_y"
                    ? true
                    : eligibleQty >= buyQty;
                return (
                  <div
                    key={coupon._id}
                    className={`border rounded-[10px] overflow-hidden transition-all ${
                      isApplied
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between px-[14px] py-[12px]">
                      <div className="flex items-center gap-[10px]">
                        <div
                          className={`w-[34px] h-[34px] rounded-[8px] flex items-center justify-center ${
                            isApplied ? "bg-green-100" : "bg-gray-100"
                          }`}
                        >
                          <Tag
                            size={15}
                            className={
                              isApplied ? "text-green-600" : "text-gray-500"
                            }
                          />
                        </div>
                        <div>
                          <span className="text-[12px] font-bold tracking-widest text-gray-900 block">
                            {coupon.code}
                          </span>
                          <span
                            className={`text-[11px] font-semibold ${isApplied ? "text-green-600" : "text-[#1a5fb4]"}`}
                          >
                            {coupon.discount_type === "fixed"
                              ? `Get ₹${coupon.discount_value} off`
                              : `Get ${coupon.discount_value}% off`}
                          </span>
                        </div>
                      </div>
                      {isApplied ? (
                        <button
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCartCouponCode("");
                            setCouponMsg({ text: "", type: "" });
                          }}
                          className="text-[12px] font-semibold text-red-500 border border-red-300 rounded-[6px] px-[12px] py-[6px] hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          disabled={!canApplyBuyXGetY}
                          onClick={() => {
                            onSelectCoupon(coupon.code);
                          }}
                          className={`
    text-[13px]
    font-bold
    rounded-[6px]
    px-[16px]
    py-[6px]
    ${
      canApplyBuyXGetY
        ? "text-white bg-[#1a5fb4]"
        : "text-gray-400 bg-gray-200 cursor-not-allowed"
    }
  `}
                        >
                          Apply
                        </button>
                      )}
                    </div>

                    {coupon.name && (
                      <div className="px-[14px] pb-[10px]">
                        <p className="text-[12px] text-gray-500">
                          {coupon.name}
                        </p>
                        <button
                          onClick={() =>
                            setExpandedCoupon(isExpanded ? null : coupon._id)
                          }
                          className="flex items-center gap-[4px] text-[11px] text-gray-400 mt-[4px] hover:text-gray-600"
                        >
                          T&C{" "}
                          {isExpanded ? (
                            <ChevronUp size={12} />
                          ) : (
                            <ChevronDown size={12} />
                          )}
                        </button>
                        {isExpanded && (
                          <p className="text-[11px] text-gray-400 mt-[4px] leading-[1.5]">
                            {coupon.description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
