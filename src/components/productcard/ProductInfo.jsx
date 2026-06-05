import { useEffect, useMemo, useState, useRef } from "react";
import { Handbag, Star } from "lucide-react";
import Button from "../ui/Button";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

const LS_KEY = "product_step_selections";
const saveStepSelection = (stepIndex, slug) => {
  if (!slug || slug.trim() === "") return;
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    existing[`step_${stepIndex}`] = slug.trim();
    localStorage.setItem(LS_KEY, JSON.stringify(existing));
  } catch (_) {}
};

const getStepSelectedSlug = (stepIndex) => {
  try {
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    return existing[`step_${stepIndex}`] || "";
  } catch (_) {
    return "";
  }
};

const isVariantSelectedForStep = (variant, stepIndex, currentProductId) => {
  const variantSlug = variant.slug?.trim();

  if (variantSlug && variantSlug !== "") {
    const savedSlug = getStepSelectedSlug(stepIndex);
    return savedSlug === variantSlug;
  }

  const pid =
    typeof variant.product_id === "object"
      ? variant.product_id?._id
      : variant.product_id;
  if (!pid || pid === "" || pid === "none" || pid === null) return false;
  return String(pid) === String(currentProductId);
};

const getVariantLink = (variant) => {
  const pid =
    typeof variant.product_id === "object"
      ? variant.product_id?._id
      : variant.product_id;
  if (pid && pid !== "" && pid !== "none" && pid !== null) {
    return `/products/${pid}`;
  }
  return "#";
};

const autoSaveCurrentProductSlug = (product) => {
  if (!product?.slug) return;
  const currentSlug = product.slug;

  const steps =
    product?.sections?.find((s) => s.type === "Multi Step Selection")?.data
      ?.steps || [];

  let nonPackStepIndex = 0;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.display_type === "Pack") continue;

    const matchedVariant = (step.variants || []).find(
      (v) => v.slug?.trim() === currentSlug,
    );
    if (matchedVariant) {
      saveStepSelection(nonPackStepIndex, currentSlug);
      break;
    }
    nonPackStepIndex++;
  }
};

