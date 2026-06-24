import { useState, useEffect, useCallback, useMemo } from "react";
import { getImageUrl } from "../utils/helper";
import { Link } from "react-router-dom";
import { useAddToWishlist } from "../wishlist/handleAddTowishlist";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart,
  createCart,
  fetchCart,
  updateCartItem,
  deleteCartItem,
} from "../../features/cart/cartThunk";
import { updateLocalQuantity } from "../../features/cart/cartSlice";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import StarRating from "../reviews/starrating";

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

export default function ProductCard({
  product,
  productLabels,
}) {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.cart);
  const { items = [] } = useSelector((state) => state.cart);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null);

  const labelData = product?.variants?.[0]?.labelsInfo?.[0] || null;
  const cartItem = useMemo(() => {
    if (!product?._id) return null;
    return (
      items.find(
        (item) =>
          item.product_id?._id === product._id ||
          item.product_id === product._id,
      ) || null
    );
  }, [items, product]);

  const cartQuantity = cartItem?.quantity || 0;

  const getPriceData = (product) => {
    const variant = product?.variants?.[0];
    const originalPrice = variant?.price || 0;
    const offerPrice = variant?.offerprice || originalPrice;
    let discountPercent = 0;
    if (originalPrice > offerPrice) {
      const rawDiscount = ((originalPrice - offerPrice) / originalPrice) * 100;
      const decimal = rawDiscount % 1;
      discountPercent =
        decimal >= 0.5 ? Math.ceil(rawDiscount) : Math.floor(rawDiscount);
    }
    return { originalPrice, offerPrice, discountPercent };
  };

  const reviewData = useMemo(() => {
    return {
      average: product?.reviewStats?.average || 0,
      total: product?.reviewStats?.total || 0,
    };
  }, [product]);


  const displayedImage = product?.images
    ? getImageUrl(product.images)
    : "/placeholder.png";

  const wishlistProductIds = useSelector((state) => state.wishlist.productIds);

  const getVariantForColor = (product, colorCode) => {
    return (
      product?.variants?.find((v) =>
        v.color?.some((c) => c.code === colorCode),
      ) || product?.variants?.[0]
    );
  };

  const currentVariant =
    getVariantForColor(product, selectedColor) || product?.variants?.[0];
  const isOutOfStock = currentVariant?.stock_quantity === 0;
  const priceData = getPriceData(product);

  const handleAddToCart = async () => {
    const variant = currentVariant;
    if (!variant?._id) return toast.error("Variant not found!");
    if (isOutOfStock) return toast.error("This product is out of stock!");

    setAddingToCart(true);
    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");

      if (!cartId) {
        const newCart = await dispatch(createCart()).unwrap();
        cartId = newCart._id;
      }

      await dispatch(
        addToCart({
          cart_id: cartId,
          product_id: product._id,
          variant_id: variant._id,
          quantity: 1,
        }),
      ).unwrap();

      await dispatch(fetchCart());
      toast.success("cart updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleIncrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const cartId = cart?._id || localStorage.getItem("cart_id");
    if (!cartId) return;
    const newQty = cartItem.quantity + 1;
    if (newQty > 20) {
      toast.error("Maximum 20 quantity allowed per item");
      return;
    }
    toast.success("Cart updated successfully!");
    dispatch(updateLocalQuantity({ item_id: cartItem._id, quantity: newQty }));
    dispatch(
      updateCartItem({
        cart_id: cartId,
        item_id: cartItem._id,
        quantity: newQty,
      }),
    )
      .unwrap()
      .catch(() =>
        dispatch(
          updateLocalQuantity({
            item_id: cartItem._id,
            quantity: cartItem.quantity,
          }),
        ),
      );
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!cartItem) return;
    const cartId = cart?._id || localStorage.getItem("cart_id");
    if (!cartId) return;

    if (cartItem.quantity <= 1) {
      dispatch(deleteCartItem({ cart_id: cartId, item_id: cartItem._id }))
        .unwrap()
        .then(() => dispatch(fetchCart()));
    } else {
      const newQty = cartItem.quantity - 1;
      toast.success("Cart updated successfully!");
      dispatch(
        updateLocalQuantity({ item_id: cartItem._id, quantity: newQty }),
      );
      dispatch(
        updateCartItem({
          cart_id: cartId,
          item_id: cartItem._id,
          quantity: newQty,
        }),
      )
        .unwrap()
        .catch(() =>
          dispatch(
            updateLocalQuantity({
              item_id: cartItem._id,
              quantity: cartItem.quantity,
            }),
          ),
        );
    }
  };

  return (
    <>
      <Link to={`/products/${product._id}`} aria-label="View product">
        <div className="border border-1 p-1 md:p-3 w-full transition-all group bg-white h-full">
          <div className="relative">
            {labelData && (
              <div
                className="absolute z-10 text-white px-2 py-1 text-[12px] rounded"
                style={{
                  backgroundColor: labelData.color,
                }}
              >
                {labelData.name}
              </div>
            )}

            <img
              src={displayedImage}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          <div className="mt-3 flex flex-col flex-grow">
            <p className="text-[12px] md:text-[16px] font-semibold line-clamp-2 h-[40px] leading-[20px] text-left">
              {product.name}
            </p>
            <div className="h-[22px]">
              {reviewData.total > 0 && (
                <StarRating
                  rating={Number(reviewData.average)}
                  total={reviewData.total}
                />
              )}
            </div>

            <div className="mt-1">
              <div className="flex gap-2">
                <p className="text-[14px] md:text-[18px] font-semibold text-black">
                  ₹{priceData.offerPrice}
                </p>
                {priceData.discountPercent > 0 && (
                  <p className="line-through text-gray-400 text-[12px] md:text-[16px]">
                    ₹{priceData.originalPrice}
                  </p>
                )}
              </div>
              {priceData.discountPercent > 0 && (
                <div className="text-primary text-left text-[12px] md:text-[14px]">
                  {priceData.discountPercent}% OFF
                </div>
              )}
            </div>

            {cartQuantity === 0 ? (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleAddToCart();
                }}
                disabled={addingToCart || isOutOfStock}
                variant="common"
                aria-label="add to cart"
                className="mt-3 rounded-[12px] !text-[12px] !md:text-[18px] !text-nowrap w-full border text-primary hover:text-white flex items-center justify-center gap-2 transition"
              >
                {addingToCart
                  ? "Adding..."
                  : isOutOfStock
                    ? "Out of Stock"
                    : "ADD"}
              </Button>
            ) : (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="mt-3 w-full border border-primary rounded-[12px] flex items-center justify-between overflow-hidden"
              >
                <button
                  onClick={handleDecrease}
                  aria-label="quntity"
                  className="flex-1 text-primary py-1 px-2 md:py-2 transition text-xl font-bold border-r border-primary"
                >
                  −
                </button>
                <span className="flex-1 text-center text-[15px] font-semibold text-black px-3">
                  {cartQuantity}
                </span>
                <button
                  aria-label="quntity"
                  onClick={handleIncrease}
                  disabled={cartQuantity >= 20}
                  className="flex-1 text-primary py-1 md:py-2 px-2 border-l border-primary transition text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>
      </Link>
    </>
  );
}
