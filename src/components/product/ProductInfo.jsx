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
import toast from "react-hot-toast";
import { getImageUrl } from "../utils/helper";
import Offer from "./offerdescount";
import BuyNowButton from "./BuyNowButton";
import Sharelink from "./Sharelink";

const isVariantSelected = (variant, currentProductId) => {
  const pid =
    typeof variant.product_id === "object"
      ? variant.product_id?._id
      : variant.product_id;
  if (!pid || pid === "" || pid === "none" || pid === null) return false;
  if (!currentProductId) return false;
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
  setIsAddedToCartFn,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentProductId = product?._id;
  const actionButtonsRef = useRef(null);
  const [selectedPackState, setSelectedPackState] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [addingToCartstate, setAddingToCartstat] = useState(false);
  const { productReviews } = useSelector((state) => state.reviews);
  const [isAddedToCart, setIsAddedToCart] = useState(false);

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
      setSelectedPack?.(defaultPack);
    }
  }, [product]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const first = product.variants[0];
      setSelectedColor(first.color_id?._id || null);
      setActiveVariantState(first);
      setSelectedVariant(first);
      setActiveVariant?.(first);
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
      setActiveVariant?.(firstAvailable);
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

  useEffect(() => {
    setIsAddedToCart(false);
    setIsAddedToCartFn?.(false);
  }, [activeVariantState, selectedPackState]);

  const getPriceData = () => {
    const originalPrice =
      selectedPackState?.price || activeVariantState?.price || 0;
    const offerPrice =
      selectedPackState?.offerprice ||
      activeVariantState?.offerprice ||
      originalPrice;
    let discountPercent = 0;
    if (originalPrice > offerPrice) {
      discountPercent = Number(
        (((originalPrice - offerPrice) / originalPrice) * 100).toFixed(2),
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

  const handleGoToCart = () => {
    const userLS = JSON.parse(localStorage.getItem("user"));
    if (!userLS?._id) {
      setShowLoginPopup(true);
      return;
    }
    navigate("/cart");
  };


  const handleAddToCart = async () => {
    if (activeVariantState?.stock_quantity === 0) {
      toast.error("This product is out of stock!");
      return;
    }

    setAddingToCartstat(true);

    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");

      if (!cartId) {
        const newCart = await dispatch(createCart()).unwrap();

        cartId = newCart._id;

        if (cartId) {
          localStorage.setItem("cart_id", cartId);
        }
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

      await dispatch(fetchCart());

      toast.success("cart updated successfully!");
      setIsAddedToCart(true);
      setIsAddedToCartFn?.(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCartstat(false);
    }
  };

  useEffect(() => {
    setIsAddedToCart(false);
  }, [activeVariantState, selectedPackState]);

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

    return allSteps.map((step, stepIdx) => {
      const uiType = step?.display_type || "Text";

      return (
        <div key={stepIdx} className="mb-8">
          <h3 className="text-[18px] md:text-[22px] font-bold mb-4">
            {step.title}
          </h3>
          {step.description && (
            <p className="text-gray-600 mb-4">{step.description}</p>
          )}

          {uiType === "Text" && (
            <div className="">
              <div className="flex gap-x-3 gap-y-2 flex-wrap pb-2">
                {(step?.variants || []).map((variant, variantIdx) => {
                  const link = getVariantLink(variant);
                  const isSelected = isVariantSelected(
                    variant,
                    currentProductId,
                  );
                  return (
                    <Link key={variantIdx} to={link}>
                      <button
                        className={`px-3 py-2 rounded-[8px]
                        border font-semibold text-[16px] transition-all duration-300
                        ${
                          isSelected
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-primary border-primary hover:bg-primary hover:text-white"
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
            <div className="">
              <div className="flex gap-x-3 gap-y-2 flex-wrap pb-2">
                {(step?.variants || []).map((variant, variantIdx) => {
                  const link = getVariantLink(variant);
                  const isSelected = isVariantSelected(
                    variant,
                    currentProductId,
                  );
                  return (
                    <Link key={variantIdx} to={link} className="flex-shrink-0">
                      <div className="w-[105px] text-center cursor-pointer">
                        <div
                          className={`rounded-[14px] border p-[6px]
                          transition-all duration-300 overflow-hidden
                          ${isSelected ? "border-primary" : "border-gray-300"}`}
                        >
                          <div className="rounded-[10px] overflow-hidden">
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
                            ${isSelected ? "text-primary" : "text-black"}`}
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
            <div>
              <div className="flex gap-x-3 gap-y-2 flex-wrap items-stretch pb-2 justify-start">
                {(step?.variants || []).map((variant, variantIdx) => {
                  const link = getVariantLink(variant);
                  const isSelected = isVariantSelected(
                    variant,
                    currentProductId,
                  );

                  return (
                    <Link key={variantIdx} to={link} className="flex-shrink-0">
                      <div
                        className={`
            flex flex-col
            items-stretch
            w-[105px]
            h-full          
            border
            rounded-xl
            overflow-hidden
            transition-all duration-300
            ${
              isSelected
                ? "bg-primary border-primary text-white"
                : "bg-white border-primary text-black"
            }
          `}
                      >
                        <div className="w-full h-[110px] flex-shrink-0 flex items-center justify-center">
                          <img
                            src={getImageUrl(variant.image)}
                            alt={variant.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div
                          className={`
              flex-grow
              flex
              w-full
              p-1
              flex-col
              justify-center
              items-center
              text-center
              ${isSelected ? "bg-primary text-white" : "bg-white text-black"}
            `}
                        >
                          <p className="text-xs font-semibold break-words">
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
              <div className="">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pb-2">
                  {(step?.variants || []).map((variant, variantIdx) => {
                    const savePercentage =
                      variant.price > 0
                        ? (
                            ((variant.price - variant.offerprice) /
                              variant.price) *
                            100
                          ).toFixed(2)
                        : 0;
                    const isPackSelected =
                      String(selectedPackState?.badge) ===
                      String(variant.badge);
                    return (
                      <div
                        key={variantIdx}
                        onClick={() => {
                          const pack = {
                            badge: variant.badge,
                            price: Number(variant.price),
                            offerprice: Number(variant.offerprice),
                            image: variant.image,
                          };
                          setSelectedPackState(pack);
                          setSelectedPack?.(pack);
                        }}
                        className={`w-full rounded-[10px] bg-[#F8F8F8] border overflow-hidden
                        transition-all duration-300 cursor-pointer hover:shadow-lg
                        ${
                          isPackSelected
                            ? "border-[#18A84B] border-2"
                            : "border-[#D6D6D6]"
                        }`}
                      >
                        <div
                          className={`h-[30px]  flex items-center justify-center text-white font-bold text-[14px]
                          ${isPackSelected ? "bg-[#18A84B]" : "bg-[#4A5568]"}`}
                        >
                          SAVE {savePercentage}%
                        </div>
                        <div className="py-2 flex items-center justify-center">
                          <img
                            src={getImageUrl(variant.image)}
                            alt="pack"
                            className="max-h-[80px] object-contain"
                          />
                        </div>
                        <div className="px-3">
                          <div className="bg-[#17243D] text-white rounded-[5px] text-center py-[8px] font-semibold text-[14px] md:text-[18px]">
                            Pack of {variant.badge}
                          </div>
                        </div>
                        <div className="text-center py-3">
                          <p className="text-[#7B7B7B] text-[14px] md:text-[16px] line-through">
                            MRP: ₹{variant.price}
                          </p>
                          <h2 className="text-[20px] md:text-[30px] font-bold leading-none text-black mt-1">
                            ₹{variant.offerprice}
                          </h2>
                        </div>
                        {variantIdx === 1 && (
                          <div className="bg-[#18A84B] text-white text-center text-[12px] md:text-[15px] font-semibold py-[7px]">
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
    <div>
      <p className="text-theme pt-[20px] md:pt-0">{product.tag}</p>

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

      <div className="flex items-center justify-between text-14 sec-text-color my-[5px]">
        <span className="flex items-center gap-[5px] border border-[#CECDCD] text-black px-2 py-[3px] rounded-[2px] font-18 font-medium">
          {reviewData.average}{" "}
          <Star size={14} fill="currentColor" className="text-yellow-500" />
          <p className="text-gray-600 border-s-[2px] ps-1 border-gray-500">
            ({reviewData.total}) Ratings
          </p>
        </span>
        <div>
          <Sharelink product={product} />
        </div>
      </div>
      <Offer
        product={product}
        price={priceData.offerPrice}
        activeVariantState={activeVariantState}
        selectedPackState={selectedPackState}
        setShowLoginPopup={setShowLoginPopup}
      />

      <div className="border-dashed border-b-[2px] light-border my-5"></div>

      <div className="mt-[15px] space-y-[28px]">
        <div key={currentProductId}>{renderSteps()}</div>

        <div
          ref={actionButtonsRef}
          className="flex flex-col sm:flex-row gap-[17px] pt-[10px]"
        >
          <Button
            variant="outline"
            className="flex items-center gap-[10px] !text-[22px] !py-[10px]"
            onClick={() => handleAddToWishlist(product, activeVariantState)}
          >
            <HeartIcon className="h-[22px] w-[22px]" />
            Wishlist
          </Button>

          {/* <Button
            variant="common"
            className="w-full !text-[22px] flex items-center gap-[10px] !py-[10px] hidden lg:flex"
            onClick={async () => {
              await handleAddToCart();
            }}
            aria-label="add to cart"
            disabled={addingToCartstate}
          >
            <span className="flex items-center gap-[10px]">
              <Handbag size={22} />
              {addingToCartstate ? "Adding..." : "Add To Cart"}
            </span>
          </Button> */}
          <Button
            variant="common"
            className="w-full !text-[22px] flex items-center gap-[10px] !py-[10px] hidden lg:flex"
            onClick={async () => {
              if (isAddedToCart) {
                handleGoToCart();
              } else {
                await handleAddToCart();
              }
            }}
            aria-label="add to cart"
            disabled={addingToCartstate}
          >
            <span className="flex items-center gap-[10px]">
              <Handbag size={22} />
              {addingToCartstate
                ? "Adding..."
                : isAddedToCart
                  ? "Go to Cart"
                  : "Add To Cart"}
            </span>
          </Button>
        </div>
        <BuyNowButton
          product={product}
          activeVariantState={activeVariantState}
          selectedPackState={selectedPackState}
          className="!mt-2 hidden lg:flex"
        />
      </div>

      <div className="border-dashed border-b-[2px] light-border my-5"></div>
    </div>
  );
}