export default function ProductInfo({
  product,
  setSelectedVariant,
  selectedColor,
  setSelectedColor,
  setShowLoginPopup,
  setShowStickyBar,
  setPriceData,
  setSelectedPack,
  setActiveVariant,
  setAddingToCart,
  setHandleAddToCartFn,
  setHandleAddToWishlistFn,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentProductId = product?._id;

  const [selectionTick, setSelectionTick] = useState(0);
  const actionButtonsRef = useRef(null);
  useEffect(() => {
    if (product) {
      autoSaveCurrentProductSlug(product);
      setSelectionTick((t) => t + 1);
    }
  }, [product?._id]);

  const [selectedPackState, setSelectedPackState] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [addingToCartstate, setAddingToCartstat] = useState(false);
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

  const [activeVariantState, setActiveVariantState] = useState(null);

  useEffect(() => {
    const packStep = product?.sections
      ?.find((s) => s.type === "Multi Step Selection")
      ?.data?.steps?.find((step) => step.display_type === "Pack");

    if (packStep?.variants?.length) {
      const defaultPack =
        packStep.variants.find((v) => Number(v.badge) === 1) ||
        packStep.variants[0];
      setSelectedPackState(defaultPack);
    }
  }, [product]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0];
      setSelectedColor(first.color_id?._id || null);
      setActiveVariantState(first);
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
      setActiveVariantState(firstAvailable);
      setSelectedVariant(firstAvailable);
    }
  }, [selectedColor, product?.variants, setSelectedVariant]);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setShowStickyBar(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      {
        threshold: 0.2,
      },
    );

    if (actionButtonsRef.current) {
      observer.observe(actionButtonsRef.current);
    }

    return () => observer.disconnect();
  }, [setShowStickyBar]);

  const getPriceData = () => {
    const originalPrice =
      selectedPackState?.price || activeVariantState?.price || 0;
    const offerPrice =
      selectedPackState?.offerprice ||
      activeVariantState?.offerprice ||
      originalPrice;
    let discountPercent = 0;
    if (originalPrice > offerPrice) {
      discountPercent = Math.round(
        ((originalPrice - offerPrice) / originalPrice) * 100,
      );
    }
    return { originalPrice, offerPrice, discountPercent };
  };

  const priceData = getPriceData();

  useEffect(() => {
    setPriceData?.({
      originalPrice: selectedPackState?.price || activeVariantState?.price || 0,

      offerPrice:
        selectedPackState?.offerprice || activeVariantState?.offerprice || 0,

      discountPercent:
        selectedPackState?.price > 0
          ? Math.round(
              ((selectedPackState.price - selectedPackState.offerprice) /
                selectedPackState.price) *
                100,
            )
          : 0,
    });
  }, [selectedPackState, activeVariantState]);

  const handleVariantClick = (variant, nonPackStepIndex) => {
    const slug = variant.slug?.trim();
    if (slug && slug !== "") {
      saveStepSelection(nonPackStepIndex, slug);
      setSelectionTick((t) => t + 1);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    if (activeVariantState?.stock_quantity === 0) {
      toast.error("This variant is out of stock!");
      return;
    }
    setAddingToCartstat(true);
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

      const payload = {
        cart_id: cartId,
        product_id: product._id,
        variant_id: activeVariantState._id,
        quantity: 1,
        pack_of: Number(selectedPackState?.badge || 1),
        price: Number(selectedPackState?.offerprice || 0),
        original_price: Number(selectedPackState?.price || 0),
      };

      await dispatch(addToCart(payload)).unwrap();
      await dispatch(fetchCart(cartId));
      navigate("/cart");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.message || "Failed to add item to cart. Please try again.";
      toast.error(msg);
    } finally {
      setAddingToCartstat(false);
    }
  };

  const { handleAddToWishlist } = useAddToWishlist(setShowLoginPopup);

  useEffect(() => {
    setHandleAddToCartFn?.(() => handleAddToCart);

    setHandleAddToWishlistFn?.(() => handleAddToWishlist);
  }, [activeVariantState, selectedPackState, cart, token, product]);

  const renderSteps = () => {
    const allSteps = (product?.sections || [])
      .filter(
        (s) =>
          s.type === "Multi Step Selection" &&
          (s.data?.status === true || s.data?.status === undefined),
      )
      .flatMap((s) =>
        (s.data?.steps || []).filter(
          (step) => step?.status === true || step?.status === undefined,
        ),
      );

    let nonPackStepIndex = 0;

    return allSteps.map((step, stepIdx) => {
      const uiType = step?.display_type || "Text";
      const isPack = uiType === "Pack";

      const currentNonPackIndex = isPack ? -1 : nonPackStepIndex;
      if (!isPack) nonPackStepIndex++;

      return (
        <div key={stepIdx} className="mb-8">
          <h3 className="text-[18px] md:text-[22px] font-bold mb-4">
            {step.title}
          </h3>
          {step.description && (
            <p className="text-gray-600 mb-4">{step.description}</p>
          )}

          {uiType === "Text" && (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-max pb-2">
                {(step?.variants || []).map((variant, variantIdx) => {
                  const link = getVariantLink(variant);
                  const isSelected = isVariantSelectedForStep(
                    variant,
                    currentNonPackIndex,
                    currentProductId,
                  );
                  return (
                    <Link
                      key={variantIdx}
                      to={link}
                      onClick={() =>
                        handleVariantClick(variant, currentNonPackIndex)
                      }
                    >
                      <button
                        className={`min-w-[130px] h-[52px] px-5 rounded-[14px]
                        border font-semibold text-[16px] transition-all duration-300
                        ${
                          isSelected
                            ? "bg-[#005BAA] text-white border-[#005BAA]"
                            : "bg-white text-[#005BAA] border-[#005BAA]"
                        }`}
                      >
                        {variant.title}
                      </button>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {uiType === "Text with img" && (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-max pb-2">
                {(step?.variants || []).map((variant, variantIdx) => {
                  const link = getVariantLink(variant);
                  const isSelected = isVariantSelectedForStep(
                    variant,
                    currentNonPackIndex,
                    currentProductId,
                  );
                  return (
                    <Link
                      key={variantIdx}
                      to={link}
                      className="flex-shrink-0"
                      onClick={() =>
                        handleVariantClick(variant, currentNonPackIndex)
                      }
                    >
                      <div className="w-[105px] text-center cursor-pointer">
                        <div
                          className={`rounded-[14px] border p-[6px]
                          transition-all duration-300 overflow-hidden
                          ${isSelected ? "border-[#005BAA]" : "border-[#DADADA]"}`}
                        >
                          <div className="bg-[#EAF4FC] rounded-[10px] overflow-hidden">
                            <img
                              src={getImageUrl(variant.image)}
                              alt={variant.title}
                              className="w-full h-[92px] object-cover"
                            />
                          </div>
                        </div>
                        <div className="mt-2">
                          <p
                            className={`text-[15px] font-semibold leading-[20px]
                            ${isSelected ? "text-[#005BAA]" : "text-black"}`}
                          >
                            {variant.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {uiType === "Upgrade Product" && (
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-4 min-w-max pb-2">
                {(step?.variants || []).map((variant, variantIdx) => {
                  const link = getVariantLink(variant);
                  const isSelected = isVariantSelectedForStep(
                    variant,
                    currentNonPackIndex,
                    currentProductId,
                  );
                  return (
                    <Link
                      key={variantIdx}
                      to={link}
                      className="flex-shrink-0"
                      onClick={() =>
                        handleVariantClick(variant, currentNonPackIndex)
                      }
                    >
                      <div
                        className={`w-[150px] rounded-[18px] overflow-hidden border
                        transition-all duration-300 cursor-pointer
                        ${
                          isSelected
                            ? "border-[#005BAA] border-2 shadow-md"
                            : "border-[#005BAA]"
                        }`}
                      >
                        <div className="bg-[#EAF4FC] h-[115px] overflow-hidden">
                          <img
                            src={getImageUrl(variant.image)}
                            alt={variant.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div
                          className={`px-3 py-3 min-h-[72px]
                          flex items-center justify-center text-center transition-all
                          ${
                            isSelected
                              ? "bg-[#005BAA] text-white"
                              : "bg-white text-black"
                          }`}
                        >
                          <p className="text-[15px] font-semibold leading-[22px]">
                            {variant.title}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {uiType === "Pack" && (
            <div className="mt-2">
              <h3 className="text-[34px] font-semibold mb-5">
                Size : Pack of {selectedPackState?.badge || 1}
              </h3>
              <div className="overflow-x-auto scrollbar-hide">
                <div className="flex gap-6 min-w-max pb-2">
                  {(step?.variants || []).map((variant, variantIdx) => {
                    const savePercentage =
                      variant.price > 0
                        ? (
                            ((variant.price - variant.offerprice) /
                              variant.price) *
                            100
                          ).toFixed(1)
                        : 0;
                    const isPackSelected =
                      String(selectedPackState?.badge) ===
                      String(variant.badge);
                    return (
                      <div
                        key={variantIdx}
                        onClick={() =>
                          setSelectedPackState({
                            badge: variant.badge,
                            price: Number(variant.price),
                            offerprice: Number(variant.offerprice),
                            image: variant.image,
                          })
                        }
                        className={`w-[180px] rounded-[10px] bg-[#F8F8F8] border overflow-hidden
                        transition-all duration-300 cursor-pointer hover:shadow-lg
                        ${
                          isPackSelected
                            ? "border-[#18A84B] border-2"
                            : "border-[#D6D6D6]"
                        }`}
                      >
                        <div
                          className={`h-[30px] flex items-center justify-center text-white font-bold text-[14px]
                          ${isPackSelected ? "bg-[#18A84B]" : "bg-[#4A5568]"}`}
                        >
                          SAVE {savePercentage}%
                        </div>
                        <div className="h-[125px] flex items-center justify-center px-4 py-3">
                          <img
                            src={getImageUrl(variant.image)}
                            alt="pack"
                            className="max-h-[95px] object-contain"
                          />
                        </div>
                        <div className="px-3">
                          <div className="bg-[#17243D] text-white rounded-[5px] text-center py-[8px] font-semibold text-[16px]">
                            Pack of {variant.badge}
                          </div>
                        </div>
                        <div className="text-center py-3">
                          <p className="text-[#7B7B7B] text-[15px] line-through">
                            MRP: ₹{variant.price}
                          </p>
                          <h2 className="text-[38px] font-bold leading-none text-black mt-1">
                            ₹{variant.offerprice}
                          </h2>
                        </div>
                        {variantIdx === 1 && (
                          <div className="bg-[#18A84B] text-white text-center text-[15px] font-semibold py-[7px]">
                            Most Popular
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    });
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
              {activeVariantState?.ProductWeight || "-"}
            </span>
          </div>
          <div>
            <span className="font-bold">Height:</span>
            <span className="font-semibold ms-1">
              {activeVariantState?.ProductHeight || "-"}
            </span>
          </div>
          <div>
            <span className="font-bold">Length:</span>
            <span className="font-semibold ms-1">
              {activeVariantState?.ProductLength || "-"}
            </span>
          </div>
          <div>
            <span className="font-bold">Width:</span>
            <span className="font-semibold ms-1">
              {activeVariantState?.ProductWidth || "-"}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-[15px] space-y-[28px]">
        <div key={selectionTick}>{renderSteps()}</div>

        <div
          ref={actionButtonsRef}
          className="flex flex-col sm:flex-row gap-[17px] pt-[10px] hidden lg:flex "
        >
          <Button
            variant="outline"
            className="flex items-center gap-[10px] !text-[22px] !py-[10px]"
            // onClick={() => handleAddToWishlist(product, activeVariant)}
            onClick={() => handleAddToWishlist(product, activeVariantState)}
          >
            <HeartIcon className="h-[22px] w-[22px]" />
            Wishlist
          </Button>

          <Button
            variant="common"
            className="w-full !text-[22px] flex items-center gap-[10px] !py-[10px]"
            onClick={handleAddToCart}
            disabled={addingToCartstate}
          >
            <span className="flex items-center gap-[10px]">
              <Handbag size={22} />
              {addingToCartstate ? "Adding..." : "Add To Cart"}
            </span>
          </Button>
        </div>
      </div>
    </>
  );
}
