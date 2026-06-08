import { Link } from "react-router-dom";
import { getImageUrl } from "../utils/helper";
import { useSelector, useDispatch } from "react-redux";
import {
  addToCart,
  createCart,
  fetchCart,
  updateCartItem,
  deleteCartItem,
} from "../../features/cart/cartThunk";
import { updateLocalQuantity } from "../../features/cart/cartSlice";
import Button from "../ui/Button";

export default function OtherRecommendedCard({
  product,
  badge,
  subtitle,
  setShowLoginPopup,
}) {
  const dispatch = useDispatch();

  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const { items = [] } = useSelector((state) => state.cart);

  const cartItem = items.find(
    (item) =>
      item.product_id?._id === product._id || item.product_id === product._id,
  );

  const quantity = cartItem?.quantity || 0;

  const variant = product?.variants?.[0];

  const originalPrice = Number(variant?.price || 0);

  const offerPrice = Number(variant?.offerprice || originalPrice);

  const discount =
    originalPrice > offerPrice
      ? Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
      : 0;

  const image = product?.images?.startsWith("http")
    ? product.images
    : getImageUrl(product.images);

  const handleAdd = async () => {
    if (!token) {
      setShowLoginPopup(true);
      return;
    }

    let cartId = cart?._id || localStorage.getItem("cart_id");

    if (!cartId) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const newCart = await dispatch(
        createCart({ user_id: user._id }),
      ).unwrap();

      cartId = newCart._id;
    }

    await dispatch(
      addToCart({
        cart_id: cartId,
        product_id: product._id,
        variant_id: variant._id,
        quantity: 1,
      }),
    );

    dispatch(fetchCart(cartId));
  };

  const handleIncrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    const cartId = cart?._id || localStorage.getItem("cart_id");

    if (!cartId) return;

    const newQty = cartItem.quantity + 1;

    dispatch(
      updateLocalQuantity({
        item_id: cartItem._id,
        quantity: newQty,
      }),
    );

    dispatch(
      updateCartItem({
        cart_id: cartId,
        item_id: cartItem._id,
        quantity: newQty,
      }),
    )
      .unwrap()
      .catch(() => {
        dispatch(
          updateLocalQuantity({
            item_id: cartItem._id,
            quantity: cartItem.quantity,
          }),
        );
      });
  };

  const handleDecrease = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!cartItem) return;

    const cartId = cart?._id || localStorage.getItem("cart_id");

    if (!cartId) return;

    if (cartItem.quantity <= 1) {
      dispatch(
        deleteCartItem({
          cart_id: cartId,
          item_id: cartItem._id,
        }),
      )
        .unwrap()
        .then(() => dispatch(fetchCart(cartId)));
    } else {
      const newQty = cartItem.quantity - 1;

      dispatch(
        updateLocalQuantity({
          item_id: cartItem._id,
          quantity: newQty,
        }),
      );

      dispatch(
        updateCartItem({
          cart_id: cartId,
          item_id: cartItem._id,
          quantity: newQty,
        }),
      )
        .unwrap()
        .catch(() => {
          dispatch(
            updateLocalQuantity({
              item_id: cartItem._id,
              quantity: cartItem.quantity,
            }),
          );
        });
    }
  };

  return (
    <Link to={`/products/${product._id}`}>
      <div
        className="
    relative
    bg-white
    rounded-[24px]
    border
    border-[#e6e6e6]
    p-4
    pt-5
    h-full
    transition-all
    hover:shadow-md
  "
      >
        {badge && (
          <div
            className="
             absolute
      -top-3
      left-1/2
      -translate-x-1/2
      md:left-4
      md:translate-x-0
      bg-[#f2c318]
      text-black
      text-[13px]
      font-bold
      px-3
      py-1
      rounded-lg
      z-20"
          >
            {badge}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex justify-center md:block">
            <img
              src={image}
              alt={product.name}
              className="
          w-[110px]
          h-[110px]
          object-contain
          mx-auto
          md:mx-0
        "
            />
          </div>
          <div className="flex-1 flex flex-col">
            <h3
              className="
          text-[18px]
          font-medium
          leading-tight
          line-clamp-2
          h-[50px] md:h-auto
        "
            >
              {product.name}
            </h3>

            <div className="flex-cols md:flex-row items-center gap-2 mt-2">
              <div className="flex items-center ">
                <span className="font-bold text-[20px] md:text-[30px]">
                  ₹{offerPrice}
                </span>

                {originalPrice > offerPrice && (
                  <span className="line-through text-[#bdbdbd]">
                    ₹{originalPrice}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <span
                  className="
              bg-primary
              text-white
              text-xs
              px-2
              py-1
              rounded-md
            "
                >
                  {discount}% Off
                </span>
              )}
            </div>

            {subtitle && (
              <p
                className="
            text-primary
            font-semibold
            mt-2
            text-[16px]
          "
              >
                {subtitle}
              </p>
            )}

            <div className="mt-auto">
              {quantity === 0 ? (
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAdd();
                  }}
                  variant="common"
                  className="
             mt-3 rounded-[12px] w-full lg:w-[200px] border text-primary hover:text-white flex items-center justify-center gap-2 transition"
                >
                  ADD
                </Button>
              ) : (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="
             mt-3 w-[200px] border border-primary rounded-full flex items-center justify-between overflow-hidden
            "
                >
                  <Button
                    className="flex-1 text-primary transition text-xl font-bold border-r border-primary"
                    onClick={handleDecrease}
                  >
                    -
                  </Button>

                  <span className="flex-1 text-center text-[15px] font-semibold text-black px-5">
                    {quantity}
                  </span>

                  <Button
                    className="flex-1  text-primary border-l border-primary transition text-xl font-bold"
                    onClick={handleIncrease}
                  >
                    +
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
