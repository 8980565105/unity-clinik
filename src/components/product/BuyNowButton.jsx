import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addToCart,
  createCart,
  fetchCart,
} from "../../features/cart/cartThunk";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import { useState } from "react";

export default function BuyNowButton({
  product,
  activeVariantState,
  selectedPackState,
  setShowLoginPopup,
  className = "",
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const cart = useSelector((state) => state.cart.cart);
  const [loading, setLoading] = useState(false);

  // const handleBuyNow = async () => {
  //   // if (!token) {
  //   //   setShowLoginPopup(true);
  //   //   return;
  //   // }

  //   if (activeVariantState?.stock_quantity === 0) {
  //     toast.error("This product is out of stock!");
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     let cartId = cart?._id || localStorage.getItem("cart_id");
  //     if (!cartId) {
  //       const user = JSON.parse(localStorage.getItem("user") || "{}");
  //       if (!user?._id) {
  //         toast.error("User session expired. Please login again.");
  //         setShowLoginPopup(true);
  //         return;
  //       }
  //       const newCart = await dispatch(
  //         createCart({ user_id: user._id }),
  //       ).unwrap();
  //       cartId = newCart._id;
  //     }

  //     await dispatch(
  //       addToCart({
  //         cart_id: cartId,
  //         product_id: product._id,
  //         variant_id: activeVariantState._id,
  //         quantity: 1,
  //         pack_of: Number(selectedPackState?.badge || 1),
  //         price: Number(selectedPackState?.offerprice || 0),
  //         original_price: Number(selectedPackState?.price || 0),
  //       }),
  //     ).unwrap();

  //     await dispatch(fetchCart(cartId));
  //      toast.success("cart update successfully");
  //     navigate("/cart");
  //   } catch (err) {
  //     toast.error(
  //       typeof err === "string"
  //         ? err
  //         : err?.message || "Failed. Please try again.",
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleBuyNow = async () => {
    if (activeVariantState?.stock_quantity === 0) {
      toast.error("This product is out of stock!");
      return;
    }

    setLoading(true);

    try {
      let cartId = cart?._id || localStorage.getItem("cart_id");

      if (!cartId) {
        const newCart = await dispatch(createCart()).unwrap();

        cartId = newCart._id;

        if (cartId) {
          localStorage.setItem("cart_id", cartId);
        }
      }

      await dispatch(
        addToCart({
          cart_id: cartId,
          product_id: product._id,
          variant_id: activeVariantState._id,
          quantity: 1,
          pack_of: Number(selectedPackState?.badge || 1),
          price: Number(selectedPackState?.offerprice || 0),
          original_price: Number(selectedPackState?.price || 0),
        }),
      ).unwrap();

      await dispatch(fetchCart());

      toast.success("Cart updated successfully");
      navigate("/cart");
    } catch (err) {
      toast.error(
        typeof err === "string"
          ? err
          : err?.message || "Failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <Button
      onClick={handleBuyNow}
      variant="common"
      disabled={loading}
      className={`!w-full !text-[22px] flex items-center justify-center gap-[10px] !py-[10px] ${className}`}
    >
      {loading ? "Processing..." : "Buy Now"}
    </Button>
  );
}
