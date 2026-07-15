import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { useSelector, useDispatch } from "react-redux";
import { calculateShipping } from "../../utils/shippingCalculator";

export default function CartSummary({ appliedCoupon }) {
  const { items = [] } = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.sippingcharge.data);
  const dispatch = useDispatch();
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
  const mrpTotal = items.reduce((sum, item) => {
    const { originalPrice } = getDiscountedPrice(item);
    return sum + originalPrice * (item.quantity || 1);
  }, 0);

  const discountedItemsTotal = items.reduce((sum, item) => {
    const { discountedPrice } = getDiscountedPrice(item);
    return sum + discountedPrice * (item.quantity || 1);
  }, 0);
  const productDiscount = mrpTotal - discountedItemsTotal;
  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount =
      appliedCoupon.discount_type === "fixed"
        ? appliedCoupon.discount_value
        : (discountedItemsTotal * appliedCoupon.discount_value) / 100;
    if (appliedCoupon.max_discount_amount) {
      couponDiscount = Math.min(
        couponDiscount,
        appliedCoupon.max_discount_amount,
      );
    }
    localStorage.setItem("applied_coupon", JSON.stringify(appliedCoupon));
  } else {
    localStorage.removeItem("applied_coupon");
  }
  const subtotal = discountedItemsTotal - couponDiscount;
  const overrideItems = items.filter((item) => {
    const t = item?.variant_id?.shippingChargeType;
    return t && t !== "null";
  });
  const defaultItems = items.filter((item) => {
    const t = item?.variant_id?.shippingChargeType;
    return !t || t === "null";
  });
  const overrideShipping = overrideItems.reduce((sum, item) => {
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
  const defaultSubtotal = defaultItems.reduce((sum, item) => {
    const { discountedPrice } = getDiscountedPrice(item);
    return sum + discountedPrice * (item.quantity || 1);
  }, 0);
  const totalWeight = defaultItems.reduce((sum, item) => {
    const weight = Number(item?.variant_id?.ProductWeight || 0);
    return sum + weight * (item.quantity || 1);
  }, 0);
  const defaultShippingItems = defaultItems.map((item) => {
    const discountedPrice = getDiscountedPrice(item).discountedPrice;
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
  const settingsLoaded = !!settings;
  const defaultShipping =
    settingsLoaded && defaultShippingItems.length > 0
      ? calculateShipping(defaultShippingItems, "prepaid", settings)
      : 0;
  const shippingRaw = settingsLoaded
    ? overrideShipping + defaultShipping
    : null;
  const isFreeShipping = shippingRaw === 0;
  const orderTotal = subtotal;
  const totalSaved = productDiscount + couponDiscount;

  return (
    <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-[20px] py-[16px] border-b border-gray-100">
        <span className="text-[16px] font-bold text-gray-900">
          Order Summary
        </span>
      </div>
      <div className="px-[20px] py-[16px] space-y-[14px]">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-gray-500">
            Item Total (MRP)
          </span>
          <span className="text-[14px] font-semibold text-gray-900">
            ₹{Math.round(mrpTotal).toLocaleString("en-IN")}
          </span>
        </div>

        {productDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-500">
              Product Discount
            </span>
            <span className="text-[14px] font-bold text-green-600">
              −₹{Math.round(productDiscount).toLocaleString("en-IN")}
            </span>
          </div>
        )}
        {appliedCoupon && couponDiscount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-500">
              Coupon ({appliedCoupon.code})
            </span>
            <span className="text-[14px] font-bold text-green-600">
              −₹{Math.round(couponDiscount).toLocaleString("en-IN")}
            </span>
          </div>
        )}
        <div className="border-t border-gray-100" />
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold text-gray-800">Subtotal</span>
          <span className="text-[14px] font-bold text-gray-900">
            ₹{Math.round(subtotal).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-gray-500">
            Shipping
          </span>
          {!settingsLoaded ? (
            <span className="text-[12px] font-medium text-gray-400 italic">
              Calculating...
            </span>
          ) : isFreeShipping ? (
            <span className="text-[12px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-[4px] px-[8px] py-[2px] tracking-wide">
              FREE
            </span>
          ) : (
            <span className="text-gray-500 bg-gray-50 uppercase text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-lg">
              Calculated at Checkout
            </span>
          )}
        </div>

        <div className="border-t border-gray-100" />

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-[2px]">
              Order Total
            </p>
            <span className="text-[22px] font-bold text-gray-900">
              ₹{Math.round(orderTotal).toLocaleString("en-IN")}
            </span>
          </div>
          {totalSaved > 0 && (
            <span className="text-[12px] font-bold text-white bg-green-500 rounded-[6px] px-[10px] py-[5px]">
              SAVE ₹{Math.round(totalSaved).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
