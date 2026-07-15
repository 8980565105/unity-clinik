import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Section from "../ui/Section";

export default function Offercount({ amount } = {}) {
  const { items = [] } = useSelector((state) => state.cart);
  const [animatedCount, setAnimatedCount] = useState(0);

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

  const mrpTotal = items.reduce((sum, item) => {
    const originalPrice = Number(
      item?.original_price || item?.variant_id?.price || 0,
    );
    return sum + originalPrice * (item.quantity || 1);
  }, 0);

  const subtotal = items.reduce((sum, item) => {
    return sum + getDiscountedPrice(item) * (item.quantity || 1);
  }, 0);

  const totalSaved = Math.round(
    amount !== undefined ? amount : mrpTotal - subtotal,
  );

  useEffect(() => {
    if (totalSaved < 0) return;
    const target = totalSaved;
    const interval = setInterval(() => {
      setAnimatedCount((prev) => {
        if (prev === target) {
          clearInterval(interval);
          return prev;
        }
        const diff = target - prev;
        const step = Math.max(1, Math.ceil(Math.abs(diff) / 10));
        return diff > 0
          ? Math.min(prev + step, target)
          : Math.max(prev - step, target);
      });
    }, 40);
    return () => clearInterval(interval);
  }, [totalSaved]);

  const hasItems = amount !== undefined ? true : items.length > 0;
  if (!hasItems || totalSaved <= 0) return null;

  return (
    <Section className="!pt-10 !pb-0">
      <div className="relative h-10 overflow-hidden border-y border-[#efe8cf] bg-[#faf9f5]">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-[100%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#edd15a] to-transparent"></div>
          <div className="absolute left-1/2 top-0 h-full w-[350px] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#f8efb0] to-transparent blur-md"></div>
        </div>

        <div className="absolute left-2 top-1/2 -translate-y-1/2">
          <div className="w-7 h-7 rounded-full bg-[#F6B21D] border border-[#C97A00] flex items-center justify-center shadow">
            <span className="text-[#8C4A00] text-xs font-bold">₹</span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center h-full gap-2">
          <span className="text-[15px] text-[#222] font-medium">You saved</span>
          <span className="saving-badge">
            ₹{animatedCount.toLocaleString("en-IN")}
          </span>
          <span className="text-[15px] text-[#222] font-medium">
            on this order!
          </span>
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <div className="w-7 h-7 rounded-full bg-[#F6B21D] border border-[#C97A00] flex items-center justify-center shadow">
            <span className="text-[#8C4A00] text-xs font-bold">₹</span>
          </div>
        </div>
      </div>
    </Section>
  );
}
