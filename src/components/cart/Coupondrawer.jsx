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
}) {
  const { coupons = [] } = useSelector((state) => state.coupons);
  const { items = [] } = useSelector((state) => state.cart);
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

  const filteredCoupons = coupons.filter((coupon) => {
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

        {/* Input */}
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
                          onClick={() => {
                            onSelectCoupon(coupon.code);
                          }}
                          className="text-[13px] font-bold text-white bg-[#1a5fb4] rounded-[6px] px-[16px] py-[6px] hover:bg-[#174fa0] transition-colors"
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
                            Valid on eligible products only. Cannot be combined
                            with other offers.
                            {coupon.min_order_amount
                              ? ` Minimum order: ₹${coupon.min_order_amount}.`
                              : ""}
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
