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
import { getImageUrl } from "../utils/helper";

const getProductId = (item) => {
  const pid =
    typeof item.product_id === "object"
      ? item.product_id?._id
      : item.product_id;
  return pid && pid !== "" && pid !== "none" && pid !== null ? pid : null;
};

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

  const [activeVariant, setActiveVariant] = useState(null);
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

  const Selectyourconcern = (product?.sections || []).find(
    (sec) =>
      sec.type === "Select your concern" &&
      (sec.data?.status === true || sec.data?.status === undefined),
  );

  const [selectedScalp, setSelectedScalp] = useState(null);
  const [selectedConcern, setSelectedConcern] = useState(null);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0];
      setSelectedColor(first.color_id?._id || null);
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

  const getPriceData = (product) => {
    const variant = product?.variants?.[0];
    const originalPrice = variant?.price || 0;
    const offerPrice = variant?.offerprice || originalPrice;
    let discountPercent = 0;
    if (originalPrice > offerPrice) {
      const rawDiscount = ((originalPrice - offerPrice) / originalPrice) * 100;
      discountPercent = Math.floor(rawDiscount + 0.5);
    }
    return { originalPrice, offerPrice, discountPercent };
  };
  const priceData = getPriceData(product);

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

  const ScalpCard = ({ item, i, selectedIdx, onSelect }) => {
    const productId = getProductId(item);

    if (!productId) return null;

    const cardContent = (
      <div className="flex flex-col items-center h-full w-20">
        <div
          className={`flex items-center justify-center relative w-20 h-20 max-md:w-14 max-md:h-14 rounded-xl border ${
            selectedIdx === i
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
            className={`text-sm font-semibold mb-0.5 ${selectedIdx === i ? "text-primary" : "text-black"}`}
          >
            {item.name}
          </p>
        </div>
      </div>
    );

    return (
      <Link
        key={i}
        to={`/products/${productId}`}
        className="cursor-pointer transition-all duration-200"
      >
        {cardContent}
      </Link>
    );
  };

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <p className="text-theme pt-[20px] md:pt-0">
        No Side Effects <span className="text-[#BCBCBC]"> | </span> Clinically
        Tested
      </p>
      <p className="text-[24px] pb-[12px] lowercase capitalize font-bold">
        {product.name}
      </p>
      <div className="flex items-end gap-2">
        <span className="text-[26px] font-semibold text-black">
          ₹{priceData.offerPrice}
        </span>
        <div className="flex gap-2">
          {priceData.discountPercent > 0 && (
            <span className="line-through text-gray-400 text-[18px]">
              ₹{priceData.originalPrice}
            </span>
          )}
          {priceData.discountPercent > 0 && (
            <span className="text-green-600 text-[16px] font-medium">
              {priceData.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-[15px] text-14 sec-text-color my-[5px]">
        <span className="flex items-center gap-[5px] border border-[#CECDCD] text-black px-2 py-[3px] rounded-[2px] font-18 font-medium">
          {reviewData.average}{" "}
          <Star size={14} fill="currentColor" className="text-yellow-500" />
          <p className="text-gray-600 border-s-[2px] ps-1 border-gray-500">
            ({reviewData.total}) Ratings
          </p>
        </span>
      </div>

      <div className="pb-[30px] border-dashed border-b-[2px] light-border">
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-700">
          <div>
            <span className="font-bold">Weight:</span>
            <span className="font-semibold ms-1">
              {activeVariant?.ProductWeight || "-"}
            </span>
          </div>
          <div>
            <span className="font-bold">Height:</span>
            <span className="font-semibold ms-1">
              {activeVariant?.ProductHeight || "-"}
            </span>
          </div>
          <div>
            <span className="font-bold">Length:</span>
            <span className="font-semibold ms-1">
              {activeVariant?.ProductLength || "-"}
            </span>
          </div>
          <div>
            <span className="font-bold">Width:</span>
            <span className="font-semibold ms-1">
              {activeVariant?.ProductWidth || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-[15px] space-y-[28px]">
        {scalpSection &&
          (scalpSection.data?.items || []).some((item) =>
            getProductId(item),
          ) && (
            <div className="space-y-[16px]">
              <h3 className="text-[18px] font-semibold">
                {scalpSection.data?.title || "Select your scalp type"}
              </h3>
              <div className="gap-2 flex flex-wrap">
                {(scalpSection.data?.items || []).map((item, i) => {
                  const productId = getProductId(item);
                  if (!productId) return null;
                  return (
                    <Link
                      key={i}
                      to={`/products/${productId}`}
                      className="cursor-pointer transition-all duration-200"
                    >
                      <div className="flex flex-col items-center h-full w-20">
                        <div className="flex items-center justify-center relative w-20 h-20 max-md:w-14 max-md:h-14 rounded-xl border border-brand-primary">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="p-2 text-center flex-1 flex flex-col justify-center">
                          <p className="text-sm font-semibold mb-0.5 text-black">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        {selectAgeSection &&
          (selectAgeSection.data?.items || []).some((item) =>
            getProductId(item),
          ) && (
            <div className="space-y-[16px]">
              <span className="text-[18px] font-semibold">
                {selectAgeSection.data?.title || "Select your age"}
              </span>
              <div className="flex gap-[10px] flex-wrap">
                {(selectAgeSection.data?.items || []).map((item, i) => {
                  const productId = getProductId(item);
                  if (!productId) return null;
                  return (
                    <Link key={i} to={`/products/${productId}`}>
                      <button className="min-w-[80px] h-[40px] px-[14px] flex items-center justify-center rounded-[10px] text-[14px] font-medium border transition-all duration-200 bg-white text-gray-700 border-black hover:border-primary hover:border-2">
                        {item.name}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

        {Selectyourconcern &&
          (Selectyourconcern.data?.items || []).some((item) =>
            getProductId(item),
          ) && (
            <div className="space-y-[16px]">
              <h3 className="text-[18px] font-semibold">
                {Selectyourconcern.data?.title || "Select your concern"}
              </h3>
              <div className="gap-2 flex flex-wrap">
                {(Selectyourconcern.data?.items || []).map((item, i) => {
                  const productId = getProductId(item);
                  if (!productId) return null;
                  return (
                    <Link
                      key={i}
                      to={`/products/${productId}`}
                      className="cursor-pointer transition-all duration-200"
                    >
                      <div className="flex flex-col items-center h-full w-20">
                        <div className="flex items-center justify-center relative w-20 h-20 max-md:w-14 max-md:h-14 rounded-xl border border-brand-primary">
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <div className="p-2 text-center flex-1 flex flex-col justify-center">
                          <p className="text-sm font-semibold mb-0.5 text-black">
                            {item.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
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
