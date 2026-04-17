import { useEffect, useMemo, useState, useCallback } from "react";
import { Handbag, Star } from "lucide-react";
import Button from "../ui/Button";
import { useNavigate } from "react-router-dom";
import HeartIcon from "../icons/HeartIcon";
import { useDispatch, useSelector } from "react-redux";

import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import toast, { Toaster } from "react-hot-toast";
import { fetchProductReviews } from "../../features/reivews/reviewsThunk";

function CountdownTimer({ endDate }) {
  const calcTimeLeft = useCallback(() => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return {
      hours,
      minutes: String(minutes).padStart(2, "0"),
      seconds: String(seconds).padStart(2, "0"),
    };
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => {
      const t = calcTimeLeft();
      setTimeLeft(t);
      if (!t) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [calcTimeLeft]);

  if (!timeLeft) return null;

  return (
    <span className="text-theme text-[12px] md:text-[15px] font-bold">
      Ends in {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
    </span>
  );
}

export default function ProductInfo({
  product,
  setSelectedVariant,
  selectedColor,
  setSelectedColor,
  setShowLoginPopup,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [addingToCart, setAddingToCart] = useState(false);

  // const reviewData = useMemo(() => {
  //   const reviews = Array.isArray(product?.reviews) ? product.reviews : [];
  //   if (reviews.length === 0) return { average: 0, total: 0 };
  //   const total = reviews.length;
  //   const sum = reviews.reduce(
  //     (acc, curr) => acc + (Number(curr.rating) || 0),
  //     0,
  //   );
  //   return { average: (sum / total).toFixed(1), total };
  // }, [product?.reviews]);

  const { productReviews } = useSelector((state) => state.reviews);

  const reviewData = useMemo(() => {
    const reviews = productReviews?.[product?._id]?.reviews || [];

    if (reviews.length === 0) return { average: 0, total: 0 };

    const total = reviews.length;

    const sum = reviews.reduce(
      (acc, curr) => acc + (Number(curr.rating) || 0),
      0,
    );

    return {
      average: (sum / total).toFixed(1),
      total,
    };
  }, [productReviews, product?._id]);

  useEffect(() => {
    if (product?._id) {
      dispatch(
        fetchProductReviews({ productId: product._id, page: 1, limit: 50 }),
      );
    }
  }, [product?._id, dispatch]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);

  const sizesForSelectedColor = useMemo(() => {
    if (!selectedColor) return [];
    return (product?.variants || []).filter(
      (v) => v.color_id?._id === selectedColor,
    );
  }, [product, selectedColor]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0];
      setSelectedColor(first.color_id?._id || null);
      setSelectedSize(first.size_id?._id || null);
      setActiveVariant(first);
      setSelectedVariant(first);
    }
  }, [product, setSelectedColor, setSelectedVariant]);

  useEffect(() => {
    if (!selectedColor) return;
    const variantsForColor = (product?.variants || []).filter(
      (v) => v.color_id?._id === selectedColor,
    );
    if (variantsForColor.length > 0) {
      const firstAvailable =
        variantsForColor.find((v) => v.stock_quantity > 0) ||
        variantsForColor[0];
      setSelectedSize(firstAvailable.size_id?._id || null);
      setActiveVariant(firstAvailable);
      setSelectedVariant(firstAvailable);
    }
  }, [selectedColor, product?.variants, setSelectedVariant]);

  useEffect(() => {
    if (!selectedSize || !selectedColor) return;
    const match = (product?.variants || []).find(
      (v) =>
        v.color_id?._id === selectedColor && v.size_id?._id === selectedSize,
    );
    if (match) {
      setActiveVariant(match);
      setSelectedVariant(match);
    }
  }, [selectedSize, selectedColor, product?.variants, setSelectedVariant]);

  const originalPrice = activeVariant?.price || 0;
  const discountType = product?.discount_id?.type;
  const discountValue = product?.discount_id?.value || 0;
  let discountedPrice = originalPrice;
  if (discountType === "percentage") {
    discountedPrice = Math.round(
      originalPrice - (originalPrice * discountValue) / 100,
    );
  } else if (discountType === "flat") {
    discountedPrice = Math.max(0, originalPrice - discountValue);
  }

  const handleAddToCart = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }
    if (!activeVariant?._id) {
      toast.error("Please select a variant first!");
      return;
    }
    if (activeVariant?.stock_quantity === 0) {
      toast.error("This variant is out of stock!");
      return;
    }
    setAddingToCart(true);
    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");
      if (!cartId) {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (!user?._id) {
          toast.error("User session expired. Please login again.");
          setShowLoginPopup(true);
          return;
        }
        const newCart = await dispatch(
          createCart({ user_id: user._id }),
        ).unwrap();
        cartId = newCart._id;
      }
      await dispatch(
        addToCart({
          cart_id: cartId,
          product_id: product._id,
          variant_id: activeVariant._id,
          quantity: 1,
        }),
      ).unwrap();
      await dispatch(fetchCart(cartId));
      navigate("/cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to add item to cart. Please try again.";
      toast.error(msg);
    } finally {
      setAddingToCart(false);
    }
  };

  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);

  const discount = product?.discount || product?.discount_id || {};
  const hasDiscount = discount?.value > 0;
  const endsWithin24h =
    discount?.end_date &&
    new Date(discount.end_date).getTime() - Date.now() <= 24 * 60 * 60 * 1000;

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <p className="text-theme text-p pb-[25px] pt-[20px] md:pt-0">
        Leatest Style <span className="text-[#BCBCBC]"> | </span> Express
        Shipping
      </p>
      <h1 className="text-[24px] uppercase">
        {activeVariant?.brand_id?.name || "No Brand"}
      </h1>
      <p className="text-p text-light pb-[12px] lowercase capitalize">
        {product.name}
      </p>

      <div className="flex items-center gap-[15px] text-14 sec-text-color mb-[25px]">
        <span className="flex items-center gap-[5px] border border-[#CECDCD] text-black px-2 py-[3px] rounded-[2px] font-18 font-medium">
          {reviewData.average}{" "}
          <Star size={14} fill="currentColor" className="text-yellow-500" />
        </span>
        <span>Based on {reviewData.total} Ratings</span>
      </div>

      <div className="pb-[33px] border-dashed border-b light-border">
        <div className="flex items-center gap-2 justify-left mb-1">
          {hasDiscount && (
            <>
              <span className="bg-theme text-theme text-[12px] md:text-[15px] px-2 py-1 rounded font-bold">
                {discount?.type === "percentage"
                  ? `${discount?.value || 0}% OFF`
                  : `₹${discount?.value || 0} OFF`}
              </span>
              {endsWithin24h ? (
                <CountdownTimer endDate={discount.end_date} />
              ) : (
                <span className="text-theme text-[12px] md:text-[15px] font-bold">
                  Limited time deal
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center">
          <p className="text-[26px] text-black">
            ₹{discountedPrice.toLocaleString("en-IN")}
          </p>
        </div>
        {discountValue > 0 && (
          <p className="sec-text-color">
            MRP{" "}
            <span className="line-through">
              ₹{originalPrice.toLocaleString("en-IN")}
            </span>{" "}
            Inclusive of all taxes
          </p>
        )}
      </div>

      <div className="pt-[34px] space-y-[28px]">
        <div className="flex items-center justify-between">
          <span className="text-[24px]">Select Size</span>
        </div>

        <div className="flex flex-wrap gap-[13px]">
          {sizesForSelectedColor.map((v) => {
            const outOfStock = v.stock_quantity === 0;
            return (
              <div key={v._id} className="flex flex-col items-center">
                <button
                  disabled={outOfStock}
                  onClick={() => !outOfStock && setSelectedSize(v.size_id._id)}
                  className={`text-black w-[65px] py-[6px] rounded-[20px] text-[16px] transition-all
                    ${
                      selectedSize === v.size_id._id
                        ? "border border-black bg-black text-white"
                        : "border light-border"
                    }
                    ${outOfStock ? "cursor-not-allowed opacity-50" : ""}
                  `}
                >
                  {v.size_id.name}
                </button>
                {outOfStock && (
                  <span className="text-[12px] sec-text-color mt-[3px]">
                    Sold Out
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-[17px] pt-[10px]">
          <Button
            variant="outline"
            className="flex items-center gap-[10px] !text-[22px] !py-[10px]"
            onClick={() => handleAddToWishlist(product, activeVariant)}
          >
            <HeartIcon className="h-[22px] w-[22px]" />
            Wishlist
          </Button>
          <Button
            variant="common"
            className="w-full !text-[22px] flex items-center gap-[10px] !py-[10px]"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <span className="flex items-center gap-[10px]">
              <Handbag size={22} />
              {addingToCart ? "Adding..." : "Add To Bag"}
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
