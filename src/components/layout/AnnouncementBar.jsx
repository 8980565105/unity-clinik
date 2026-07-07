import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCoupons } from "../../features/coupons/couponsThunk";

export default function AnnouncementBar() {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector((state) => state.coupons);
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);
  const announcements =
    coupons?.filter(
      (coupon) =>
        coupon.status === "active" &&
        coupon.header_title &&
        coupon.header_title.trim() !== "",
    ) || [];
  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % announcements.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [announcements.length]);
  if (loading || announcements.length === 0) return null;
  return (
    <div className="relative bg-primary text-white h-10 overflow-hidden">
      <div className="w-full h-full overflow-hidden">
        <div
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{
            width: `${announcements.length * 100}%`,
            transform: `translateX(-${
              current * (100 / announcements.length)
            }%)`,
          }}
        >
          {announcements.map((coupon) => (
            <div
              key={coupon._id}
              className="flex-shrink-0 flex items-center justify-center px-4 text-center"
              style={{
                width: `${100 / announcements.length}%`,
              }}
            >
              <div
                className="announcement-content"
                dangerouslySetInnerHTML={{
                  __html: coupon.header_title,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
