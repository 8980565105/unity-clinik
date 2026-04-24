import { useEffect, useMemo, useState, useCallback } from "react";
import { Handbag, Star } from "lucide-react";
import Button from "../ui/Button";
import { Link, useNavigate } from "react-router-dom";
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
import { getImageUrl } from "../utils/helper";

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
  const { productReviews } = useSelector((state) => state.reviews);

  const reviewData = useMemo(() => {
    const reviews = productReviews?.[product?._id]?.reviews || [];
    if (reviews.length === 0) return { average: 0, total: 0 };
    const total = reviews.length;
    const sum = reviews.reduce(
      (acc, curr) => acc + (Number(curr.rating) || 0),
      0,
    );
    return { average: (sum / total).toFixed(1), total };
  }, [productReviews, product?._id]);

  const [selectedSize, setSelectedSize] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);

  // const sizesForSelectedColor = useMemo(() => {
  //   return product?.variants || [];
  // }, [product]);

  const selectAgeSection = (product?.sections || []).find(
    (sec) =>
      sec.type === "Select your age" &&
      (sec.data?.status === true || sec.data?.status === undefined),
  );
  const [selectedAge, setSelectedAge] = useState(null);

  const scalpSection = (product?.sections || []).find(
    (sec) =>
      sec.type === "Select your scalp type" &&
      (sec.data?.status === true || sec.data?.status === undefined),
  );

  const [selectedScalp, setSelectedScalp] = useState(null);

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
      setActiveVariant(firstAvailable);
      setSelectedVariant(firstAvailable);
    }
  }, [selectedColor, product?.variants, setSelectedVariant]);

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

      <div className="mt-[15px] space-y-[28px]">
        {scalpSection && (scalpSection.data?.items || []).length > 0 && (
          <div className="space-y-[16px]">
            <h3 className="text-[18px] font-semibold">
              {scalpSection.data?.title || "Select your scalp type"}
            </h3>

            <div className="gap-2 flex flex-wrap ">
              {(scalpSection.data?.items || []).map((item, i) => {
                const productId =
                  typeof item.product_id === "object"
                    ? item.product_id?._id
                    : item.product_id;
                const hasLink =
                  productId && productId !== "" && productId !== "none";

                const cardContent = (
                  <div className="flex flex-col items-center h-full w-20">
                    <div
                      className={`flex items-center justify-center relative w-20 h-20 max-md:w-14 max-md:h-14 rounded-xl border ${
                        !hasLink && selectedScalp === i
                          ? "border-primary text-primary border-2"
                          : "border-brand-primary"
                      }`}
                    >
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="p-2 text-center flex-1 flex flex-col justify-center">
                      <p
                        className={`text-sm font-semibold mb-0.5
                         ${
                           selectedScalp === i
                             ? "text-primary"
                             : "text-black"
                         }`}
                      >
                        {item.name}
                      </p>
                    </div>
                  </div>
                );

                return hasLink ? (
                  <Link
                    key={i}
                    to={`/products/${productId}`}
                    className="cursor-pointer transition-all duration-200"
                  >
                    {cardContent}
                  </Link>
                ) : (
                  <div
                    key={i}
                    onClick={() => setSelectedScalp(i)}
                    className="cursor-pointer transition-all duration-200"
                  >
                    {cardContent}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectAgeSection &&
          (selectAgeSection.data?.items || []).length > 0 && (
            <div className="space-y-[16px]">
              <span className="text-[18px] font-semibold">
                {selectAgeSection.data?.title || "Select your age"}
              </span>

              <div className="flex gap-[10px] flex-wrap">
                {(selectAgeSection.data?.items || []).map((item, i) => {
                  const productId =
                    typeof item.product_id === "object"
                      ? item.product_id?._id
                      : item.product_id;
                  const hasLink =
                    productId && productId !== "" && productId !== "none";

                  const btn = (
                    <button
                      onClick={() => !hasLink && setSelectedAge(i)}
                      className={`
        min-w-[80px] h-[40px] px-[14px]
        flex items-center justify-center
        rounded-[10px] text-[14px] font-medium
        border transition-all duration-200
        ${
          selectedAge === i
            ? "bg-primary text-white border-[#0B5ED7]"
            : "bg-white text-gray-700 border-black hover:border-primary hover:border-2"
        }
      `}
                    >
                      {item.name}
                    </button>
                  );

                  return hasLink ? (
                    <Link key={i} to={`/products/${productId}`}>
                      {btn}
                    </Link>
                  ) : (
                    <div key={i}>{btn}</div>
                  );
                })}
              </div>

              {selectedAge !== null &&
                selectAgeSection.data?.items?.[selectedAge]?.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {selectAgeSection.data.items[selectedAge].description}
                  </p>
                )}
            </div>
          )}

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
