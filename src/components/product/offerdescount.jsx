import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchCoupons } from "../../features/coupons/couponsThunk";
import spacialoffer from "../../assets/abc1.png";
const getProductSubCategoryId = (product) =>
  String(
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
export const filterCouponsForProduct = (
  coupons,
  product,
  userOrderCount = null,
  userId = null,
) => {
  if (!product) return [];
  const subCatId = getProductSubCategoryId(product);
  return (coupons || []).filter((coupon) => {
    if (coupon.status !== "active") return false;

    if (coupon.coupon_type === "first_order") {
      if (!userId) return false;
      if (userOrderCount === null) return false;
      if (userOrderCount > 0) return false;
    }
    if (coupon.apply_type === "allproducts") return true;

    if (coupon.apply_type === "specificproducts") {
      return coupon.products?.some(
        (p) => String(p?._id || p) === String(product?._id),
      );
    }
    if (coupon.apply_type === "specificsubcategory") {
      return coupon.subcategories?.some(
        (sub) => String(sub?._id || sub) === subCatId,
      );
    }
    return false;
  });
};

export const calcCouponDiscount = (coupon, price) => {
  if (!coupon || !price) return 0;
  if (coupon.min_purchase_amount && price < coupon.min_purchase_amount)
    return 0;

  let discount = 0;
  if (coupon.discount_type === "fixed") {
    discount = Number(coupon.discount_value) || 0;
  } else {
    discount = (price * (Number(coupon.discount_value) || 0)) / 100;
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, Number(coupon.max_discount_amount));
    }
  }
  return Math.min(discount, price);
};

export default function Offer({
  product,
  price = 0,
  activeVariantState,
  selectedPackState,
  setShowLoginPopup,
}) {
  const [open, setOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [applyingCode, setApplyingCode] = useState(null);
  const { coupons = [] } = useSelector((state) => state.coupons);
  const { user, token } = useSelector((state) => state.auth);
  const [userOrderCount, setUserOrderCount] = useState(null);
  useEffect(() => {
    dispatch(fetchCoupons({ status: "active" }));
  }, [dispatch]);
  useEffect(() => {
    if (!user?._id) {
      setUserOrderCount(0);
      return;
    }
    const fetchCount = async () => {
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
    fetchCount();
  }, [user?._id]);

  const applicableCoupons = filterCouponsForProduct(
    coupons,
    product,
    userOrderCount,
    user?._id,
  )
    .map((c) => ({ ...c, discount: calcCouponDiscount(c, price) }))
    .filter((c) => c.discount > 0)
    .sort((a, b) => b.discount - a.discount);

  if (applicableCoupons.length === 0 || !price) return null;

  const bestOffer = applicableCoupons[0];
  const bestPrice = Math.max(0, Math.round(price - bestOffer.discount));

  const handleApplyOffer = (coupon) => {
    if (!token) {
      setShowLoginPopup?.(true);
      return;
    }
    if (activeVariantState?.stock_quantity === 0) {
      toast.error("This product is out of stock!");
      return;
    }
    setApplyingCode(coupon.code);
    navigate("/checkout", {
      state: {
        buyNow: true,
        item: {
          product_id: product,
          variant_id: activeVariantState,
          quantity: 1,
          pack_of: Number(selectedPackState?.badge || 1),
          price: Number(selectedPackState?.offerprice || 0),
          original_price: Number(selectedPackState?.price || 0),
        },
        autoApplyCoupon: coupon.code,
        openCouponDrawer: true,
      },
    });
    setApplyingCode(null);
  };

  return (
    <div className="mt-5 border border-blue-300 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full bg-blue-700 text-white p-1 md:p-0 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <img
            src={spacialoffer}
            alt="offer"
            className="h-[50px] w-auto object-contain"
          />
          <span className="font-semibold text-nowrap text-[10px] md:text-[18px] ">
            {open
              ? "Apply offers for maximum savings"
              : `Buy at ₹${bestPrice.toLocaleString("en-IN")}`}
          </span>
        </div>
        <div className="pe-2 md:pe-3">
          {open ? <ChevronUp /> : <ChevronDown />}
        </div>
      </button>
      {!open && (
        <div className="bg-blue-50 px-4 py-3 text-[13px] text-gray-700">
          Apply offers for maximum savings!
        </div>
      )}
      {open && (
        <div className="bg-white p-4 max-h-[315px] overflow-y-auto no-scrollbar ">
          <div className="border rounded-xl p-4 bg-blue-50 mb-4 sticky top-0 z-0">
            <p className="text-2xl md:text-3xl font-bold">
              ₹{bestPrice.toLocaleString("en-IN")}
            </p>
            <p className="text-gray-500 text-sm">Discount price for you</p>
          </div>

          <div>
            <div className="grid md:grid-cols-2 gap-3">
              {applicableCoupons.map((coupon, index) => (
                <div
                  key={coupon._id}
                  className="border rounded-xl p-3 flex justify-between items-start gap-2"
                >
                  <div className="min-w-0">
                    {index === 0 && (
                      <span className="bg-yellow-200 text-black text-[11px] px-2 py-[2px] rounded inline-block mb-1">
                        Best value for you
                      </span>
                    )}

                    <h4 className="font-bold text-[15px]">
                      {coupon.discount_type === "fixed"
                        ? `₹${coupon.discount_value} off`
                        : `${coupon.discount_value}% off`}
                    </h4>

                    <p className="text-gray-700 text-sm font-semibold tracking-wide">
                      {coupon.code}
                    </p>

                    {coupon.min_purchase_amount > 0 && (
                      <p className="text-[11px] text-gray-400 mt-1">
                        Min order ₹{coupon.min_purchase_amount}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleApplyOffer(coupon)}
                    disabled={applyingCode === coupon.code}
                    className="text-blue-600 font-semibold text-sm whitespace-nowrap disabled:opacity-50"
                  >
                    {applyingCode === coupon.code ? "Adding..." : "Apply"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
